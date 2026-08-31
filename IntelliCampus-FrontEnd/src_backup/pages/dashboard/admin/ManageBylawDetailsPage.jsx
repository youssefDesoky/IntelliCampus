import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import Section from "../../../components/ui/Section";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import SelectBox from "../../../components/ui/SelectBox";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import NumberInput from "../../../components/form/NumberInput";
import { PlusIcon, TrashIcon, FloppyDiskIcon, CheckIcon, XIcon, ArrowRightIcon, CloudUploadIcon, LinkIcon, ClipboardCheckIcon, CalendarDaysIcon, UserIcon, WarningIcon, ClockIcon, DownloadIcon, FileIcon, PenSquareIcon, BuildingIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import MaterialPreview from "../../../components/ui/MaterialPreview";
import { API_URL } from "../../../config/api";
import {
  fetchBylawById,
  updateBylaw,
  toggleBylawActive,
  setBylawGradeScales,
  setBylawLevelScales,
  uploadBylawDocument,
  updateBylawRequirements,
  updateBylawPassingGrade,
  updateBylawProbation,
  updateBylawMinHours,
  mapCourseToBylaw,
  unmapCourseFromBylaw,
  setCoursePrerequisites,
  updateBylawCourseAllowedDepartments,
  updateBylawCourseCreditHours,
  createBucket as apiCreateBucket,
  updateBucket as apiUpdateBucket,
  deleteBucket as apiDeleteBucket,
  updateBylawGradeWeights,
  updateBylawPassingCourseGrades,
} from "../../../feature/admin/services/adminBylawsApi";
import { fetchCourses } from "../../../feature/admin/services/adminCoursesApi";
import {
  fetchDepartments,
  fetchSpecializations,
  fetchSpecializationPrerequisites,
  setSpecializationPrerequisites,
} from "../../../feature/admin/services/adminDepartmentsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

const getTabs = (t) => [
  { key: "bylawDetails", label: t('manageBylaws.details') },
  { key: "general", label: t('manageBylaws.generalSettings') },
  { key: "registration", label: t('manageBylaws.registrationRules') },
  { key: "grading", label: t('manageBylaws.gradingSystem') },
  { key: "probation", label: t('manageBylaws.probationRules') },
  { key: "levels", label: t('manageBylaws.levels'), bachelorOnly: true },
  { key: "majorDeclaration", label: t('manageBylaws.majorDeclaration'), bachelorOnly: true },
  { key: "courseMapping", label: t('manageBylaws.courseMapping') },
];

const inputClass = "w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark focus:outline-none focus:border-border-primary-active-light";
const cardInputClass = "w-full px-2 py-1.5 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark focus:outline-none focus:border-border-primary-active-light";

const defaultGradeScale = { gradeLetter: "", minPercentage: 0, gpaValue: 0, sortOrder: 0 };
const defaultLevelScale = { level: 1, minHours: 0 };
const getBylawTypes = (t) => [
  { value: "Bachelor", label: t('manageBylaws.bachelor') },
  { value: "Master", label: t('manageBylaws.master') },
  { value: "PhD", label: t('manageBylaws.phd') },
  { value: "Diploma", label: t('manageBylaws.diploma') },
];

function GradeScaleCard({ scale, index, onChange, onRemove }) {
  const { t } = useTranslation('admin');
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        <span className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wider">
          {t('manageBylaws.gradeNumber', { number: scale.sortOrder || index + 1 })}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="ms-auto p-1.5 rounded-lg text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title={t('manageBylaws.removeGradeScale')}
        >
          <TrashIcon size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseGradesTab.grade')}</label>
          <input type="text" value={scale.gradeLetter} onChange={(e) => onChange(index, "gradeLetter", e.target.value)} placeholder="A" className={cardInputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseGradesTab.minPercent')}</label>
          <NumberInput step="0.01" value={scale.minPercentage} onChange={(e) => onChange(index, "minPercentage", e.target.value)} placeholder="90" className="w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseGradesTab.gpa')}</label>
          <NumberInput step="0.01" value={scale.gpaValue} onChange={(e) => onChange(index, "gpaValue", e.target.value)} placeholder="4.0" className="w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseGradesTab.order')}</label>
          <NumberInput value={scale.sortOrder} onChange={(e) => onChange(index, "sortOrder", parseInt(e.target.value) || 0)} className="w-full" />
        </div>
      </div>
    </div>
  );
}

function LevelScaleCard({ scale, index, onChange, onRemove }) {
  const { t } = useTranslation('admin');
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        <span className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wider">
          {t('courseGradesTab.level')} {scale.level}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="ms-auto p-1.5 rounded-lg text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title={t('manageBylaws.removeLevelScale')}
        >
          <TrashIcon size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseGradesTab.level')}</label>
          <NumberInput min="1" value={scale.level} onChange={(e) => onChange(index, "level", parseInt(e.target.value) || 1)} className="w-full" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseGradesTab.minPassedCredits')}</label>
          <NumberInput min="0" value={scale.minHours} onChange={(e) => onChange(index, "minHours", parseInt(e.target.value) || 0)} className="w-full" />
        </div>
      </div>
    </div>
  );
}

