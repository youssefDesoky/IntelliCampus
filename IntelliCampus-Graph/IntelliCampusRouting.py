"""
Intelligent LMS — Course-Level Question Router  (v5, performance-optimized)

Changes vs v4:
  - PPR engine: instead of calling nx.pagerank() once per student (which
    rebuilds the graph's transition matrix every time), we now build the
    row-normalized transition matrix ONCE per interaction graph and reuse
    it across every student via fast numpy power-iteration. This is the
    single biggest win since route_new_question() can be called with
    hundreds of enrolled students.
  - Fixed a correctness bug: route_new_question() previously only READ
    from user_ppr_cache and never populated it on a miss, so any student
    not already cached silently got a PPR affinity of 0.0. It now fills
    the cache lazily using the shared PPR engine.
  - prerequisite_coverage(): required_prereqs (ancestor set) depended only
    on the question, not the student, but was recomputed inside the
    per-student loop. It's now computed once per question and reused.
  - ThresholdTuner.fit(): replaced the O(len(candidates) * n_validation)
    Python double loop (which could run TWICE on precision-floor fallback)
    with a single vectorized numpy sweep using sorted cumulative TP/FP/FN
    counts — O(n log n) instead of O(candidates * n).
  - All v4 public interfaces are preserved; no breaking changes to the
    FastAPI layer or function signatures.
"""

import threading
import networkx as nx
import numpy as np
from collections import OrderedDict
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from dataclasses import dataclass, field
from typing import Optional, List, Any, Tuple, Dict

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import tempfile
import os


# ──────────────────────────────────────────────────────────────────────────────
# DATA MODELS
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class Question:
    question_id: str
    text: str
    course_id: str
    difficulty: float = 0.5

    @property
    def topic_ids(self) -> list:
        return [self.course_id]


@dataclass
class Answer:
    answer_id: str
    question_id: str
    answerer_id: str
    upvotes: int = 0
    accepted: bool = False


@dataclass
class Student:
    student_id: str
    name: str
    performance: float = 0.0
    completed_topics: list = field(default_factory=list)


# ──────────────────────────────────────────────────────────────────────────────
# THRESHOLD TUNER  (vectorized)
# ──────────────────────────────────────────────────────────────────────────────

