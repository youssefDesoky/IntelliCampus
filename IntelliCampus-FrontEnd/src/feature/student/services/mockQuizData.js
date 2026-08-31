const MOCK_QUIZZES = [
  {
    id: 1001,
    title: "Introduction to Programming Concepts",
    maxScore: 100,
    dueDate: "2026-07-15T23:59:00",
    durationMinutes: 30,
    status: "active",
  },
  {
    id: 1002,
    title: "Data Structures & Algorithms Fundamentals",
    maxScore: 80,
    dueDate: "2026-07-20T23:59:00",
    durationMinutes: 45,
    status: "active",
  },
];

const MOCK_HISTORY = [
  {
    id: 9001,
    title: "Week 1 - Variables & Types",
    score: 18,
    maxScore: 20,
    dueDate: "2026-06-01T23:59:00",
    durationMinutes: 15,
    status: "Completed",
  },
  {
    id: 9002,
    title: "Week 2 - Control Flow",
    score: 14,
    maxScore: 20,
    dueDate: "2026-06-08T23:59:00",
    durationMinutes: 20,
    status: "Completed",
  },
  {
    id: 9003,
    title: "Week 3 - Functions",
    score: 0,
    maxScore: 25,
    dueDate: "2026-06-15T23:59:00",
    durationMinutes: 25,
    status: "Missed",
  },
];

const MOCK_QUESTIONS_POOL = [
  {
    id: "q1",
    type: "TF",
    prompt: "A variable declared with 'const' in JavaScript can be reassigned a new value.",
    points: 5,
    correctAnswer: false,
    options: null,
  },
  {
    id: "q2",
    type: "TF",
    prompt: "The '===' operator in JavaScript compares both value and type.",
    points: 5,
    correctAnswer: true,
    options: null,
  },
  {
    id: "q3",
    type: "MCQ",
    prompt: "Which of the following is NOT a primitive data type in JavaScript?",
    points: 10,
    correctAnswer: "Array",
    options: ["String", "Number", "Boolean", "Array", "Undefined"],
  },
  {
    id: "q4",
    type: "MCQ",
    prompt: "What does the 'map()' method return?",
    points: 10,
    correctAnswer: "A new array with transformed elements",
    options: [
      "The original array modified in place",
      "A new array with transformed elements",
      "A boolean indicating success",
      "The length of the new array",
    ],
  },
  {
    id: "q5",
    type: "MCQ",
    prompt: "Which HTTP method is typically used to update an existing resource?",
    points: 10,
    correctAnswer: "PUT",
    options: ["GET", "POST", "PUT", "DELETE"],
  },
  {
    id: "q6",
    type: "TF",
    prompt: "In React, state updates are applied synchronously within the same render cycle.",
    points: 5,
    correctAnswer: false,
    options: null,
  },
  {
    id: "q7",
    type: "Written",
    prompt: "Explain the concept of 'closure' in JavaScript and provide a practical example of where you would use one.",
    points: 20,
    correctAnswer: null,
    options: null,
  },
  {
    id: "q8",
    type: "MCQ",
    prompt: "What is the time complexity of binary search?",
    points: 10,
    correctAnswer: "O(log n)",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
  },
  {
    id: "q9",
    type: "TF",
    prompt: "CSS Grid is a one-dimensional layout system, while Flexbox is two-dimensional.",
    points: 5,
    correctAnswer: false,
    options: null,
  },
  {
    id: "q10",
    type: "Written",
    prompt: "Describe the difference between 'let' and 'var' in JavaScript. When would you use each?",
    points: 20,
    correctAnswer: null,
    options: null,
  },
];

export function getMockQuizOverview() {
  return {
    data: [
      {
        upcoming: MOCK_QUIZZES,
        history: MOCK_HISTORY,
        stats: {
          completed: MOCK_HISTORY.filter((q) => q.status === "Completed").length,
          missed: MOCK_HISTORY.filter((q) => q.status === "Missed").length,
          averageScore: Math.round(
            MOCK_HISTORY.reduce((sum, q) => sum + (q.maxScore ? (q.score / q.maxScore) * 100 : 0), 0) /
              MOCK_HISTORY.filter((q) => q.maxScore > 0).length
          ),
        },
      },
    ],
  };
}

export function getMockPracticeQuiz(quizId) {
  const quiz = MOCK_QUIZZES.find((q) => String(q.id) === String(quizId)) || MOCK_QUIZZES[0];

  const totalPoints = MOCK_QUESTIONS_POOL.reduce((sum, q) => sum + q.points, 0);
  const tfCount = MOCK_QUESTIONS_POOL.filter((q) => q.type === "TF").length;
  const mcqCount = MOCK_QUESTIONS_POOL.filter((q) => q.type === "MCQ").length;
  const writtenCount = MOCK_QUESTIONS_POOL.filter((q) => q.type === "Written").length;

  return {
    quizId: quiz.id,
    title: quiz.title,
    courseName: "Introduction to Computer Science",
    durationSeconds: quiz.durationMinutes * 60,
    maxAttempts: 2,
    totalPoints,
    dueDate: quiz.dueDate,
    description: "This quiz covers key concepts from the recent lessons. Read each question carefully and manage your time wisely.",
    instructions: "You have 30 minutes to complete 10 questions. You can navigate between questions freely. Ensure you submit before the timer runs out — unanswered questions will be marked as incorrect.",
    passingScore: 60,
    questionsSummary: {
      total: MOCK_QUESTIONS_POOL.length,
      tf: tfCount,
      mcq: mcqCount,
      written: writtenCount,
    },
    questions: MOCK_QUESTIONS_POOL,
    previousSubmission: null,
  };
}

export function getMockSubmitResult(answers) {
  const results = MOCK_QUESTIONS_POOL.map((q) => {
    const userAnswer = answers[q.id];
    let isCorrect = false;

    if (q.type === "TF") {
      isCorrect = userAnswer === q.correctAnswer;
    } else if (q.type === "MCQ") {
      isCorrect = userAnswer === q.correctAnswer;
    } else {
      isCorrect = typeof userAnswer === "string" && userAnswer.trim().length > 0;
    }

    return {
      questionId: q.id,
      isCorrect,
      earnedPoints: isCorrect ? q.points : 0,
      points: q.points,
      feedback: isCorrect
        ? null
        : q.type === "Written"
          ? "Your answer has been submitted for review."
          : `The correct answer was: ${q.correctAnswer}`,
    };
  });

  const totalEarned = results.reduce((sum, r) => sum + r.earnedPoints, 0);
  const totalPossible = results.reduce((sum, r) => sum + r.points, 0);

  const tfResults = results.filter((_, i) => MOCK_QUESTIONS_POOL[i].type === "TF");
  const mcqResults = results.filter((_, i) => MOCK_QUESTIONS_POOL[i].type === "MCQ");
  const writtenResults = results.filter((_, i) => MOCK_QUESTIONS_POOL[i].type === "Written");

  return {
    percentage: Math.round((totalEarned / totalPossible) * 100),
    score: totalEarned,
    maxScore: totalPossible,
    byType: {
      TF: {
        answered: tfResults.filter((r) => r.earnedPoints > 0).length,
        total: tfResults.length,
      },
      MCQ: {
        answered: mcqResults.filter((r) => r.earnedPoints > 0).length,
        total: mcqResults.length,
      },
      Written: {
        answered: writtenResults.filter((r) => r.earnedPoints > 0).length,
        total: writtenResults.length,
      },
    },
    questionResults: results,
  };
}