function CourseMappingTable({ title, items, allCourses, onAdd, onRemove, onSetPrerequisites, onSetAllowedDepartments, onCreditHoursChange }) {
  const { t } = useTranslation('admin');
  const getCourse = (courseId) => allCourses.find((c) => c.courseId === courseId);

  const handleCreditHoursChange = (courseId, value) => {
    const num = value === "" ? null : parseInt(value, 10);
    onCreditHoursChange?.(courseId, isNaN(num) ? null : num);
  };

  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        <span className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wider">
          {title} ({items.length})
        </span>
        <Button variant="secondary" type="button" onClick={onAdd}>
          <PlusIcon size={14} />
          {t('manageBylaws.addCourses')}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-6 text-center border-b border-border-primary-default-light dark:border-border-primary-default-dark">
          {t('manageBylaws.noCoursesMapped')}
        </p>
      ) : (
        <div className="divide-y divide-border-primary-default-light dark:divide-border-primary-default-dark">
          {items.map((entry, idx) => {
            const course = getCourse(entry.courseId);
            const isMajor = onSetAllowedDepartments != null;
            return (
              <div key={entry.courseId} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                    {course?.courseName || entry.courseName || t('manageBylaws.unknownCourse')}
                  </p>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    {course?.courseCode || entry.courseCode || entry.courseId}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={entry.creditHours ?? course?.creditHours ?? ""}
                    onChange={(e) => handleCreditHoursChange(entry.courseId, e.target.value)}
                    placeholder={course?.creditHours?.toString() ?? "—"}
                    className="w-14 text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark bg-transparent border border-border-primary-default-light dark:border-border-primary-default-dark rounded px-1 py-0.5 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-border-accent-active-light dark:focus:border-border-accent-active-dark"
                  />
                  {isMajor && (
                    <button
                      type="button"
                      onClick={() => onSetAllowedDepartments?.(entry)}
                      className="p-1.5 rounded-lg text-text-accent-active-light dark:text-text-accent-active-dark hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      title={t('manageBylaws.setAllowedDepartments')}
                    >
                      <BuildingIcon size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSetPrerequisites?.(entry.courseId)}
                    className="p-1.5 rounded-lg text-text-accent-active-light dark:text-text-accent-active-dark hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    title={t('manageBylaws.setPrerequisitesTitle')}
                  >
                    <LinkIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="p-1.5 rounded-lg text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title={t('manageBylaws.removeCourse')}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ManageBylawDetailsPage() {
  const { bylawId } = useParams();
  const navigate = useNavigate();
  const { isPhone, isTablet } = useDeviceType();
  const { showError } = useError();

  const [bylaw, setBylaw] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bylawDetails");

  const { t } = useTranslation('admin');
  const isBachelor = bylaw?.type === "Bachelor";
  const allTabs = useMemo(() => getTabs(t), [t]);
  const tabs = useMemo(() => allTabs.filter(t => !t.bachelorOnly || isBachelor), [allTabs, isBachelor]);
  const bylawTypes = useMemo(() => getBylawTypes(t), [t]);

  // ── General Settings & Status ──
  const [totalGraduationHours, setTotalGraduationHours] = useState("");
  const [thesisCreditHours, setThesisCreditHours] = useState("");
  const [hasComprehensiveExam, setHasComprehensiveExam] = useState(false);

  // ── Registration & Credit Hours Rules ──
  const [minCreditHoursPerSemester, setMinCreditHoursPerSemester] = useState("");
  const [maxCreditHoursPerSemester, setMaxCreditHoursPerSemester] = useState("");
  const [summerMaxCreditHours, setSummerMaxCreditHours] = useState("");

  // ── Grading System Configuration ──
  const [gradeScales, setGradeScales] = useState([]);
  const [minPassingGradeLetter, setMinPassingGradeLetter] = useState("");
  const [minPassingGpa, setMinPassingGpa] = useState("");
  const [courseWorkGrade, setCourseWorkGrade] = useState("");
  const [finalExamGrade, setFinalExamGrade] = useState("");
  const [minPassingCourseworkGrade, setMinPassingCourseworkGrade] = useState("");
  const [minPassingFinalExamGrade, setMinPassingFinalExamGrade] = useState("");
  const [maxGradeOnRetake, setMaxGradeOnRetake] = useState("");

  // ── Academic Probation Rules ──
  const [probationThreshold, setProbationThreshold] = useState("");
  const [probationRegistrationLimit, setProbationRegistrationLimit] = useState("");

  // ── Academic Levels ──
  const [levelScales, setLevelScales] = useState([]);
  // ── Major Declaration Rules ──
  const [minHoursToChooseDepartment, setMinHoursToChooseDepartment] = useState("");
  const [minHoursToChooseSpecialization, setMinHoursToChooseSpecialization] = useState("");
  const [minCreditHoursForGraduationProject, setMinCreditHoursForGraduationProject] = useState("");

  // ── Major Declaration: Specializations table & prerequisites ──
  const [allDepartments, setAllDepartments] = useState([]);
  const [deptSpecializations, setDeptSpecializations] = useState({});
  const [deptSpecsLoading, setDeptSpecsLoading] = useState(false);
  const [specPrerequisites, setSpecPrerequisites] = useState({});
  const [specPrereqTarget, setSpecPrereqTarget] = useState(null);
  const [specPrereqSelectedCourses, setSpecPrereqSelectedCourses] = useState([]);
  const [specPrereqMinGrades, setSpecPrereqMinGrades] = useState({});
  const [specPrereqSearchQuery, setSpecPrereqSearchQuery] = useState("");
  const modifiedSpecPrereqIds = useRef(new Set());

  // ── Course Mapping ──
  const [allCourses, setAllCourses] = useState([]);
  const [allCoursesLoading, setAllCoursesLoading] = useState(false);
  const [universityRequired, setUniversityRequired] = useState([]);
  const [collegeRequired, setCollegeRequired] = useState([]);
  const [majorRequired, setMajorRequired] = useState([]);
  const [courseSelectTarget, setCourseSelectTarget] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courseIdToBylawCourseId, setCourseIdToBylawCourseId] = useState({});

  // ── Allowed Departments ──
  const [departmentTarget, setDepartmentTarget] = useState(null);
  const [deptSelectedIds, setDeptSelectedIds] = useState([]);
  const [deptSearchQuery, setDeptSearchQuery] = useState("");

  // ── Prerequisites ──
  const [prerequisites, setPrerequisites] = useState({});
  const [prereqTarget, setPrereqTarget] = useState(null);
  const [prereqSelectedIds, setPrereqSelectedIds] = useState([]);
  const [prereqSearchQuery, setPrereqSearchQuery] = useState("");

  // ── Buckets ──
  const [buckets, setBuckets] = useState([]);
  const [bucketCourseTarget, setBucketCourseTarget] = useState(null);
  const [bucketSelectedIds, setBucketSelectedIds] = useState([]);
  const [bucketSearchQuery, setBucketSearchQuery] = useState("");
  const [bucketDepartments, setBucketDepartments] = useState([]);
  const [newBucketForm, setNewBucketForm] = useState({ name: "", nameAr: "", department: "", departmentId: null });
  const [isNewBucketOpen, setIsNewBucketOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState(null);
  const originalBucketsRef = useRef([]);

  // ── Pagination ──
  const [gradeScalesPage, setGradeScalesPage] = useState(1);
  const [levelScalesPage, setLevelScalesPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const cardsContainerRef = useRef(null);

  // ── Saving / Status ──
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [savingGradeScales, setSavingGradeScales] = useState(false);
  const [savingProbation, setSavingProbation] = useState(false);
  const [savingLevelScales, setSavingLevelScales] = useState(false);
  const [savingMinHours, setSavingMinHours] = useState(false);
  const [savingCourseMapping, setSavingCourseMapping] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // ── Toggle Active Dialog ──
  const [isToggleActiveOpen, setIsToggleActiveOpen] = useState(false);

  // ── Bylaw Details Form ──
  const [editName, setEditName] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDescriptionAr, setEditDescriptionAr] = useState("");
  const [selectedBylawType, setSelectedBylawType] = useState(bylawTypes[0]);
  const [newFiles, setNewFiles] = useState([]);
  const [savingBylawDetails, setSavingBylawDetails] = useState(false);
  const [documentPreviewTarget, setDocumentPreviewTarget] = useState(null);
  const fileInputRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchBylawById(bylawId);
      setBylaw(data);

      setEditName(data.name || "");
      setEditNameAr(data.nameAr || "");
      setEditDescription(data.description || "");
      setEditDescriptionAr(data.descriptionAr || "");
      setSelectedBylawType(bylawTypes.find(t => t.value === data.type) || bylawTypes[0]);
      setTotalGraduationHours(data.totalHoursToCompleteDegree ?? "");
      setThesisCreditHours(data.thesisCreditHours ?? "");
      setHasComprehensiveExam(data.hasComprehensiveExam ?? false);

      setMinCreditHoursPerSemester(data.minCreditHoursPerSemester ?? "");
      setMaxCreditHoursPerSemester(data.maxCreditHoursPerSemester ?? "");
      setSummerMaxCreditHours(data.summerMaxCreditHours ?? "");

      setGradeScales(data.gradeScales?.length
        ? data.gradeScales.map((g, i) => ({ ...g, sortOrder: i + 1 }))
        : []);
      setMinPassingGradeLetter(data.minPassingGradeLetter ?? "");
      setMinPassingGpa(data.minPassingGpa ?? "");
      setCourseWorkGrade(data.courseWorkGrade ?? "");
      setFinalExamGrade(data.finalExamGrade ?? "");
      setMinPassingCourseworkGrade(data.minPassingCourseworkGrade ?? "");
      setMinPassingFinalExamGrade(data.minPassingFinalExamGrade ?? "");
      setMaxGradeOnRetake(data.maxGradeOnRetake ?? "");

      setProbationThreshold(data.probationThreshold ?? "");
      setProbationRegistrationLimit(data.probationRegistrationLimit ?? "");

      setLevelScales(data.levelScales?.length
        ? data.levelScales.map((l) => ({ ...l }))
        : []);

      setMinHoursToChooseDepartment(data.minHoursToChooseDepartment ?? "");
      setMinHoursToChooseSpecialization(data.minHoursToChooseSpecialization ?? "");
      setMinCreditHoursForGraduationProject(data.minCreditHoursForGraduationProject ?? "");

      // Parse BylawCourses into course arrays and prerequisites
      const courseMap = {}, bcToCourse = {};
      const uni = [], college = [], major = [];
      const prereqMap = {};
      (data.bylawCourses || []).forEach(bc => {
        courseMap[bc.courseId] = bc.bylawCourseId;
        bcToCourse[bc.bylawCourseId] = bc.courseId;
        const entry = { courseId: bc.courseId, bylawCourseId: bc.bylawCourseId, creditHours: bc.creditHours ?? null, allowedDepartments: bc.allowedDepartments || [], courseCode: bc.courseCode, courseName: bc.courseName };
        const type = bc.courseType?.toLowerCase() || "";
        if (type === "generaluniversity") uni.push(entry);
        else if (type === "faculty") college.push(entry);
        else if (type === "department" || type === "specialization") major.push(entry);
        if (bc.prerequisites?.length) {
          prereqMap[bc.courseId] = bc.prerequisites.map(p => bcToCourse[p.prerequisiteBylawCourseId] || p.prerequisiteBylawCourseId);
        }
      });
      setCourseIdToBylawCourseId(courseMap);
      setUniversityRequired(uni);
      setCollegeRequired(college);
      setMajorRequired(major);
      setPrerequisites(prereqMap);
      const loadedBuckets = (data.electiveBuckets || []).map(b => ({
        id: b.electiveBucketId,
        name: b.name,
        nameAr: b.nameAr,
        requiredCreditHours: b.requiredCreditHours || 0,
        courseIds: (b.courses || []).map(c => ({ courseId: c.courseId, creditHours: c.creditHours, bylawCourseId: c.bylawCourseId })),
        departmentId: b.departmentId || null,
        department: b.departmentName || "",
      }));
      setBuckets(loadedBuckets);
      originalBucketsRef.current = loadedBuckets.map(b => b.id);
      setNewFiles([]);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [bylawId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!cardsContainerRef.current) return;
      const rect = cardsContainerRef.current.getBoundingClientRect();
      const bottomPaddingOffset = isPhone ? 60 : isTablet ? 30 : 0;
      const availableHeight = window.innerHeight - rect.top - bottomPaddingOffset;
      setItemsPerPage(Math.max(3, Math.floor(availableHeight / 95)));
    };
    const timer = setTimeout(calculateItemsPerPage, 50);
    window.addEventListener("resize", calculateItemsPerPage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateItemsPerPage);
    };
  }, [gradeScales.length, levelScales.length, isPhone, isTablet]);

  const gradeScalesTotalPages = Math.max(1, Math.ceil(gradeScales.length / itemsPerPage));
  const levelScalesTotalPages = Math.max(1, Math.ceil(levelScales.length / itemsPerPage));

  useEffect(() => {
    if (gradeScalesPage > gradeScalesTotalPages) setGradeScalesPage(gradeScalesTotalPages);
  }, [gradeScalesTotalPages, gradeScalesPage]);

  useEffect(() => {
    if (levelScalesPage > levelScalesTotalPages) setLevelScalesPage(levelScalesTotalPages);
  }, [levelScalesTotalPages, levelScalesPage]);

  const paginatedGradeScales = useMemo(() =>
    gradeScales.slice((gradeScalesPage - 1) * itemsPerPage, gradeScalesPage * itemsPerPage),
    [gradeScales, gradeScalesPage, itemsPerPage]
  );

  const paginatedLevelScales = useMemo(() =>
    levelScales.slice((levelScalesPage - 1) * itemsPerPage, levelScalesPage * itemsPerPage),
    [levelScales, levelScalesPage, itemsPerPage]
  );

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // ── Handlers: General Settings & Status ──

  const handleToggleActive = async () => {
    try {
      await toggleBylawActive(bylawId);
      showSuccess(t('manageBylaws.successToggle'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorToggleStatus'));
    }
    setIsToggleActiveOpen(false);
  };

  const handleSaveGeneral = async () => {
    
    setSavingGeneral(true);
    try {
      if (isBachelor) {
        await updateBylawRequirements(bylawId, {
          totalHoursToCompleteDegree: parseInt(totalGraduationHours) || null,
        });
        await updateBylawMinHours(bylawId, {
          minCreditHoursForGraduationProject: parseInt(minCreditHoursForGraduationProject) || null,
        });
      } else {
        await updateBylawRequirements(bylawId, {
          totalHoursToCompleteDegree: parseInt(totalGraduationHours) || null,
          thesisCreditHours: parseInt(thesisCreditHours) || null,
          hasComprehensiveExam: hasComprehensiveExam,
        });
      }
      showSuccess(t('manageBylaws.successGeneral'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorGeneral'));
    } finally {
      setSavingGeneral(false);
    }
  };

  // ── Handlers: Registration & Credit Hours Rules ──

  const handleSaveRegistration = async () => {
    
    setSavingRegistration(true);
    try {
      await updateBylawRequirements(bylawId, {
        minCreditHoursPerSemester: parseInt(minCreditHoursPerSemester) || null,
        maxCreditHoursPerSemester: parseInt(maxCreditHoursPerSemester) || null,
        summerMaxCreditHours: parseInt(summerMaxCreditHours) || null,
      });
      showSuccess(t('manageBylaws.successRegistration'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorRegistration'));
    } finally {
      setSavingRegistration(false);
    }
  };

  // ── Handlers: Grading System Configuration ──

  const addGradeScale = () => {
    setGradeScales(prev => [...prev, { ...defaultGradeScale, sortOrder: prev.length + 1 }]);
  };

  const removeGradeScale = (index) => {
    setGradeScales(prev => prev.filter((_, i) => i !== index).map((g, i) => ({ ...g, sortOrder: i + 1 })));
  };

  const updateGradeScale = (index, field, value) => {
    setGradeScales(prev => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };

  const handleSaveGrading = async () => {
    
    const valid = gradeScales.filter((g) => g.gradeLetter.trim() !== "");
    if (valid.length === 0) {
      showError(t('manageBylaws.errorGradeScaleRequired'));
      return;
    }
    setSavingGradeScales(true);
    try {
      await setBylawGradeScales(bylawId, valid.map((g) => ({
        gradeLetter: g.gradeLetter,
        minPercentage: parseFloat(g.minPercentage) || 0,
        gpaValue: parseFloat(g.gpaValue) || 0,
        sortOrder: g.sortOrder,
      })));
      await updateBylawPassingGrade(bylawId, {
        minPassingGradeLetter: minPassingGradeLetter || null,
        minPassingGpa: parseFloat(minPassingGpa) || null,
      });
      await updateBylawGradeWeights(bylawId, {
        courseWorkGrade: parseFloat(courseWorkGrade) || null,
        finalExamGrade: parseFloat(finalExamGrade) || null,
      });
      await updateBylawPassingCourseGrades(bylawId, {
        minPassingCourseworkGrade: parseFloat(minPassingCourseworkGrade) || null,
        minPassingFinalExamGrade: parseFloat(minPassingFinalExamGrade) || null,
        maxGradeOnRetake: maxGradeOnRetake || null,
      });
      showSuccess(t('manageBylaws.successGrading'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorGrading'));
    } finally {
      setSavingGradeScales(false);
    }
  };

  // ── Handlers: Academic Probation Rules ──

  const handleSaveProbation = async () => {
    
    setSavingProbation(true);
    try {
      await updateBylawProbation(bylawId, {
        probationThreshold: parseFloat(probationThreshold) || null,
        probationRegistrationLimit: parseInt(probationRegistrationLimit) || null,
      });
      showSuccess(t('manageBylaws.successProbation'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorProbation'));
    } finally {
      setSavingProbation(false);
    }
  };

  // ── Handlers: Academic Levels ──

  const addLevelScale = () => {
    const nextLevel = levelScales.length > 0 ? Math.max(...levelScales.map((l) => l.level)) + 1 : 1;
    setLevelScales(prev => [...prev, { ...defaultLevelScale, level: nextLevel }]);
  };

  const removeLevelScale = (index) => {
    setLevelScales(prev => prev.filter((_, i) => i !== index));
  };

  const updateLevelScale = (index, field, value) => {
    setLevelScales(prev => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const handleSaveLevels = async () => {
    
    const valid = levelScales.filter((l) => l.level > 0);
    if (valid.length === 0) {
      showError(t('manageBylaws.errorLevelScaleRequired'));
      return;
    }
    setSavingLevelScales(true);
    try {
      await setBylawLevelScales(bylawId, valid.map((l) => ({
        level: l.level,
        minHours: parseInt(l.minHours) || 0,
      })));
      showSuccess(t('manageBylaws.successLevels'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorLevels'));
    } finally {
      setSavingLevelScales(false);
    }
  };

  // ── Handlers: Major Declaration Rules ──

  const handleSaveMinHours = async () => {
    
    setSavingMinHours(true);
    try {
      await updateBylawMinHours(bylawId, {
        minHoursToChooseDepartment: parseInt(minHoursToChooseDepartment) || null,
        minHoursToChooseSpecialization: parseInt(minHoursToChooseSpecialization) || null,
      });
      // Save only specialization prerequisites that were actually modified
      const modifiedSpecIds = [...modifiedSpecPrereqIds.current];
      await Promise.all(modifiedSpecIds.map(async (specId) => {
        const prereqs = specPrerequisites[specId] || [];
        await setSpecializationPrerequisites(parseInt(specId), prereqs);
      }));
      modifiedSpecPrereqIds.current.clear();
      showSuccess(t('manageBylaws.successMajor'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorMajor'));
    } finally {
      setSavingMinHours(false);
    }
  };

  // ── Handlers: Specialization Prerequisites ──

  const confirmSpecPrereqSelection = () => {
    if (!specPrereqTarget) return;
    const prereqs = specPrereqSelectedCourses.map(courseId => ({
      courseId,
      minGrade: specPrereqMinGrades[courseId] || null,
    }));
    setSpecPrerequisites(prev => ({ ...prev, [specPrereqTarget.specId]: prereqs }));
    modifiedSpecPrereqIds.current.add(specPrereqTarget.specId);
    setSpecPrereqTarget(null);
    setSpecPrereqSelectedCourses([]);
    setSpecPrereqMinGrades({});
    setSpecPrereqSearchQuery("");
  };

  // ── Handlers: Course Mapping ──

  const openCourseSelect = (target) => {
    setCourseSelectTarget(target);
    const existingIds = target === "university" ? universityRequired.map(c => c.courseId) :
                        target === "college" ? collegeRequired.map(c => c.courseId) :
                        majorRequired.map(c => c.courseId);
    setSelectedCourseIds(existingIds);
    setCourseSearchQuery("");
  };

  const confirmCourseSelection = () => {
    if (!courseSelectTarget || selectedCourseIds.length === 0) return;
    const updater = (prev) => {
      const existing = new Set(prev.map(c => c.courseId));
      const newIds = selectedCourseIds.filter(id => !existing.has(id));
      const result = [...prev, ...newIds.map(courseId => {
        const c = allCourses.find(x => x.courseId === courseId);
        return { courseId, bylawCourseId: null, creditHours: c?.creditHours ?? null, courseCode: c?.courseCode, courseName: c?.courseName };
      })];
      return result;
    };
    if (courseSelectTarget === "university") {
      setUniversityRequired(updater);
    } else if (courseSelectTarget === "college") {
      setCollegeRequired(updater);
    } else if (courseSelectTarget === "major") {
      setMajorRequired(updater);
    }
    setCourseSelectTarget(null);
    setSelectedCourseIds([]);
  };

  const removeCourseMappingRow = (list, setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  // ── Handlers: Prerequisites ──

  const openPrereqSelect = (courseId) => {
    setPrereqTarget(courseId);
    setPrereqSelectedIds(prerequisites[courseId] || []);
    setPrereqSearchQuery("");
  };

  const confirmPrereqSelection = () => {
    if (!prereqTarget) return;
    setPrerequisites(prev => ({ ...prev, [prereqTarget]: prereqSelectedIds }));
    setPrereqTarget(null);
    setPrereqSelectedIds([]);
  };

  // ── Handlers: Allowed Departments ──

  const openDepartmentSelect = (entry) => {
    setDepartmentTarget(entry);
    setDeptSelectedIds(entry.allowedDepartments || []);
    setDeptSearchQuery("");
  };

  const confirmDepartmentSelection = () => {
    if (!departmentTarget) return;
    const updatedDepts = deptSelectedIds;
    const updater = (prev) => prev.map(c =>
      c.courseId === departmentTarget.courseId
        ? { ...c, allowedDepartments: updatedDepts }
        : c
    );
    setUniversityRequired(updater);
    setCollegeRequired(updater);
    setMajorRequired(updater);
    setDepartmentTarget(null);
    setDeptSelectedIds([]);
  };

  // ── Handlers: Credit Hours ──

  const handleCreditHoursChange = (courseId, creditHours) => {
    const updater = (prev) => prev.map(c =>
      c.courseId === courseId ? { ...c, creditHours } : c
    );
    setUniversityRequired(updater);
    setCollegeRequired(updater);
    setMajorRequired(updater);
  };

  const [bucketCourseCredits, setBucketCourseCredits] = useState({});

  // ── Handlers: Buckets ──

  const createBucket = () => {
    setNewBucketForm({ name: "", nameAr: "", department: "", departmentId: null });
    setIsNewBucketOpen(true);
  };

  const confirmNewBucket = () => {
    if (!newBucketForm.name.trim()) return;
    setIsNewBucketOpen(false);
    const tempId = -Date.now();
    setBuckets(prev => [...prev, {
      id: tempId,
      name: newBucketForm.name.trim(),
      nameAr: newBucketForm.nameAr.trim(),
      courseIds: [],
      requiredCreditHours: 0,
      department: newBucketForm.department || "",
      departmentId: newBucketForm.departmentId,
    }]);
    setNewBucketForm({ name: "", nameAr: "", department: "", departmentId: null });
  };

  const updateBucket = (id, field, value) => {
    setBuckets(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBucket = (id) => {
    setBuckets(prev => prev.filter(b => b.id !== id));
  };

  const openBucketCourseSelect = async (bucketId) => {
    const bucket = buckets.find(b => b.id === bucketId);
    setBucketCourseTarget(bucketId);
    setBucketSelectedIds((bucket?.courseIds || []).map(c => c.courseId));
    const creditMap = {};
    (bucket?.courseIds || []).forEach(c => { creditMap[c.courseId] = c.creditHours ?? null; });
    setBucketCourseCredits(creditMap);
    setBucketSearchQuery("");
    try {
      const depts = await fetchDepartments();
      setBucketDepartments(Array.isArray(depts) ? depts : []);
    } catch (err) {
      showError(err.message || "Failed to fetch departments");
    }
  };

  const confirmBucketCourseSelection = () => {
    if (!bucketCourseTarget) return;
    setBuckets(prev => prev.map(b =>
      b.id === bucketCourseTarget ? {
        ...b,
        courseIds: bucketSelectedIds.map(id => ({
          courseId: id,
          creditHours: bucketCourseCredits[id] ?? null,
        })),
      } : b
    ));
    setBucketCourseTarget(null);
    setBucketSelectedIds([]);
    setBucketCourseCredits({});
  };

  const removeBucketCourse = (bucketId, courseId) => {
    setBuckets(prev => prev.map(b =>
      b.id === bucketId ? { ...b, courseIds: b.courseIds.filter(c => c.courseId !== courseId) } : b
    ));
  };

  useEffect(() => {
    if (activeTab !== "courseMapping") return;
    let cancelled = false;
    setAllCoursesLoading(true);
    fetchCourses().then((data) => {
      if (!cancelled) setAllCourses(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => {
      if (!cancelled) setAllCoursesLoading(false);
    });
    fetchDepartments().then((data) => {
      if (!cancelled) setBucketDepartments(Array.isArray(data) ? data : []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "majorDeclaration") return;
    let cancelled = false;
    setDeptSpecsLoading(true);
    if (allCourses.length === 0) {
      fetchCourses().then((data) => {
        if (!cancelled) setAllCourses(Array.isArray(data) ? data : []);
      }).catch(() => {});
    }
    fetchDepartments().then(async (depts) => {
      if (cancelled) return;
      const deptList = Array.isArray(depts) ? depts : [];
      setAllDepartments(deptList);
      const specsMap = {};
      const prereqsMap = {};
      await Promise.all(deptList.map(async (dept) => {
        try {
          const specs = await fetchSpecializations(dept.departmentId ?? dept.id);
          const specList = Array.isArray(specs) ? specs : [];
          specsMap[dept.departmentId ?? dept.id] = specList;
          await Promise.all(specList.map(async (spec) => {
            try {
              const prereqs = await fetchSpecializationPrerequisites(spec.specializationId);
              prereqsMap[spec.specializationId] = (prereqs || []).map(p => ({
                courseId: p.courseId,
                minGrade: p.minGrade,
              }));
            } catch { prereqsMap[spec.specializationId] = []; }
          }));
        } catch {
          specsMap[dept.departmentId ?? dept.id] = [];
        }
      }));
      if (!cancelled) {
        setDeptSpecializations(specsMap);
        setSpecPrerequisites(prereqsMap);
        setDeptSpecsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setDeptSpecsLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeTab]);

  const handleSaveCourseMapping = async () => {
    
    setSavingCourseMapping(true);
    try {
      const allCurrent = [...universityRequired, ...collegeRequired, ...majorRequired];
      const allCurrentIds = new Set(allCurrent.map(c => c.courseId));
      const allOriginal = [...Object.keys(courseIdToBylawCourseId).map(Number)];

      // Determine added courseIds (not in original mapping)
      const addedIds = allCurrent.filter(c => !courseIdToBylawCourseId[c.courseId]).map(c => c.courseId);
      const existingIds = allCurrent.filter(c => courseIdToBylawCourseId[c.courseId]).map(c => c.courseId);

      // Determine removed courseIds (in original but not in current)
      const removedIds = allOriginal.filter(id => !allCurrentIds.has(id));

      // Map added courses
      const typeForCourse = {};
      universityRequired.forEach(c => { typeForCourse[c.courseId] = "GeneralUniversity"; });
      collegeRequired.forEach(c => { typeForCourse[c.courseId] = "Faculty"; });
      majorRequired.forEach(c => { typeForCourse[c.courseId] = "Department"; });

      const newBcIds = {};
      for (const courseId of addedIds) {
        const entry = allCurrent.find(c => c.courseId === courseId);
        const result = await mapCourseToBylaw(bylawId, {
          courseId,
          courseType: typeForCourse[courseId],
          creditHours: entry?.creditHours ?? null,
          allowedDepartmentIds: entry?.allowedDepartments?.length > 0 ? entry.allowedDepartments : null,
        });
        newBcIds[courseId] = result.bylawCourseId;
      }

      // Build updated courseId -> bylawCourseId map for required courses
      const updatedMap = { ...courseIdToBylawCourseId, ...newBcIds };

      // Save buckets via ElectiveBuckets API (creates BylawCourse records for bucket courses)
      const originalIds = new Set(originalBucketsRef.current);
      const currentIds = new Set(buckets.map(b => b.id));
      const bucketBcIds = {};
      for (const bucket of buckets) {
        const isNew = !originalIds.has(bucket.id);
        let response;
        if (isNew) {
          response = await apiCreateBucket({
            name: bucket.name,
            nameAr: bucket.nameAr,
            bylawId: parseInt(bylawId),
            departmentId: bucket.departmentId || null,
            requiredCreditHours: bucket.requiredCreditHours || 0,
            courseIds: (bucket.courseIds || []).map(c => c.courseId),
          });
        } else {
          response = await apiUpdateBucket(bucket.id, {
            name: bucket.name,
            nameAr: bucket.nameAr,
            requiredCreditHours: bucket.requiredCreditHours || 0,
            courseIds: (bucket.courseIds || []).map(c => c.courseId),
          });
        }
        // Collect BylawCourseIds from bucket save response
        if (response?.courses) {
          for (const course of response.courses) {
            if (course.bylawCourseId) {
              bucketBcIds[course.courseId] = course.bylawCourseId;
            }
          }
        }
      }
      for (const id of originalBucketsRef.current) {
        if (!currentIds.has(id)) {
          await apiDeleteBucket(id);
        }
      }

      // Build full updatedMap including bucket course BylawCourseIds
      const fullUpdatedMap = { ...updatedMap, ...bucketBcIds };

      // Set prerequisites for ALL courses (required + bucket) that have them
      const allCourseEntries = [
        ...allCurrent,
        ...buckets.flatMap(b => b.courseIds.map(c => ({ courseId: c.courseId })))
      ];
      for (const entry of allCourseEntries) {
        const prereqCourseIds = prerequisites[entry.courseId];
        if (prereqCourseIds && prereqCourseIds.length > 0) {
          const prereqBcIds = prereqCourseIds
            .map(cid => fullUpdatedMap[cid])
            .filter(Boolean);
          if (prereqBcIds.length > 0) {
            await setCoursePrerequisites(fullUpdatedMap[entry.courseId], {
              prerequisiteBylawCourseIds: prereqBcIds,
            });
          }
        }
      }

      // Save credit hours for all current courses
      for (const entry of allCurrent) {
        const bcId = fullUpdatedMap[entry.courseId];
        if (bcId && entry.creditHours != null) {
          await updateBylawCourseCreditHours(bcId, { creditHours: entry.creditHours });
        }
      }

      // Save allowed departments for all current courses
      for (const entry of allCurrent) {
        const bcId = fullUpdatedMap[entry.courseId];
        if (bcId && entry.allowedDepartments?.length > 0) {
          await updateBylawCourseAllowedDepartments(bcId, { departmentIds: entry.allowedDepartments });
        }
      }

      // Remove unmapped courses
      for (const courseId of removedIds) {
        const bcId = courseIdToBylawCourseId[courseId];
        if (bcId) {
          await unmapCourseFromBylaw(bcId);
        }
      }

      showSuccess(t('manageBylaws.successCourseMapping'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorCourseMapping'));
    } finally {
      setSavingCourseMapping(false);
    }
  };

  // ── Handlers: Bylaw Details ──

  const handleSaveBylawDetails = async () => {
    
    if (!editName.trim()) {
      showError(t('manageBylaws.bylawNameRequired'));
      return;
    }
    setSavingBylawDetails(true);
    try {
      await updateBylaw(bylawId, {
        name: editName.trim(),
        nameAr: editNameAr.trim(),
        description: editDescription.trim(),
        descriptionAr: editDescriptionAr.trim(),
        type: selectedBylawType.value,
      });
      for (const file of newFiles) {
        await uploadBylawDocument(bylawId, file);
      }
      showSuccess(t('manageBylaws.successDetails'));
      await loadData();
    } catch (err) {
      showError(err.message || t('manageBylaws.errorDetails'));
    } finally {
      setSavingBylawDetails(false);
    }
  };

  if (isLoading) {
    return (
      <p className="text-center py-10 text-text-secondary-default-light dark:text-text-secondary-default-dark">
        {t('manageBylaws.loading')}
      </p>
    );
  }

  return (
    <div className="p-0 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate("/admin/bylaws")}
            className="shrink-0 w-10 h-10 rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark flex items-center justify-center hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors"
            aria-label={t('manageBylaws.backToBylaws')}
          >
            <ArrowRightIcon className="w-5 h-5 rotate-180 rtl:scale-x-[-1] text-text-secondary-default-light dark:text-text-secondary-default-dark" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark truncate">
              {bylaw.name}
            </h1>
            <p className="text-text-secondary-active-light dark:text-text-secondary-active-dark text-xs md:text-sm truncate">
              {bylaw.description || ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bylaw.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
            {bylaw.isActive ? <CheckIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
            {bylaw.isActive ? t('common:status.active') : t('common:status.inactive')}
          </span>
        </div>
      </div>

      {/* Success message */}
      <Dialog
        isOpen={successMessage !== null}
        variant="success"
        title={t('common:error.success')}
        onClose={() => setSuccessMessage(null)}
        confirmText={t('common:dialog.ok')}
        showCloseButton={true}
      >
        {successMessage}
      </Dialog>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key);  }}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-border-accent-active-light dark:border-border-accent-active-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                : "border-transparent text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ General Settings & Status ═══ */}
      {activeTab === "general" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.generalSettings')}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="warning" type="button" onClick={() => setIsToggleActiveOpen(true)}>
                {bylaw.isActive ? <XIcon size={16} /> : <CheckIcon size={16} />}
                {bylaw.isActive ? t('manageBylaws.deactivate') : t('manageBylaws.activate')}
              </Button>
              <Button variant="primary" type="button" onClick={handleSaveGeneral} disabled={savingGeneral}>
                <FloppyDiskIcon size={16} />
                {savingGeneral ? t('common:status.saving') : t('common:labels.save')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                  <ClipboardCheckIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.totalGraduationHours')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.totalGraduationHoursDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={totalGraduationHours} onChange={(e) => setTotalGraduationHours(e.target.value)} placeholder={t('manageBylaws.hoursPlaceholder')} className="w-full" />
            </div>

            {isBachelor && (
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                  <UserIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.minHoursGraduationProject')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.minHoursGraduationProjectDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={minCreditHoursForGraduationProject} onChange={(e) => setMinCreditHoursForGraduationProject(e.target.value)} placeholder={t('manageBylaws.hoursPlaceholder')} className="w-full" />
            </div>
            )}

            {!isBachelor && (
            <>
              <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                    <UserIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.thesisCreditHours')}</h3>
                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.thesisCreditHoursDesc')}</p>
                  </div>
                </div>
                <NumberInput min="0" value={thesisCreditHours} onChange={(e) => setThesisCreditHours(e.target.value)} placeholder={t('manageBylaws.hoursPlaceholder')} className="w-full" />
              </div>

              <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                    <ClipboardCheckIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.comprehensiveExam')}</h3>
                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.comprehensiveExamDesc')}</p>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasComprehensiveExam}
                    onChange={(e) => setHasComprehensiveExam(e.target.checked)}
                    className="rounded border-border-primary-default-light dark:border-border-primary-default-dark text-text-accent-active-light focus:ring-text-accent-active-light"
                  />
                  <span className="text-sm text-text-primary-default-light dark:text-text-primary-default-dark">
                    {hasComprehensiveExam ? t('manageBylaws.required') : t('manageBylaws.notRequired')}
                  </span>
                </label>
              </div>
            </>
            )}

            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                  <CalendarDaysIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.status')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.statusDesc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${bylaw.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
                  {bylaw.isActive ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                  {bylaw.isActive ? t('common:status.active') : t('common:status.inactive')}
                </span>
              </div>
            </div>
          </div>

        </Section>
      )}

      {/* ═══ Registration & Credit Hours Rules ═══ */}
      {activeTab === "registration" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.registrationRules')}
            </span>
            <Button variant="primary" type="button" onClick={handleSaveRegistration} disabled={savingRegistration}>
              <FloppyDiskIcon size={16} />
              {savingRegistration ? t('common:status.saving') : t('common:labels.save')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                  <WarningIcon size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.minCreditsPerSemester')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.minCreditsPerSemesterDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={minCreditHoursPerSemester} onChange={(e) => setMinCreditHoursPerSemester(e.target.value)} placeholder={t('manageBylaws.hoursPlaceholder')} className="w-full" />
            </div>

            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                  <CheckIcon size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.maxCreditsPerSemester')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.maxCreditsPerSemesterDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={maxCreditHoursPerSemester} onChange={(e) => setMaxCreditHoursPerSemester(e.target.value)} placeholder={t('manageBylaws.hoursPlaceholder')} className="w-full" />
            </div>

            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 shrink-0">
                  <ClockIcon size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.summerMaxCredits')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.summerMaxCreditsDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={summerMaxCreditHours} onChange={(e) => setSummerMaxCreditHours(e.target.value)} placeholder={t('manageBylaws.hoursPlaceholder')} className="w-full" />
            </div>
          </div>
        </Section>
      )}

      {/* ═══ Grading System Configuration ═══ */}
      {activeTab === "grading" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.gradeScaleCount', { count: gradeScales.length })}
            </span>
            <div className="flex items-center gap-2">
              {gradeScales.length >= 18 ? (
                <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.maxGradeScalesReached')}</span>
              ) : (
                <Button variant="secondary" type="button" onClick={addGradeScale}>
                  <PlusIcon size={16} />
                  {t('courseGradesTab.addScale')}
                </Button>
              )}
              <Button variant="primary" type="button" onClick={handleSaveGrading} disabled={savingGradeScales}>
                <FloppyDiskIcon size={16} />
                {savingGradeScales ? t('common:status.saving') : t('manageBylaws.saveGrading')}
              </Button>
            </div>
          </div>

          {/* Min Passing Grade & Min Graduation GPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.minPassingGrade')}</label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.minPassingGradeDesc')}</p>
              <input type="text" value={minPassingGradeLetter} onChange={(e) => setMinPassingGradeLetter(e.target.value)} className={inputClass} placeholder={t('manageBylaws.gradePlaceholder')} />
            </div>
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.minGraduationGpa')}</label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.minGraduationGpaDesc')}</p>
              <NumberInput step="0.01" min="0" max="4" value={minPassingGpa} onChange={(e) => setMinPassingGpa(e.target.value)} placeholder={t('manageBylaws.gpaPlaceholder')} className="w-full" />
            </div>
          </div>

          {/* Course Work & Final Exam Grade Weights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.courseWorkGrade')}</label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.courseWorkGradeDesc')}</p>
              <NumberInput step="0.1" min="0" max="100" value={courseWorkGrade} onChange={(e) => setCourseWorkGrade(e.target.value)} placeholder={t('manageBylaws.percentagePlaceholder')} className="w-full" />
            </div>
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.finalExamGrade')}</label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.finalExamGradeDesc')}</p>
              <NumberInput step="0.1" min="0" max="100" value={finalExamGrade} onChange={(e) => setFinalExamGrade(e.target.value)} placeholder={t('manageBylaws.examPercentagePlaceholder')} className="w-full" />
            </div>
          </div>

          {/* Minimum Passing Course Work & Final Exam Grades */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.minPassingCoursework')}</label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.minPassingCourseworkDesc')}</p>
              <NumberInput step="0.1" min="0" max="100" value={minPassingCourseworkGrade} onChange={(e) => setMinPassingCourseworkGrade(e.target.value)} placeholder={t('manageBylaws.courseworkMinPlaceholder')} className="w-full" />
            </div>
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.minPassingFinalExam')}</label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.minPassingFinalExamDesc')}</p>
              <NumberInput step="0.1" min="0" max="100" value={minPassingFinalExamGrade} onChange={(e) => setMinPassingFinalExamGrade(e.target.value)} placeholder={t('manageBylaws.examMinPlaceholder')} className="w-full" />
            </div>
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.maxGradeOnRetake')}</label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.maxGradeOnRetakeDesc')}</p>
              <input type="text" value={maxGradeOnRetake} onChange={(e) => setMaxGradeOnRetake(e.target.value)} className={inputClass} placeholder={t('manageBylaws.retakePlaceholder')} />
            </div>
          </div>

          {gradeScales.length === 0 ? (
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
              {t('manageBylaws.noGradeScales')}
            </p>
          ) : (
            <div ref={cardsContainerRef} className="space-y-3">
              {paginatedGradeScales.map((scale, idx) => (
                <GradeScaleCard key={idx} scale={scale} index={(gradeScalesPage - 1) * itemsPerPage + idx} onChange={updateGradeScale} onRemove={removeGradeScale} />
              ))}
            </div>
          )}

          {gradeScales.length > itemsPerPage && (
            <div className="mt-4">
              <PaginationButtons
                totalPages={gradeScalesTotalPages}
                currentPage={gradeScalesPage}
                setCurrentPage={setGradeScalesPage}
                from={(gradeScalesPage - 1) * itemsPerPage + 1}
                to={Math.min(gradeScalesPage * itemsPerPage, gradeScales.length)}
                total={gradeScales.length}
                label={t('manageBylaws.gradeScalesLabel')}
              />
            </div>
          )}
        </Section>
      )}

      {/* ═══ Academic Probation Rules ═══ */}
      {activeTab === "probation" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.probationRules')}
            </span>
            <Button variant="primary" type="button" onClick={handleSaveProbation} disabled={savingProbation}>
              <FloppyDiskIcon size={16} />
              {savingProbation ? t('common:status.saving') : t('common:labels.save')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0">
                  <WarningIcon size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.probationThreshold')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.probationThresholdDesc')}</p>
                </div>
              </div>
              <NumberInput step="0.1" min="0" max="4" value={probationThreshold} onChange={(e) => setProbationThreshold(e.target.value)} placeholder={t('manageBylaws.gpaPlaceholder')} className="w-full" />
            </div>

            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 shrink-0">
                  <UserIcon size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.probationRegistrationLimit')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageBylaws.probationRegistrationLimitDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={probationRegistrationLimit} onChange={(e) => setProbationRegistrationLimit(e.target.value)} placeholder={t('manageBylaws.hoursPlaceholder')} className="w-full" />
            </div>
          </div>
        </Section>
      )}

      {/* ═══ Academic Levels ═══ */}
      {activeTab === "levels" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.levelScaleCount', { count: levelScales.length })}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" type="button" onClick={addLevelScale}>
                <PlusIcon size={16} />
                {t('courseGradesTab.addLevel')}
              </Button>
              <Button variant="primary" type="button" onClick={handleSaveLevels} disabled={savingLevelScales}>
                <FloppyDiskIcon size={16} />
                {savingLevelScales ? t('common:status.saving') : t('manageBylaws.saveLevels')}
              </Button>
            </div>
          </div>

          {levelScales.length === 0 ? (
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
              {t('manageBylaws.noLevelScales')}
            </p>
          ) : (
            <div ref={cardsContainerRef} className="space-y-3">
              {paginatedLevelScales.map((scale, idx) => (
                <LevelScaleCard key={idx} scale={scale} index={(levelScalesPage - 1) * itemsPerPage + idx} onChange={updateLevelScale} onRemove={removeLevelScale} />
              ))}
            </div>
          )}

          {levelScales.length > itemsPerPage && (
            <div className="mt-4">
              <PaginationButtons
                totalPages={levelScalesTotalPages}
                currentPage={levelScalesPage}
                setCurrentPage={setLevelScalesPage}
                from={(levelScalesPage - 1) * itemsPerPage + 1}
                to={Math.min(levelScalesPage * itemsPerPage, levelScales.length)}
                total={levelScales.length}
                label={t('manageBylaws.levelScalesLabel')}
              />
            </div>
          )}

        </Section>
      )}

      {/* ═══ Major Declaration Rules ═══ */}
      {activeTab === "majorDeclaration" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.majorDeclaration')}
            </span>
            <Button variant="primary" type="button" onClick={handleSaveMinHours} disabled={savingMinHours}>
              <FloppyDiskIcon size={16} />
              {savingMinHours ? t('common:status.saving') : t('common:labels.save')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                  <UserIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.department')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.departmentDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={minHoursToChooseDepartment} onChange={(e) => setMinHoursToChooseDepartment(e.target.value)} placeholder={t('manageBylaws.enterMinCredits')} className="w-full" />
            </div>

            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                  <CheckIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.specialization')}</h3>
                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.specializationDesc')}</p>
                </div>
              </div>
              <NumberInput min="0" value={minHoursToChooseSpecialization} onChange={(e) => setMinHoursToChooseSpecialization(e.target.value)} placeholder={t('manageBylaws.enterMinCredits')} className="w-full" />
            </div>
          </div>

          {/* Specializations Table per Department */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-1">
              {t('manageBylaws.specializationPrerequisites')}
            </h3>
            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-4">
              {t('manageBylaws.specializationPrerequisitesDesc')}
            </p>

            {deptSpecsLoading ? (
              <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-8 text-center">
                {t('manageBylaws.loadingSpecializations')}
              </p>
            ) : allDepartments.length === 0 ? (
              <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-8 text-center border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                {t('manageBylaws.noDepartments')}
              </p>
            ) : (
              <div className="space-y-6">
                {allDepartments.map((dept) => {
                  const deptId = dept.departmentId ?? dept.id;
                  const specs = deptSpecializations[deptId] || [];
                  if (specs.length === 0) return null;
                  return (
                    <div key={deptId} className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                        <span className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wider">
                          {dept.departmentName || dept.name || `${t('manageBylaws.department')} #${deptId}`}
                        </span>
                        <span className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                          ({specs.length} {t('manageBylaws.specialization')}{specs.length !== 1 ? "s" : ""})
                        </span>
                      </div>
                      <div className="divide-y divide-border-primary-default-light dark:divide-border-primary-default-dark">
                        {specs.map((spec) => {
                          const specId = spec.specializationId ?? spec.id;
                          const prereqs = specPrerequisites[specId] || [];
                          const hasPrereqs = prereqs.length > 0;
                          return (
                            <div key={specId} className="flex items-center gap-4 px-4 py-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                  {spec.name}
                                </p>
                                {spec.nameAr && (
                                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark" dir="rtl">
                                    {spec.nameAr}
                                  </p>
                                )}
                                {hasPrereqs && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {prereqs.map((pr, i) => {
                                      const course = allCourses.find(c => c.courseId === pr.courseId);
                                      return (
                                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark">
                                          {course?.courseCode || `#${pr.courseId}`}
                                          {pr.minGrade != null && <span className="opacity-70">≥{pr.minGrade}</span>}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const existing = specPrerequisites[specId] || [];
                                  setSpecPrereqTarget({ deptId, specId, specName: spec.name });
                                  setSpecPrereqSelectedCourses(existing.map(p => p.courseId));
                                  setSpecPrereqMinGrades(existing.reduce((acc, p) => {
                                    acc[p.courseId] = p.minGrade ?? "";
                                    return acc;
                                  }, {}));
                                  setSpecPrereqSearchQuery("");
                                }}
                                className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors"
                              >
                                <LinkIcon size={14} className="inline me-1" />
                                {hasPrereqs ? t('manageBylaws.editPrerequisites') : t('manageBylaws.setPrerequisites')}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ═══ Course Mapping ═══ */}
      {activeTab === "courseMapping" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.courseMapping')}
            </span>
            <Button variant="primary" type="button" onClick={handleSaveCourseMapping} disabled={savingCourseMapping}>
              <FloppyDiskIcon size={16} />
              {savingCourseMapping ? t('common:status.saving') : t('common:labels.save')}
            </Button>
          </div>

          {allCoursesLoading ? (
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center">
              {t('manageBylaws.loadingCourses')}
            </p>
          ) : (
            <div className="space-y-6">
              <CourseMappingTable
                title={t('manageBylaws.universityRequiredCourses')}
                items={universityRequired}
                allCourses={allCourses}
                onAdd={() => openCourseSelect("university")}
                onRemove={(idx) => removeCourseMappingRow(universityRequired, setUniversityRequired, idx)}
                onSetPrerequisites={openPrereqSelect}
                onCreditHoursChange={handleCreditHoursChange}
              />
              <CourseMappingTable
                title={t('manageBylaws.collegeRequiredCourses')}
                items={collegeRequired}
                allCourses={allCourses}
                onAdd={() => openCourseSelect("college")}
                onRemove={(idx) => removeCourseMappingRow(collegeRequired, setCollegeRequired, idx)}
                onSetPrerequisites={openPrereqSelect}
                onCreditHoursChange={handleCreditHoursChange}
              />
              <CourseMappingTable
                title={t('manageBylaws.majorRequiredCourses')}
                items={majorRequired}
                allCourses={allCourses}
                onAdd={() => openCourseSelect("major")}
                onRemove={(idx) => removeCourseMappingRow(majorRequired, setMajorRequired, idx)}
                onSetPrerequisites={openPrereqSelect}
                onSetAllowedDepartments={openDepartmentSelect}
                onCreditHoursChange={handleCreditHoursChange}
              />
            </div>
          )}
          {/* Buckets Section */}
          {buckets.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                  {t('manageBylaws.courseBuckets')}
                </span>
                <Button variant="secondary" type="button" onClick={createBucket}>
                  <PlusIcon size={14} />
                  {t('manageBylaws.createBucket')}
                </Button>
              </div>
              <div className="space-y-4">
                {buckets.map((bucket, bi) => (
                  <div key={bucket.id} className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark flex-wrap">
                      <span className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wider shrink-0">
                        {t('manageBylaws.bucketNumber', { number: bi + 1 })}
                      </span>
                      <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate max-w-40">
                        {bucket.name || t('manageBylaws.untitled')}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ms-auto">
                        <Button variant="secondary" type="button" onClick={() => openBucketCourseSelect(bucket.id)}>
                          <PlusIcon size={14} />
                          {t('manageBylaws.addCourses')}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setEditingBucket(bucket)}
                          className="p-1.5 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
                          title={t('manageBylaws.editBucketTitle')}
                        >
                          <PenSquareIcon size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBucket(bucket.id)}
                          className="p-1.5 rounded-lg text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title={t('manageBylaws.removeBucket')}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      {/* Min credit hours bar */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark flex-wrap">
                        <label className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">
                          {t('manageBylaws.minCreditHours')}
                        </label>
                        <NumberInput
                          min="0"
                          value={bucket.requiredCreditHours}
                          onChange={(e) => updateBucket(bucket.id, "requiredCreditHours", parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">
                          {t('manageBylaws.hrs')}
                        </span>
                        <span className="text-xs font-medium text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                          {t('manageBylaws.availableCredits', { count: bucket.courseIds.reduce((sum, c) => sum + (c.creditHours ?? allCourses.find(crs => crs.courseId === c.courseId)?.creditHours ?? 0), 0) })}
                        </span>
                        {bucket.requiredCreditHours > 0 && bucket.courseIds.length > 0 && bucket.requiredCreditHours > bucket.courseIds.reduce((sum, c) => sum + (c.creditHours ?? allCourses.find(crs => crs.courseId === c.courseId)?.creditHours ?? 0), 0) && (
                          <span className="text-xs text-text-danger-default-light dark:text-text-danger-default-dark">{t('manageBylaws.exceedsAvailable')}</span>
                        )}
                      </div>

                      {/* Courses */}
                      {bucket.courseIds.length === 0 ? (
                        <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark py-3 text-center border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                          {t('manageBylaws.noCoursesInBucket')}
                        </p>
                      ) : (
                        <div className="divide-y divide-border-primary-default-light dark:divide-border-primary-default-dark -mx-4 -mb-4">
                          {bucket.courseIds.map((item) => {
                            const course = allCourses.find(c => c.courseId === item.courseId);
                            return (
                              <div key={item.courseId} className="flex items-center gap-4 px-4 py-2.5">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                    {course?.courseName || t('manageBylaws.unknownCourse')}
                                  </p>
                                  <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                    {course?.courseCode || `#${item.courseId}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <label className="text-[10px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark whitespace-nowrap">{t('manageBylaws.credits')}</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.creditHours ?? course?.creditHours ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                                      const ch = isNaN(val) ? null : val;
                                      setBuckets(prev => prev.map(b =>
                                        b.id === bucket.id ? {
                                          ...b,
                                          courseIds: b.courseIds.map(c =>
                                            c.courseId === item.courseId ? { ...c, creditHours: ch } : c
                                          )
                                        } : b
                                      ));
                                    }}
                                    className="w-14 text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark bg-transparent border border-border-primary-default-light dark:border-border-primary-default-dark rounded px-1 py-0.5 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-border-accent-active-light dark:focus:border-border-accent-active-dark"
                                    placeholder={course?.creditHours?.toString() ?? "—"}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openPrereqSelect(item.courseId)}
                                  className="p-1.5 rounded-lg text-text-accent-active-light dark:text-text-accent-active-dark hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                                  title={t('manageBylaws.setPrerequisitesTitle')}
                                >
                                  <LinkIcon size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeBucketCourse(bucket.id, item.courseId)}
                                  className="shrink-0 p-1.5 rounded-lg text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  title={t('manageBylaws.removeCourse')}
                                >
                                  <TrashIcon size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {buckets.length === 0 && (
            <div className="mt-6">
              <Button variant="secondary" type="button" onClick={createBucket}>
                <PlusIcon size={14} />
                {t('manageBylaws.createBucket')}
              </Button>
            </div>
          )}
        </Section> 
      )}

      {/* Course Selection Overlay */}
      {courseSelectTarget && (
        <ModelOverlay onClose={() => setCourseSelectTarget(null)} maxWidth="max-w-2xl">
          <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
              <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.selectCourses')}
              </h2>
              <button type="button" onClick={() => setCourseSelectTarget(null)} className="p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3">
              <input
                type="text"
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                placeholder={t('manageBylaws.searchCourses')}
                className={`w-full ${inputClass}`}
              />
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto px-5 space-y-1 min-h-0 no-scrollbar">
              {allCourses
                .filter((c) => {
                  const alreadyMapped = universityRequired.some(u => u.courseId === c.courseId) ||
                    collegeRequired.some(co => co.courseId === c.courseId) ||
                    majorRequired.some(m => m.courseId === c.courseId) ||
                    buckets.some(b => (b.courseIds || []).some(ci => ci.courseId === c.courseId));
                  return !alreadyMapped && (
                    !courseSearchQuery ||
                    c.courseName?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                    c.courseCode?.toLowerCase().includes(courseSearchQuery.toLowerCase())
                  );
                })
                .map((course) => {
                  const isSelected = selectedCourseIds.includes(course.courseId);
                  return (
                    <label
                      key={course.courseId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark"
                          : "hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedCourseIds(prev => {
                            const next = isSelected
                              ? prev.filter(id => id !== course.courseId)
                              : [...prev, course.courseId];
                            return next;
                          });
                        }}
                        className="rounded border-border-primary-default-light dark:border-border-primary-default-dark text-text-accent-active-light focus:ring-text-accent-active-light"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                          {course.courseName}
                        </p>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                          {course.courseCode}
                        </p>
                      </div>
                    </label>
                  );
                })}
              {allCourses.filter((c) => {
                const alreadyMapped = universityRequired.some(u => u.courseId === c.courseId) ||
                  collegeRequired.some(co => co.courseId === c.courseId) ||
                  majorRequired.some(m => m.courseId === c.courseId) ||
                  buckets.some(b => (b.courseIds || []).some(ci => ci.courseId === c.courseId));
                return !alreadyMapped && (
                  !courseSearchQuery ||
                  c.courseName?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                  c.courseCode?.toLowerCase().includes(courseSearchQuery.toLowerCase())
                );
              }).length === 0 && (
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center">
                  {t('manageBylaws.noCoursesFound')}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
              <button
                type="button"
                onClick={() => setCourseSelectTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
              >
                {t('common:labels.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmCourseSelection}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedCourseIds.length === 0}
              >
                {t('manageBylaws.addCount', { count: selectedCourseIds.length })}
              </button>
            </div>
          </div>
        </ModelOverlay>
      )}

      {/* Prerequisite Selection Overlay */}
      {prereqTarget && (
        <ModelOverlay onClose={() => setPrereqTarget(null)} maxWidth="max-w-2xl">
          <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
              <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.setPrerequisites')}
              </h2>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark ms-2 truncate">
                {t('manageBylaws.specPrereqFor', { name: allCourses.find(c => c.courseId === prereqTarget)?.courseName || t('manageBylaws.unknownCourse') })}
              </p>
              <button type="button" onClick={() => setPrereqTarget(null)} className="ms-auto p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3">
              <input
                type="text"
                value={prereqSearchQuery}
                onChange={(e) => setPrereqSearchQuery(e.target.value)}
                placeholder={t('manageBylaws.searchCourses')}
                className={`w-full ${inputClass}`}
              />
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto px-5 space-y-1 min-h-0 no-scrollbar">
              {allCourses
                .filter((c) => c.courseId !== prereqTarget)
                .filter((c) =>
                  !prereqSearchQuery ||
                  c.courseName?.toLowerCase().includes(prereqSearchQuery.toLowerCase()) ||
                  c.courseCode?.toLowerCase().includes(prereqSearchQuery.toLowerCase())
                )
                .map((course) => {
                  const isSelected = prereqSelectedIds.includes(course.courseId);
                  return (
                    <label
                      key={course.courseId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark"
                          : "hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setPrereqSelectedIds(prev =>
                            isSelected
                              ? prev.filter(id => id !== course.courseId)
                              : [...prev, course.courseId]
                          );
                        }}
                        className="rounded border-border-primary-default-light dark:border-border-primary-default-dark text-text-accent-active-light focus:ring-text-accent-active-light"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                          {course.courseName}
                        </p>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                          {course.courseCode}
                        </p>
                      </div>
                    </label>
                  );
                })}
              {allCourses.filter((c) => c.courseId !== prereqTarget).filter((c) =>
                !prereqSearchQuery ||
                c.courseName?.toLowerCase().includes(prereqSearchQuery.toLowerCase()) ||
                c.courseCode?.toLowerCase().includes(prereqSearchQuery.toLowerCase())
              ).length === 0 && (
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center">
                  {t('manageBylaws.noCoursesFound')}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
              <button
                type="button"
                onClick={() => setPrereqTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
              >
                {t('common:labels.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmPrereqSelection}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('manageBylaws.saveCount', { count: prereqSelectedIds.length })}
              </button>
            </div>
          </div>
        </ModelOverlay>
      )}

      {/* Allowed Department Selection Overlay */}
      {departmentTarget && (
        <ModelOverlay onClose={() => setDepartmentTarget(null)} maxWidth="max-w-lg">
          <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
              <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.allowedDepartments')}
              </h2>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark ms-2 truncate">
                {t('manageBylaws.specPrereqFor', { name: allCourses.find(c => c.courseId === departmentTarget.courseId)?.courseName || t('manageBylaws.unknownCourse') })}
              </p>
              <button type="button" onClick={() => setDepartmentTarget(null)} className="ms-auto p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            <div className="px-5 py-3">
              <input
                type="text"
                value={deptSearchQuery}
                onChange={(e) => setDeptSearchQuery(e.target.value)}
                placeholder={t('manageBylaws.searchDepartments')}
                className={`w-full ${inputClass}`}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 space-y-1 min-h-0 no-scrollbar">
              {bucketDepartments
                .filter((d) =>
                  !deptSearchQuery ||
                  (d.departmentName || d.name)?.toLowerCase().includes(deptSearchQuery.toLowerCase())
                )
                .map((dept) => {
                  const deptId = dept.departmentId ?? dept.id;
                  const isSelected = deptSelectedIds.includes(deptId);
                  return (
                    <label
                      key={deptId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark"
                          : "hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setDeptSelectedIds(prev =>
                            isSelected
                              ? prev.filter(id => id !== deptId)
                              : [...prev, deptId]
                          );
                        }}
                        className="rounded border-border-primary-default-light dark:border-border-primary-default-dark text-text-accent-active-light focus:ring-text-accent-active-light"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                          {dept.departmentName || dept.name}
                        </p>
                      </div>
                    </label>
                  );
                })}
              {bucketDepartments.filter((d) =>
                !deptSearchQuery ||
                (d.departmentName || d.name)?.toLowerCase().includes(deptSearchQuery.toLowerCase())
              ).length === 0 && (
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center">
                  {t('manageBylaws.noDepartments')}
                </p>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
              <button
                type="button"
                onClick={() => setDepartmentTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
              >
                {t('common:labels.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDepartmentSelection}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('manageBylaws.saveCount', { count: deptSelectedIds.length })}
              </button>
            </div>
          </div>
        </ModelOverlay>
      )}

      {/* Bucket Course Selection Overlay */}
      {bucketCourseTarget && (
        <ModelOverlay onClose={() => setBucketCourseTarget(null)} maxWidth="max-w-2xl">
          <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
              <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.selectCoursesForBucket')}
              </h2>
              <button type="button" onClick={() => setBucketCourseTarget(null)} className="p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3">
              <input
                type="text"
                value={bucketSearchQuery}
                onChange={(e) => setBucketSearchQuery(e.target.value)}
                placeholder={t('manageBylaws.searchCourses')}
                className={`w-full ${inputClass}`}
              />
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto px-5 space-y-1 min-h-0 no-scrollbar">
              {allCourses
                .filter((c) => {
                  const requiredIds = new Set([
                    ...universityRequired.map(u => u.courseId),
                    ...collegeRequired.map(co => co.courseId),
                    ...majorRequired.map(m => m.courseId),
                  ]);
                  return !requiredIds.has(c.courseId) && (
                    !bucketSearchQuery ||
                    c.courseName?.toLowerCase().includes(bucketSearchQuery.toLowerCase()) ||
                    c.courseCode?.toLowerCase().includes(bucketSearchQuery.toLowerCase())
                  );
                })
                .map((course) => {
                  const isSelected = bucketSelectedIds.includes(course.courseId);
                  return (
                    <label
                      key={course.courseId}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark"
                          : "hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setBucketSelectedIds(prev =>
                            isSelected
                              ? prev.filter(id => id !== course.courseId)
                              : [...prev, course.courseId]
                          );
                          if (!isSelected) {
                            setBucketCourseCredits(prev => ({
                              ...prev,
                              [course.courseId]: null,
                            }));
                          } else {
                            setBucketCourseCredits(prev => {
                              const next = { ...prev };
                              delete next[course.courseId];
                              return next;
                            });
                          }
                        }}
                        className="rounded border-border-primary-default-light dark:border-border-primary-default-dark text-text-accent-active-light focus:ring-text-accent-active-light"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                          {course.courseName}
                        </p>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                          {course.courseCode}
                        </p>
                      </div>
                    </label>
                  );
                })}
              {allCourses.filter((c) => {
                const requiredIds = new Set([
                  ...universityRequired.map(u => u.courseId),
                  ...collegeRequired.map(co => co.courseId),
                  ...majorRequired.map(m => m.courseId),
                ]);
                return !requiredIds.has(c.courseId) && (
                  !bucketSearchQuery ||
                  c.courseName?.toLowerCase().includes(bucketSearchQuery.toLowerCase()) ||
                  c.courseCode?.toLowerCase().includes(bucketSearchQuery.toLowerCase())
                );
              }).length === 0 && (
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center">
                  {t('manageBylaws.noCoursesFound')}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
              <button
                type="button"
                onClick={() => setBucketCourseTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
              >
                {t('common:labels.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmBucketCourseSelection}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={bucketSelectedIds.length === 0}
              >
                {t('manageBylaws.addCount', { count: bucketSelectedIds.length })}
              </button>
            </div>
          </div>
        </ModelOverlay>
      )}

      {/* New Bucket Form Overlay */}
      {isNewBucketOpen && (
        <ModelOverlay onClose={() => { setIsNewBucketOpen(false); setNewBucketForm({ name: "", nameAr: "", department: "", departmentId: null }); }} maxWidth="max-w-lg">
          <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
              <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.createNewBucket')}
              </h2>
              <button type="button" onClick={() => { setIsNewBucketOpen(false); setNewBucketForm({ name: "", nameAr: "", department: "", departmentId: null }); }} className="p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                  {t('manageBylaws.electiveCoursesBucket')}
                </label>
                <input
                  type="text"
                  value={newBucketForm.name}
                  onChange={(e) => setNewBucketForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('manageBylaws.enterBucketName')}
                  className={inputClass}
                  autoFocus
                  />
                </div>

                <div dir="rtl">
                  <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('manageBylaws.electiveCoursesBucket')}
                  </label>
                  <input
                    type="text"
                    value={newBucketForm.nameAr}
                    onChange={(e) => setNewBucketForm(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder={t('manageBylaws.enterBucketName')}
                    className={inputClass}
                  />
                </div>
              </div>

              <SelectBox
                className="w-full"
                label={t('manageBylaws.department')}
                name="bucketDepartment"
                labelDirection="flex-col"
                options={[
                  { value: "", label: t('manageBylaws.allDepartments') },
                  ...bucketDepartments.map(d => ({ value: d.departmentName || d.name, label: d.departmentName || d.name }))
                ]}
                selectedOption={(() => {
                  const dept = bucketDepartments.find(d => (d.departmentName || d.name) === newBucketForm.department);
                  return dept ? { value: dept.departmentName || dept.name, label: dept.departmentName || dept.name } : { value: "", label: t('manageBylaws.allDepartments') };
                })()}
                onChange={(opt) => {
                  const deptObj = bucketDepartments.find(d => (d.departmentName || d.name) === opt.value);
                  setNewBucketForm(prev => ({ ...prev, department: opt.value || "", departmentId: deptObj?.departmentId || deptObj?.id || null }));
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
              <button
                type="button"
                onClick={() => { setIsNewBucketOpen(false); setNewBucketForm({ name: "", nameAr: "", department: "", departmentId: null }); }}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
              >
                {t('common:labels.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmNewBucket}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newBucketForm.name.trim()}
              >
                {t('manageBylaws.createBucket')}
              </button>
            </div>
          </div>
        </ModelOverlay>
      )}

      {/* Edit Bucket Overlay */}
      {editingBucket && (
        <ModelOverlay onClose={() => setEditingBucket(null)} maxWidth="max-w-lg">
          <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
              <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.editBucket')}
              </h2>
              <button type="button" onClick={() => setEditingBucket(null)} className="p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors">
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('manageBylaws.bucketName')}
                  </label>
                  <input
                    type="text"
                    value={editingBucket.name}
                    onChange={(e) => setEditingBucket(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('manageBylaws.enterBucketNamePlaceholder')}
                    className={inputClass}
                    autoFocus
                  />
                </div>
                <div dir="rtl">
                  <label className="block text-sm font-medium mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('manageBylaws.bucketName')}
                  </label>
                  <input
                    type="text"
                    value={editingBucket.nameAr || ""}
                    onChange={(e) => setEditingBucket(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder={t('manageBylaws.enterBucketNamePlaceholder')}
                    className={inputClass}
                  />
                </div>
              </div>

              <SelectBox
                className="w-full"
                label={t('manageBylaws.department')}
                name="editBucketDepartment"
                labelDirection="flex-col"
                options={[
                  { value: "", label: t('manageBylaws.allDepartments') },
                  ...bucketDepartments.map(d => ({ value: d.departmentName || d.name, label: d.departmentName || d.name }))
                ]}
                selectedOption={(() => {
                  const dept = bucketDepartments.find(d => (d.departmentName || d.name) === editingBucket.department);
                  return dept ? { value: dept.departmentName || dept.name, label: dept.departmentName || dept.name } : { value: "", label: t('manageBylaws.allDepartments') };
                })()}
                onChange={(opt) => {
                  const deptObj = bucketDepartments.find(d => (d.departmentName || d.name) === opt.value);
                  setEditingBucket(prev => ({
                    ...prev,
                    department: opt.value || "",
                    departmentId: deptObj?.departmentId || deptObj?.id || null,
                  }));
                }}
              />
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
              <button
                type="button"
                onClick={() => setEditingBucket(null)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
              >
                {t('common:labels.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingBucket.name.trim()) return;
                  setBuckets(prev => prev.map(b => b.id === editingBucket.id ? editingBucket : b));
                  setEditingBucket(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!editingBucket.name.trim()}
              >
                {t('common:labels.save')}
              </button>
            </div>
          </div>
        </ModelOverlay>
      )}

      {/* ═══ Bylaw Details ═══ */}
      {activeTab === "bylawDetails" && (
        <Section>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.details')}
            </span>
            <Button variant="primary" type="button" onClick={handleSaveBylawDetails} disabled={savingBylawDetails}>
              <FloppyDiskIcon size={16} />
              {savingBylawDetails ? t('common:status.saving') : t('common:labels.save')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
              <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.name')}
              </label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">
                {t('manageBylaws.bylawNameDescription')}
              </p>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass}
                placeholder={t('manageBylaws.namePlaceholder')}
              />
            </div>

            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5" dir="rtl">
              <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('manageBylaws.name')}
              </label>
              <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">
                {t('manageBylaws.bylawNameDescription')}
              </p>
              <input
                type="text"
                value={editNameAr}
                onChange={(e) => setEditNameAr(e.target.value)}
                className={inputClass}
                placeholder={t('manageBylaws.namePlaceholder')}
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shrink-0">
                <ClipboardCheckIcon size={20} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageBylaws.bylawType')}</h3>
                <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageBylaws.bylawTypeDesc')}</p>
              </div>
            </div>
            <SelectBox
              className="w-full"
              name="type"
              labelDirection="flex-col"
              showLabel={false}
              options={bylawTypes}
              selectedOption={selectedBylawType}
              onChange={(option) => setSelectedBylawType(option)}
            />
          </div>

          <div className="mt-6 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.description')}
            </label>
            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">
              {t('manageBylaws.descriptionDescription')}
            </p>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark focus:outline-none focus:border-border-primary-active-light resize-none"
              placeholder={t('manageBylaws.descriptionPlaceholder')}
            />
          </div>

          <div className="mt-6 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5" dir="rtl">
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.description')}
            </label>
            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">
              {t('manageBylaws.descriptionDescription')}
            </p>
            <textarea
              value={editDescriptionAr}
              onChange={(e) => setEditDescriptionAr(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark focus:outline-none focus:border-border-primary-active-light resize-none"
              placeholder={t('manageBylaws.descriptionPlaceholder')}
            />
          </div>

          <div className="mt-6 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
            <label className="block text-sm font-semibold mb-1.5 text-text-primary-default-light dark:text-text-primary-default-dark">
              {t('manageBylaws.documents')}
            </label>
            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">
              {t('manageBylaws.documentsDesc')}
            </p>

            {/* Existing documents */}
            {bylaw.fileName && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setDocumentPreviewTarget(bylaw)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors w-full text-start"
                >
                  <FileIcon size={18} className="shrink-0 text-text-accent-active-light dark:text-text-accent-active-dark" />
                  <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate flex-1">
                    {bylaw.fileName}
                  </span>
                  <span className="text-[10px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark uppercase shrink-0">{t('manageBylaws.clickToPreview')}</span>
                </button>
              </div>
            )}

            {/* New files to upload */}
            {newFiles.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {newFiles.map((file, fi) => (
                  <div key={fi} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark border border-border-accent-default-light dark:border-border-accent-default-dark">
                    <FileIcon size={16} className="shrink-0 text-text-accent-active-light dark:text-text-accent-active-dark" />
                    <span className="text-sm text-text-primary-default-light dark:text-text-primary-default-dark truncate flex-1">{file.name}</span>
                    <span className="text-[10px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">({(file.size / 1024).toFixed(0)} KB)</span>
                    <button
                      type="button"
                      onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== fi))}
                      className="shrink-0 p-1 rounded-md text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Choose File button */}
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors cursor-pointer">
              <CloudUploadIcon size={18} />
              {newFiles.length > 0 ? t('manageBylaws.addAnotherFile') : t('manageBylaws.chooseFile')}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setNewFiles(prev => [...prev, ...files]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>
        </Section>
      )}

      {/* Document Preview Overlay */}
      {documentPreviewTarget && (
        <ModelOverlay onClose={() => setDocumentPreviewTarget(null)} maxWidth="max-w-5xl">
          <div className="w-full overflow-hidden rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-xl">
            <div className="flex items-center justify-between border-b border-border-primary-default-light dark:border-border-primary-default-dark px-5 py-4">
              <div>
                <h4 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                  {documentPreviewTarget.fileName || t('manageBylaws.documentPreviewTitle')}
                </h4>
                <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-0.5">{t('manageBylaws.documentPreviewSubtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${API_URL}/api/Bylaw/${documentPreviewTarget.bylawId ?? documentPreviewTarget.id}/download`}
                  download
                  className="inline-flex items-center gap-2 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark px-3.5 py-2 text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                >
                  <DownloadIcon size={14} />
                  {t('common:labels.download')}
                </a>
                <button
                  type="button"
                  onClick={() => setDocumentPreviewTarget(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                  aria-label={t('manageBylaws.closePreview')}
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>
            <MaterialPreview
              type={0}
              title={documentPreviewTarget.fileName || t('manageBylaws.document')}
              viewUrl={`${API_URL}/api/Bylaw/${documentPreviewTarget.bylawId ?? documentPreviewTarget.id}/view`}
              downloadUrl={`${API_URL}/api/Bylaw/${documentPreviewTarget.bylawId ?? documentPreviewTarget.id}/download`}
            />
          </div>
        </ModelOverlay>
      )}

      {/* Specialization Prerequisite Selection Overlay */}
      {specPrereqTarget && (
        <ModelOverlay onClose={() => { setSpecPrereqTarget(null); setSpecPrereqSelectedCourses([]); setSpecPrereqMinGrades({}); }} maxWidth="max-w-2xl">
          <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                  {t('manageBylaws.setPrerequisites')}
                </h2>
                <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark truncate">
                  {t('manageBylaws.specPrereqFor', { name: specPrereqTarget.specName })}
                </p>
              </div>
              <button type="button" onClick={() => { setSpecPrereqTarget(null); setSpecPrereqSelectedCourses([]); setSpecPrereqMinGrades({}); }} className="ms-auto p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors shrink-0">
                <XIcon size={20} />
              </button>
            </div>

            <div className="px-5 py-3">
              <input
                type="text"
                value={specPrereqSearchQuery}
                onChange={(e) => setSpecPrereqSearchQuery(e.target.value)}
                placeholder={t('manageBylaws.searchCourses')}
                className={`w-full ${inputClass}`}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 space-y-2 min-h-0 no-scrollbar">
              {allCourses
                .filter((c) =>
                  !specPrereqSearchQuery ||
                  c.courseName?.toLowerCase().includes(specPrereqSearchQuery.toLowerCase()) ||
                  c.courseCode?.toLowerCase().includes(specPrereqSearchQuery.toLowerCase())
                )
                .map((course) => {
                  const isSelected = specPrereqSelectedCourses.includes(course.courseId);
                  const sortedGrades = [...gradeScales]
                    .filter(g => g.gradeLetter.trim())
                    .sort((a, b) => b.sortOrder - a.sortOrder);
                  const gradeOptions = sortedGrades.map(g => ({
                    value: g.gradeLetter,
                    label: g.gradeLetter,
                  }));
                  const passingIndex = sortedGrades.findIndex(
                    g => g.gradeLetter?.toLowerCase() === minPassingGradeLetter?.toLowerCase()
                  );
                  const minGradeLetter = passingIndex >= 0 ? sortedGrades[passingIndex].gradeLetter : (sortedGrades[sortedGrades.length - 1]?.gradeLetter || "");
                  const selectedGrade = specPrereqMinGrades[course.courseId]
                    ? gradeOptions.find(o => o.value === specPrereqMinGrades[course.courseId]) || null
                    : null;
                  return (
                    <div
                      key={course.courseId}
                      className={`rounded-lg border transition-colors ${
                        isSelected
                          ? "border-border-accent-default-light dark:border-border-accent-default-dark bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark"
                          : "border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                      }`}
                    >
                      <label className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSpecPrereqSelectedCourses(prev =>
                              isSelected
                                ? prev.filter(id => id !== course.courseId)
                                : [...prev, course.courseId]
                            );
                            if (isSelected) {
                              setSpecPrereqMinGrades(prev => {
                                const next = { ...prev };
                                delete next[course.courseId];
                                return next;
                              });
                            } else {
                              setSpecPrereqMinGrades(prev => ({
                                ...prev,
                                [course.courseId]: minGradeLetter,
                              }));
                            }
                          }}
                          className="rounded border-border-primary-default-light dark:border-border-primary-default-dark text-text-accent-active-light focus:ring-text-accent-active-light"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                            {course.courseName}
                          </p>
                          <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {course.courseCode}
                          </p>
                        </div>
                      </label>
                      {isSelected && (
                        <div className="px-3 pb-3 pt-0 border-t border-border-primary-default-light dark:border-border-primary-default-dark mx-3">
                          <div className="flex items-center gap-3 mt-2">
                            <label className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">
                              {t('manageBylaws.minGradeFor', { code: course.courseCode || course.courseName })}
                            </label>
                            <SelectBox
                              options={gradeOptions}
                              selectedOption={selectedGrade}
                              onChange={(opt) => setSpecPrereqMinGrades(prev => ({
                                ...prev,
                                [course.courseId]: opt.value,
                              }))}
                              compact
                              showLabel={false}
                              className="w-24"
                            />
                            <span className="text-[10px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                              {t('manageBylaws.passingIs', { grade: minGradeLetter })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              {allCourses.filter((c) =>
                !specPrereqSearchQuery ||
                c.courseName?.toLowerCase().includes(specPrereqSearchQuery.toLowerCase()) ||
                c.courseCode?.toLowerCase().includes(specPrereqSearchQuery.toLowerCase())
              ).length === 0 && (
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-4 text-center">
                  {t('manageBylaws.noCoursesFound')}
                </p>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
              <button
                type="button"
                onClick={() => { setSpecPrereqTarget(null); setSpecPrereqSelectedCourses([]); setSpecPrereqMinGrades({}); }}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors"
              >
                {t('common:labels.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmSpecPrereqSelection}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('manageBylaws.saveCount', { count: specPrereqSelectedCourses.length })}
              </button>
            </div>
          </div>
        </ModelOverlay>
      )}

      {/* Toggle Active Confirmation */}
      <Dialog
        isOpen={isToggleActiveOpen}
        variant="warning"
        title={bylaw.isActive ? t('manageBylaws.deactivateBylaw') : t('manageBylaws.activateBylaw')}
        onClose={() => setIsToggleActiveOpen(false)}
        onConfirm={() => { handleToggleActive(); return true; }}
        confirmText={bylaw.isActive ? t('manageBylaws.deactivate') : t('manageBylaws.activate')}
        cancelText={t('common:labels.cancel')}
        showCloseButton={true}
      >
        <Trans
          i18nKey="manageBylaws.toggleConfirmMessage"
          ns="admin"
          values={{
            action: bylaw.isActive ? t('manageBylaws.deactivate') : t('manageBylaws.activate'),
            name: bylaw.name,
          }}
          components={[<strong key="action" />, <strong key="name" />]}
        />
      </Dialog>
    </div>
  );
}