class ThresholdTuner:
    """
    Selects the cosine-similarity threshold that maximises F1 on a labeled
    validation set of question pairs.

    Performance note
    -----------------
    Instead of looping over every candidate threshold and recomputing
    precision/recall/F1 from scratch with Python sums (O(candidates * n)),
    we sort validation examples by similarity score once and use cumulative
    sums to derive TP/FP/FN for every threshold simultaneously. This also
    eliminates the old behaviour of re-running the entire sweep a second
    time when no candidate satisfied the precision floor.

    Parameters
    ----------
    candidates      Thresholds to evaluate, evenly spaced between 0 and 1.
                    Defaults to 100 values in [0.05, 0.95].
    target_precision  When set (0–1), only thresholds whose precision meets
                    this floor are eligible. Useful in production when false
                    positives (wrongly flagging a new question as a duplicate)
                    are more costly than false negatives.

    Usage
    -----
    tuner = ThresholdTuner(target_precision=0.90)
    best_threshold, metrics = tuner.fit(validation_pairs, vectorizer, matrix, archive)
    # metrics = {"threshold": 0.72, "f1": 0.84, "precision": 0.91, "recall": 0.78}
    """

    def __init__(
        self,
        candidates: Optional[list] = None,
        target_precision: Optional[float] = None,
    ):
        self.candidates       = candidates or list(np.linspace(0.05, 0.95, 100))
        self.target_precision = target_precision
        self.last_metrics: dict = {}

    # ── public API ────────────────────────────────────────────────────────────

    def fit(
        self,
        validation_pairs: list,
        vectorizer: TfidfVectorizer,
        archive_matrix,
        archive: list,
    ) -> tuple:
        """
        Find the best threshold given a labeled validation set.

        Parameters
        ----------
        validation_pairs    List of (Question, bool) tuples.
                            bool = True  → question IS a duplicate of something
                                            already in `archive`.
                            bool = False → question is genuinely new.
        vectorizer          Fitted TfidfVectorizer from DuplicateDetector.
        archive_matrix      Sparse TF-IDF matrix for the archived questions.
        archive             List of archived Question objects (same order as
                            archive_matrix rows).

        Returns
        -------
        (best_threshold: float, metrics: dict)
        metrics keys: threshold, f1, precision, recall
        (plus precision_floor_unmet=True if the floor couldn't be satisfied)
        """
        if not validation_pairs:
            raise ValueError("validation_pairs must not be empty.")

        questions, y_true_raw = zip(*validation_pairs)
        y_true = np.asarray([int(v) for v in y_true_raw], dtype=np.int64)

        # Pre-compute similarity scores for every validation question once.
        vecs = vectorizer.transform([q.text for q in questions])
        sims = cosine_similarity(vecs, archive_matrix)         # (n_val, n_archive)
        max_sims = sims.max(axis=1) if sims.shape[1] > 0 else np.zeros(len(questions))

        candidates = np.asarray(self.candidates, dtype=np.float64)

        # Sort validation examples by similarity DESCENDING. For any threshold
        # t, the predicted-positive set is exactly the prefix of this sorted
        # order containing all sims >= t. That lets us get TP/FP for every
        # threshold via one cumulative sum instead of one full pass per
        # threshold.
        order = np.argsort(-max_sims)
        sorted_sims = max_sims[order]
        sorted_labels = y_true[order]

        total_pos = int(y_true.sum())
        total_n = len(y_true)

        tp_cum = np.cumsum(sorted_labels)            # TP if cutoff at index i (inclusive)
        fp_cum = np.cumsum(1 - sorted_labels)         # FP if cutoff at index i (inclusive)

        # For each candidate threshold, find how many of the sorted (descending)
        # similarities are >= threshold. searchsorted needs ascending order,
        # so we search on the negated, ascending array.
        neg_sorted_sims = -sorted_sims
        cutoffs = np.searchsorted(neg_sorted_sims, -candidates, side="right")

        tp = np.where(cutoffs > 0, tp_cum[np.clip(cutoffs - 1, 0, total_n - 1)], 0)
        fp = np.where(cutoffs > 0, fp_cum[np.clip(cutoffs - 1, 0, total_n - 1)], 0)
        fn = total_pos - tp

        with np.errstate(divide="ignore", invalid="ignore"):
            precision = np.where((tp + fp) > 0, tp / np.maximum(tp + fp, 1), 0.0)
            recall    = np.where((tp + fn) > 0, tp / np.maximum(tp + fn, 1), 0.0)
            denom     = precision + recall
            f1        = np.where(denom > 0, 2 * precision * recall / np.maximum(denom, 1e-12), 0.0)

        if self.target_precision is not None:
            eligible = precision >= self.target_precision
        else:
            eligible = np.ones_like(f1, dtype=bool)

        floor_unmet = self.target_precision is not None and not eligible.any()

        if eligible.any():
            scored = np.where(eligible, f1, -1.0)
        else:
            # No candidate met the precision floor — fall back to best F1
            # across ALL candidates (no second Python pass needed; we
            # already have f1 for every threshold).
            scored = f1

        best_idx = int(np.argmax(scored))

        metrics = {
            "threshold": round(float(candidates[best_idx]), 4),
            "f1":        round(float(f1[best_idx]), 4),
            "precision": round(float(precision[best_idx]), 4),
            "recall":    round(float(recall[best_idx]), 4),
        }
        if floor_unmet:
            metrics["precision_floor_unmet"] = True

        self.last_metrics = metrics
        return float(candidates[best_idx]), metrics


# ──────────────────────────────────────────────────────────────────────────────
# BRANCH A  [Question That Has Been Asked Before]
# ──────────────────────────────────────────────────────────────────────────────

class DuplicateDetector:
    """
    TF-IDF cosine similarity against the archived question pool.

    Threshold can be set manually (as before) or tuned automatically from
    a labeled validation set via tune_threshold().
    """

    def __init__(self, threshold: float = 0.65):
        self.threshold  = threshold
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.archive: list  = []
        self._matrix        = None

    def index(self, questions: list) -> None:
        self.archive = questions
        if questions:
            self._matrix = self.vectorizer.fit_transform(
                [q.text for q in questions]
            )
        else:
            self._matrix = None

    def tune_threshold(
        self,
        validation_pairs: list,
        target_precision: Optional[float] = None,
        candidates: Optional[list] = None,
    ) -> dict:
        """
        Re-compute the best threshold from a labeled validation set and
        update self.threshold in-place.

        Parameters
        ----------
        validation_pairs    List of (Question, bool) — see ThresholdTuner.fit().
        target_precision    Optional precision floor (0–1). When set, only
                            thresholds that achieve at least this precision
                            are considered, trading some recall for fewer
                            false-positive duplicate flags.
        candidates          Custom list of threshold values to evaluate.
                            Defaults to 100 values in [0.05, 0.95].

        Returns
        -------
        metrics dict with keys: threshold, f1, precision, recall,
        and optionally precision_floor_unmet (bool) when the floor
        could not be satisfied by any candidate.

        Raises
        ------
        RuntimeError  if index() has not been called yet (no archive).
        ValueError    if validation_pairs is empty.
        """
        if self._matrix is None or not self.archive:
            raise RuntimeError(
                "DuplicateDetector must be indexed before threshold tuning. "
                "Call index() with archived questions first."
            )

        tuner = ThresholdTuner(
            candidates=candidates,
            target_precision=target_precision,
        )
        best_threshold, metrics = tuner.fit(
            validation_pairs, self.vectorizer, self._matrix, self.archive
        )
        self.threshold = best_threshold
        return metrics

    def find_duplicate(self, new_question: Question) -> Optional[Question]:
        if not self.archive or self._matrix is None:
            return None
        new_vec  = self.vectorizer.transform([new_question.text])
        sims     = cosine_similarity(new_vec, self._matrix).flatten()
        best_idx = int(np.argmax(sims))
        return self.archive[best_idx] if sims[best_idx] >= self.threshold else None


def rank_answerers(question: Question, answers: list, user_ppr: dict) -> list:
    """
    Rank students who previously answered `question` (or its duplicate).

    Scoring: 0.6 x normalised_quality + 0.4 x ppr_affinity
    """
    relevant = [a for a in answers if a.question_id == question.question_id]
    if not relevant:
        return []

    raw_quality  = {a.answerer_id: a.upvotes + 3 * int(a.accepted) for a in relevant}
    max_q        = max(raw_quality.values()) or 1
    norm_quality = {uid: v / max_q for uid, v in raw_quality.items()}

    topic_nodes = [f"topic:{t}" for t in question.topic_ids]
    results     = []

    for uid, quality in norm_quality.items():
        ppr      = user_ppr.get(uid, {})
        affinity = (
            float(np.mean([ppr.get(t, 0.0) for t in topic_nodes]))
            if topic_nodes else 0.0
        )
        score    = 0.6 * quality + 0.4 * affinity
        results.append((uid, round(score, 4), {
            "quality":      round(quality, 4),
            "raw_quality":  raw_quality[uid],
            "ppr_affinity": round(affinity, 4),
        }))

    results.sort(key=lambda x: x[1], reverse=True)
    return results


# ──────────────────────────────────────────────────────────────────────────────
# BRANCH B  [New Question Routing]
# ──────────────────────────────────────────────────────────────────────────────

def build_prerequisite_graph(prereq_edges: list) -> nx.DiGraph:
    G = nx.DiGraph()
    G.add_edges_from(prereq_edges)
    return G


def prerequisite_coverage_for_required(required_prereqs: set, student: Student) -> float:
    """
    Coverage given an already-computed required_prereqs set (see
    `_required_prereqs_for_question`). Split out so the expensive ancestor
    lookup happens once per question, not once per (question, student) pair.
    """
    if not required_prereqs:
        return 1.0
    covered = required_prereqs & set(student.completed_topics)
    return len(covered) / len(required_prereqs)


def _required_prereqs_for_question(question: Question, prereq_graph: nx.DiGraph) -> set:
    """
    Computes the set of prerequisite topics required for a question.
    This depends ONLY on the question (via its topic_ids), not on any
    student, so callers should compute it once per question and reuse it
    across the whole student loop instead of recomputing nx.ancestors()
    for every student.
    """
    required_prereqs = set()
    for course in question.topic_ids:
        if course in prereq_graph:
            required_prereqs.update(nx.ancestors(prereq_graph, course))
    return required_prereqs


def prerequisite_coverage(student: Student, question: Question,
                           prereq_graph: nx.DiGraph) -> float:
    """
    Kept for backwards compatibility / standalone use. Internally calls the
    split-out helpers. Prefer computing _required_prereqs_for_question()
    once per question when scoring many students (see route_new_question).
    """
    required_prereqs = _required_prereqs_for_question(question, prereq_graph)
    return prerequisite_coverage_for_required(required_prereqs, student)


def build_interaction_graph(interactions: list) -> tuple:
    ACTION_WEIGHT = {"like": 1.0, "comment": 1.5}
    G = nx.DiGraph()

    for rec in interactions:
        uid = f"user:{rec['student_id']}"
        tid = f"topic:{rec['course_id']}"
        pid = f"post:{rec.get('post_id', rec['course_id'])}"
        w   = ACTION_WEIGHT.get(rec.get("action"), 0.0)

        for node, ntype in [(uid, "user"), (tid, "topic"), (pid, "post")]:
            G.add_node(node, node_type=ntype)

        if w > 0:
            if G.has_edge(uid, tid):
                G[uid][tid]["weight"] += w
            else:
                G.add_edge(uid, tid, weight=w)

        G.add_edge(pid, tid, weight=1.0)
        G.add_edge(tid, pid, weight=1.0)

    return G, sorted(G.nodes)


MIN_PPR_FLOOR = 1e-4


def compute_ppr(G: nx.DiGraph, seed_node: str, alpha: float = 0.85) -> dict:
    """
    Kept for backwards compatibility / standalone single-query use.
    For routing many students against the same graph, use PPREngine
    below instead — it avoids rebuilding the transition matrix every call.
    """
    personalization = {n: (1.0 if n == seed_node else 0.0) for n in G.nodes}
    return nx.pagerank(G, alpha=alpha, personalization=personalization,
                       weight="weight")


class PPREngine:
    """
    Precomputes the row-normalized transition matrix for an interaction
    graph ONCE, then answers many personalized-PageRank queries against it
    via numpy power-iteration.

    Why this exists
    ----------------
    nx.pagerank() rebuilds the graph's sparse transition matrix internally
    on every call. route_new_question() previously called it once per
    enrolled student, which means the matrix build (the expensive part)
    was repeated N times for what is otherwise an O(iterations) numeric
    computation. With this engine, the matrix is built once per
    interaction graph and reused for every student's PPR query.

    Numerically this implements the same personalized PageRank as
    nx.pagerank(personalization={seed: 1.0, ...}, weight="weight"):
        r = alpha * P^T @ r + (1 - alpha) * s
    where P is the row-normalized weighted adjacency matrix and s is the
    one-hot seed vector.
    """

    def __init__(self, G: nx.DiGraph, alpha: float = 0.85,
                 max_iter: int = 100, tol: float = 1e-8):
        self.alpha = alpha
        self.max_iter = max_iter
        self.tol = tol
        self.nodes = list(G.nodes)
        self.index = {n: i for i, n in enumerate(self.nodes)}

        n = len(self.nodes)
        if n == 0:
            self._P = None
            return

        A = nx.to_scipy_sparse_array(
            G, nodelist=self.nodes, weight="weight", format="csr", dtype=np.float64
        )
        out_w = np.asarray(A.sum(axis=1)).flatten()
        # Dangling nodes (no outgoing weight) get a uniform distribution,
        # matching networkx's default dangling-node handling.
        dangling_mask = out_w == 0
        safe_out_w = np.where(dangling_mask, 1.0, out_w)
        inv = 1.0 / safe_out_w
        P = A.multiply(inv[:, None]).tocsr()
        self._P = P
        self._dangling_mask = dangling_mask
        self._n = n

    def query(self, seed_node: str) -> dict:
        if self._P is None or seed_node not in self.index:
            return {}

        n = self._n
        s = np.zeros(n, dtype=np.float64)
        s[self.index[seed_node]] = 1.0
        r = s.copy()
        dangling_weight = s  # redistribute dangling mass like nx.pagerank does

        PT = self._P.transpose()

        for _ in range(self.max_iter):
            dangling_sum = self.alpha * r[self._dangling_mask].sum()
            r_next = self.alpha * (PT @ r) + dangling_sum * dangling_weight + (1 - self.alpha) * s
            if np.abs(r_next - r).sum() < n * self.tol:
                r = r_next
                break
            r = r_next

        # normalize to sum to 1, matching nx.pagerank's convention
        total = r.sum()
        if total > 0:
            r = r / total
        return {node: float(r[i]) for node, i in self.index.items()}


def ppr_course_affinity(student_id: str, question: Question,
                        G: nx.DiGraph, alpha: float = 0.85) -> float:
    """
    Kept for backwards compatibility / standalone single-query use.
    """
    seed = f"user:{student_id}"
    if seed not in G:
        return 0.0
    ppr          = compute_ppr(G, seed, alpha)
    topic_scores = [ppr.get(f"topic:{t}", 0.0) for t in question.topic_ids]
    return float(np.mean(topic_scores)) if topic_scores else 0.0


DEFAULT_WEIGHTS = {"prereq": 0.40, "ppr": 0.35, "perf": 0.25}


def route_new_question(question: Question, students: list,
                       prereq_graph: nx.DiGraph, interaction_graph: nx.DiGraph,
                       weights: Optional[dict] = None,
                       user_ppr_cache: Optional[dict] = None,
                       ppr_engine: Optional[PPREngine] = None,
                       alpha: float = 0.85) -> list:
    """
    Parameters
    ----------
    ppr_engine   Optional precomputed PPREngine for interaction_graph. When
                provided, PPR for any student missing from user_ppr_cache is
                computed via fast shared-matrix power-iteration instead of
                nx.pagerank(), and the result is written back into
                user_ppr_cache (fixing the old "cache miss → silently 0.0"
                bug). If not provided, falls back to the slower per-student
                nx.pagerank() path for backwards compatibility.
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    # Required prerequisites depend only on the question — compute once,
    # not once per student.
    required_prereqs = _required_prereqs_for_question(question, prereq_graph)
    topic_nodes = [f"topic:{t}" for t in question.topic_ids]

    if ppr_engine is None and interaction_graph is not None and interaction_graph.number_of_nodes() > 0:
        # Build it once here so even callers who don't pass one in still
        # benefit from the shared-matrix speedup instead of nx.pagerank
        # being invoked per student.
        ppr_engine = PPREngine(interaction_graph, alpha=alpha)

    raw_results = []
    for student in students:
        prereq = prerequisite_coverage_for_required(required_prereqs, student)

        if user_ppr_cache is not None:
            ppr = user_ppr_cache.get(student.student_id)
            if ppr is None:
                # Lazily compute via the shared engine and cache it —
                # this is the fix for the old silent-zero bug.
                if ppr_engine is not None:
                    ppr = ppr_engine.query(f"user:{student.student_id}")
                else:
                    ppr = {}
                user_ppr_cache[student.student_id] = ppr
            ppr_score = (
                float(np.mean([ppr.get(t, 0.0) for t in topic_nodes]))
                if topic_nodes else 0.0
            )
        elif ppr_engine is not None:
            ppr = ppr_engine.query(f"user:{student.student_id}")
            ppr_score = (
                float(np.mean([ppr.get(t, 0.0) for t in topic_nodes]))
                if topic_nodes else 0.0
            )
        else:
            ppr_score = ppr_course_affinity(student.student_id, question,
                                            interaction_graph, alpha)

        perf = student.performance
        raw_results.append((
            student.student_id,
            {"prereq": prereq, "raw_ppr": ppr_score, "perf": perf}
        ))

    max_ppr = max((r[1]["raw_ppr"] for r in raw_results), default=MIN_PPR_FLOOR)
    max_ppr = max(max_ppr, MIN_PPR_FLOOR)

    scored = []
    for sid, bd in raw_results:
        norm_ppr = bd["raw_ppr"] / max_ppr
        final = (
            weights["prereq"] * bd["prereq"]
          + weights["ppr"]    * norm_ppr
          + weights["perf"]   * bd["perf"]
        )
        bd["norm_ppr"] = round(norm_ppr, 4)
        scored.append((sid, round(final, 4), bd))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored


# ──────────────────────────────────────────────────────────────────────────────
# UNIFIED ROUTER
# ──────────────────────────────────────────────────────────────────────────────

class CourseQuestionRouter:
    """
    Course-scoped question router. One instance per course.

    Threshold tuning
    ----------------
    Pass validation_pairs to fit() for automatic one-shot tuning at startup,
    or call tune_detector() manually (e.g. on a nightly schedule):

        router.tune_detector(
            validation_pairs  = labeled_pairs,  # List[(Question, bool)]
            target_precision  = 0.90,           # optional precision floor
        )

    The detector's threshold is updated in-place; no re-fitting is required.

    Performance
    -----------
    A single PPREngine is built once per fit() call (when an interaction
    graph exists) and reused for every /route call against that course,
    instead of recomputing nx.pagerank's transition matrix per student per
    request.

    Usage
    -----
    router = CourseQuestionRouter(
        course_id    = "machine_learning_101",
        prereq_edges = [("linear_algebra", "machine_learning_101"),
                        ("calculus",       "machine_learning_101")],
    )
    router.fit(
        interactions, archived_questions, answers, enrolled_students,
        validation_pairs = labeled_pairs,   # optional; tunes threshold if given
    )

    question = router.make_question("q99", "How does backpropagation work?")
    result   = router.route(question, top_n=3)
    """

    def __init__(
        self,
        course_id: str,
        prereq_edges: Optional[list] = None,
        sim_threshold: float = 0.65,
        alpha: float = 0.85,
        weights: Optional[dict] = None,
    ):
        self.course_id    = course_id
        self.prereq_graph = build_prerequisite_graph(prereq_edges or [])
        self.detector     = DuplicateDetector(threshold=sim_threshold)
        self.alpha        = alpha
        self.weights      = weights or DEFAULT_WEIGHTS.copy()

        self.interaction_graph: Optional[nx.DiGraph] = None
        self.students: list    = []
        self.answers:  list    = []
        self._user_ppr_cache: dict = {}
        self._ppr_engine: Optional[PPREngine] = None

    # ── helpers ──────────────────────────────────────────────────────────────

    def make_question(self, question_id: str, text: str,
                      difficulty: float = 0.5) -> Question:
        return Question(
            question_id = question_id,
            text        = text,
            course_id   = self.course_id,
            difficulty  = difficulty,
        )

    def _get_ppr(self, student_id: str) -> dict:
        """
        Compute PPR on demand and cache the result. Uses the shared
        PPREngine (built once in fit()) instead of calling nx.pagerank()
        directly, so the transition matrix is never rebuilt per student.
        """
        if student_id not in self._user_ppr_cache:
            seed = f"user:{student_id}"
            if self._ppr_engine is not None and seed in self._ppr_engine.index:
                self._user_ppr_cache[student_id] = self._ppr_engine.query(seed)
            else:
                self._user_ppr_cache[student_id] = {}
        return self._user_ppr_cache[student_id]

    # ── fit ──────────────────────────────────────────────────────────────────

    def fit(
        self,
        interactions: list,
        archived_questions: list,
        answers: list,
        students: list,
        validation_pairs: Optional[list] = None,
        target_precision: Optional[float] = None,
    ) -> None:
        """
        Initialise from historical data. Call once at startup or after a
        batch data refresh.

        Parameters
        ----------
        interactions        list of dicts:
                              student_id, course_id, action, post_id (optional)
        archived_questions  list of Question — filtered to this course internally
        answers             list of Answer for those questions
        students            list of Student enrolled in this course
        validation_pairs    Optional list of (Question, bool) labeled pairs.
                            When provided, threshold tuning is performed
                            automatically after indexing. True = duplicate.
        target_precision    Passed through to tune_detector() when
                            validation_pairs is provided.
        """
        course_questions    = [q for q in archived_questions
                               if q.course_id == self.course_id]
        course_interactions = [r for r in interactions
                               if r.get("course_id") == self.course_id]

        self.detector.index(course_questions)
        if course_interactions:
            self.interaction_graph, _ = build_interaction_graph(course_interactions)
        else:
            self.interaction_graph = nx.DiGraph()
        self.students = students
        self.answers  = answers

        # Reset cache and build the PPR engine ONCE for this graph. Every
        # subsequent _get_ppr() / route_new_question() call reuses this
        # engine's precomputed transition matrix instead of rebuilding it.
        self._user_ppr_cache = {}
        if self.interaction_graph.number_of_nodes() > 0:
            self._ppr_engine = PPREngine(self.interaction_graph, alpha=self.alpha)
        else:
            self._ppr_engine = None

        # Auto-tune threshold if a validation set was supplied.
        if validation_pairs:
            self.tune_detector(
                validation_pairs=validation_pairs,
                target_precision=target_precision,
            )

    # ── threshold tuning ─────────────────────────────────────────────────────

    def tune_detector(
        self,
        validation_pairs: list,
        target_precision: Optional[float] = None,
        candidates: Optional[list] = None,
    ) -> dict:
        """
        Re-tune the duplicate detector's threshold from labeled data and
        update it in-place. Safe to call periodically (e.g. nightly) without
        re-fitting the rest of the router.

        Parameters
        ----------
        validation_pairs    List of (Question, bool). True means the question
                            is a duplicate of something in the archive.
        target_precision    Optional precision floor. When set, only thresholds
                            achieving at least this precision are eligible,
                            reducing false-positive duplicate flags at the cost
                            of some recall.
        candidates          Custom sweep values. Defaults to 100 values in
                            [0.05, 0.95].

        Returns
        -------
        metrics dict — keys: threshold, f1, precision, recall.
        Includes precision_floor_unmet=True when the floor could not be met.

        Example
        -------
        metrics = router.tune_detector(
            validation_pairs = my_labeled_pairs,
            target_precision = 0.90,
        )
        print(f"New threshold: {metrics['threshold']}  "
              f"F1={metrics['f1']}  P={metrics['precision']}  R={metrics['recall']}")
        """
        return self.detector.tune_threshold(
            validation_pairs=validation_pairs,
            target_precision=target_precision,
            candidates=candidates,
        )

    # ── route ────────────────────────────────────────────────────────────────

    def route(self, question: Question) -> dict:
        """
        Route a question and return all ranked students.
        If a duplicate is detected but has no historical answerers,
        fall back to new-question routing.
        Raises ValueError if the question belongs to a different course.
        """
        if question.course_id != self.course_id:
            raise ValueError(
                f"Question course_id '{question.course_id}' does not match "
                f"router course_id '{self.course_id}'."
            )

        duplicate = self.detector.find_duplicate(question)

        if duplicate:
            # Lazily compute PPR for answerers of the duplicate question only
            answerer_ids = {a.answerer_id for a in self.answers
                            if a.question_id == duplicate.question_id}
            for sid in answerer_ids:
                self._get_ppr(sid)

            ranked = rank_answerers(duplicate, self.answers,
                                    self._user_ppr_cache)
            if not ranked:
                ranked = route_new_question(
                    question, self.students, self.prereq_graph,
                    self.interaction_graph, weights=self.weights,
                    user_ppr_cache=self._user_ppr_cache,
                    ppr_engine=self._ppr_engine, alpha=self.alpha,
                )
                return {
                    "branch":    "new",
                    "duplicate": duplicate,
                    "ranked":    ranked,
                }
            return {
                "branch":    "duplicate",
                "duplicate": duplicate,
                "ranked":    ranked,
            }

        ranked = route_new_question(
            question, self.students, self.prereq_graph,
            self.interaction_graph, weights=self.weights,
            user_ppr_cache=self._user_ppr_cache,
            ppr_engine=self._ppr_engine, alpha=self.alpha,
        )
        return {
            "branch":    "new",
            "duplicate": None,
            "ranked":    ranked,
        }


# ══════════════════════════════════════════════════════════════════════════════
# FASTAPI MICROSERVICE LAYER
# ══════════════════════════════════════════════════════════════════════════════

# ── Pydantic models ──────────────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    question_id: str
    text: str
    course_id: str
    difficulty: float = 0.5


class AnswerData(BaseModel):
    answer_id: str
    question_id: str
    answerer_id: str
    upvotes: int = 0
    accepted: bool = False


class InteractionData(BaseModel):
    student_id: str
    course_id: str
    action: str  # "like" or "comment"
    post_id: Optional[str] = None


class StudentData(BaseModel):
    student_id: str
    name: str
    performance: float = 0.0
    completed_topics: Optional[List[str]] = None


class InitializeRequest(BaseModel):
    course_id: str
    prereq_edges: Optional[List[List[str]]] = None  # [[from, to], ...]
    archived_questions: List[QuestionRequest]
    interactions: List[InteractionData]
    answers: List[AnswerData]
    students: List[StudentData]
    sim_threshold: float = 0.65
    alpha: float = 0.85
    weights_prereq: float = 0.40
    weights_ppr: float = 0.35
    weights_perf: float = 0.25
    validation_pairs: Optional[List[dict]] = None
    target_precision: Optional[float] = None


class RankedCandidate(BaseModel):
    student_id: str
    score: float
    details: dict


class RoutingResponse(BaseModel):
    branch: str  # "duplicate" or "new"
    duplicate_id: Optional[str] = None
    ranked: List[RankedCandidate]


# ── FastAPI app ──────────────────────────────────────────────────────────────

app = FastAPI(title="IntelliCampus Question Router", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_ROUTERS = 50
routers: "OrderedDict[str, CourseQuestionRouter]" = OrderedDict()
router_lock = threading.Lock()


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/initialize", status_code=200)
def initialize(data: InitializeRequest):
    """
    Initialize or replace the router for a course. Called at startup
    or when data is refreshed.
    Multiple course routers can coexist keyed by course_id.
    """
    global routers
    questions = [
        Question(q.question_id, q.text, q.course_id, q.difficulty)
        for q in data.archived_questions
    ]
    answers_list = [
        Answer(a.answer_id, a.question_id, a.answerer_id, a.upvotes, a.accepted)
        for a in data.answers
    ]
    students_list = [
        Student(s.student_id, s.name, s.performance, s.completed_topics or [])
        for s in data.students
    ]
    interactions_list = [i.model_dump() for i in data.interactions]

    weights = {
        "prereq": data.weights_prereq,
        "ppr": data.weights_ppr,
        "perf": data.weights_perf,
    }

    router = CourseQuestionRouter(
        course_id=data.course_id,
        prereq_edges=[(e[0], e[1]) for e in (data.prereq_edges or [])],
        sim_threshold=data.sim_threshold,
        alpha=data.alpha,
        weights=weights,
    )

    val_pairs = None
    if data.validation_pairs:
        val_pairs = []
        for vp in data.validation_pairs:
            q_data = vp["question"]
            q = Question(q_data["question_id"], q_data["text"],
                         q_data.get("course_id", data.course_id),
                         q_data.get("difficulty", 0.5))
            val_pairs.append((q, vp["is_duplicate"]))

    router.fit(
        interactions=interactions_list,
        archived_questions=questions,
        answers=answers_list,
        students=students_list,
        validation_pairs=val_pairs,
        target_precision=data.target_precision,
    )

    with router_lock:
        if data.course_id in routers:
            routers.move_to_end(data.course_id)
        else:
            if len(routers) >= MAX_ROUTERS:
                routers.popitem(last=False)
        routers[data.course_id] = router

    return {"status": "ok", "course_id": data.course_id,
            "threshold": router.detector.threshold}


@app.post("/route", response_model=RoutingResponse)
def route_question(q: QuestionRequest):
    """
    Route a question and return ranked candidates.
    The router for the question's course must be initialized first.
    """
    with router_lock:
        router = routers.get(q.course_id)
        if router:
            routers.move_to_end(q.course_id)
    if router is None:
        raise HTTPException(503,
                            f"Router not initialized for course '{q.course_id}'. "
                            f"Call /initialize first.")

    question = Question(q.question_id, q.text, q.course_id, q.difficulty)
    result = router.route(question)

    # ── verification: print ranked candidates (id + name) to the routing terminal
    name_map = {s.student_id: s.name for s in router.students}
    dup = result.get("duplicate")
    print("\n" + "=" * 72)
    print(f"[ROUTING] question_id={q.question_id}  course={q.course_id}  "
          f"branch={result['branch']}"
          + (f"  duplicate_of={dup.question_id}" if dup else ""))
    ranked = result["ranked"]
    print(f"[ROUTING] {len(ranked)} ranked candidate(s) for this question:")
    for i, (sid, sc, details) in enumerate(ranked, 1):
        name = name_map.get(sid, "<unknown>")
        print(f"[ROUTING]   Rank {i}: {name}  (id={sid})  score={sc}  details={details}")
    print("=" * 72)

    return RoutingResponse(
        branch=result["branch"],
        duplicate_id=result["duplicate"].question_id if result.get("duplicate") else None,
        ranked=[
            RankedCandidate(student_id=sid, score=sc, details=details)
            for sid, sc, details in result["ranked"]
        ],
    )


@app.get("/health")
def health():
    return {"status": "healthy", "initialized_courses": list(routers.keys())}


@app.post("/tune")
def tune_threshold(validation_pairs: List[dict],
                   candidates: Optional[List[float]] = None,
                   target_precision: Optional[float] = None,
                   course_id: Optional[str] = None):
    """
    Re-tune the duplicate detector threshold without re-initializing.
    validation_pairs format: [{"question": {...}, "is_duplicate": bool}, ...]
    Provide course_id to target a specific course router.
    """
    with router_lock:
        if course_id:
            router = routers.get(course_id)
            if router is None:
                raise HTTPException(404, f"No router found for course '{course_id}'.")
        elif len(routers) == 1:
            router = next(iter(routers.values()))
        else:
            raise HTTPException(400,
                "Multiple routers loaded. Specify course_id parameter.")

    vpairs = []
    for vp in validation_pairs:
        qd = vp["question"]
        q = Question(qd["question_id"], qd["text"],
                     qd.get("course_id", router.course_id),
                     qd.get("difficulty", 0.5))
        vpairs.append((q, vp["is_duplicate"]))

    metrics = router.tune_detector(
        validation_pairs=vpairs,
        target_precision=target_precision,
        candidates=candidates,
    )
    return metrics


# ── Graph export ──────────────────────────────────────────────────────────────

@app.get("/export_graph")
def export_graph(course_id: str, graph_type: str = "interaction"):
    """
    Export a NetworkX graph as a GEXF file for visualization in Gephi.

    Parameters
    ----------
    course_id   Course whose router to query.
    graph_type  "interaction" (default) or "prerequisite".

    Returns
    -------
    GEXF XML file download.
    """
    with router_lock:
        router = routers.get(course_id)
    if router is None:
        raise HTTPException(404, f"No router found for course '{course_id}'.")

    if graph_type == "interaction":
        G = router.interaction_graph
        if G is None:
            raise HTTPException(404, "Interaction graph not built. Call /initialize first.")
    elif graph_type == "prerequisite":
        G = router.prereq_graph
        if G is None or G.number_of_nodes() == 0:
            raise HTTPException(404, "Prerequisite graph is empty.")
    else:
        raise HTTPException(400, "graph_type must be 'interaction' or 'prerequisite'.")

    fd, path = tempfile.mkstemp(suffix=".gexf")
    try:
        nx.write_gexf(G, path)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    finally:
        os.close(fd)
        os.unlink(path)

    return Response(content=content, media_type="application/xml",
                    headers={"Content-Disposition": f"attachment; filename={course_id}_{graph_type}.gexf"})


# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("IntelliCampusRouting:app", host="0.0.0.0", port=8000, reload=False)