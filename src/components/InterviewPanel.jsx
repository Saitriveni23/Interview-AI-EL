import React, { useEffect, useState } from "react";

// ==========================================
// 1. LOCAL TECHNICAL QUESTION BANK
// ==========================================

const questionBank = {
  react: [
    {
      difficulty: "Beginner",
      question: "What is the difference between props and state in React?"
    },
    {
      difficulty: "Intermediate",
      question: "What is the purpose of useEffect in React?"
    },
    {
      difficulty: "Advanced",
      question: "How does React reconciliation work?"
    }
  ],

  python: [
    {
      difficulty: "Beginner",
      question: "What is the difference between a list and a tuple in Python?"
    },
    {
      difficulty: "Intermediate",
      question: "What are decorators in Python?"
    },
    {
      difficulty: "Advanced",
      question: "What is the Global Interpreter Lock in Python?"
    }
  ],

  javascript: [
    {
      difficulty: "Beginner",
      question: "What is the difference between let, const, and var?"
    },
    {
      difficulty: "Intermediate",
      question: "What is asynchronous programming in JavaScript?"
    },
    {
      difficulty: "Advanced",
      question: "Explain the JavaScript event loop."
    }
  ],

  sql: [
    {
      difficulty: "Beginner",
      question: "What is a primary key in SQL?"
    },
    {
      difficulty: "Intermediate",
      question: "What is the difference between INNER JOIN and LEFT JOIN?"
    },
    {
      difficulty: "Advanced",
      question: "How can you optimize a slow SQL query?"
    }
  ],

  java: [
    {
      difficulty: "Beginner",
      question: "What is inheritance in Java?"
    },
    {
      difficulty: "Intermediate",
      question: "What is the difference between an abstract class and an interface?"
    },
    {
      difficulty: "Advanced",
      question: "How does garbage collection work in Java?"
    }
  ],

  c: [
    {
      difficulty: "Beginner",
      question: "What is the difference between a variable and a constant in C?"
    },
    {
      difficulty: "Intermediate",
      question: "What is a pointer in C programming?"
    },
    {
      difficulty: "Advanced",
      question: "Explain dynamic memory allocation using malloc and free."
    }
  ]
};

// ==========================================
// 2. DEFAULT TECHNICAL QUESTIONS
// ==========================================

const defaultTechnicalQuestions = [
  {
    skill: "Programming",
    difficulty: "Beginner",
    question: "What is the difference between a compiler and an interpreter?",
    source: "local",
    category: "Technical"
  },
  {
    skill: "Problem Solving",
    difficulty: "Intermediate",
    question: "How would you find the largest element in an array?",
    source: "local",
    category: "Technical"
  },
  {
    skill: "Software Engineering",
    difficulty: "Intermediate",
    question: "What is the purpose of Git in software development?",
    source: "local",
    category: "Technical"
  },
  {
    skill: "Programming",
    difficulty: "Intermediate",
    question: "Explain the difference between a stack and a queue.",
    source: "local",
    category: "Technical"
  }
];

// ==========================================
// 3. BEHAVIORAL QUESTIONS
// ==========================================

const behavioralQuestions = [
  {
    skill: "Communication",
    difficulty: "Intermediate",
    question:
      "Tell me about a challenging project you worked on. What difficulties did you face, and how did you overcome them?",
    source: "local",
    category: "Behavioral"
  },
  {
    skill: "Teamwork",
    difficulty: "Intermediate",
    question:
      "Describe a situation where you disagreed with a team member. How did you handle the situation?",
    source: "local",
    category: "Behavioral"
  }
];

// ==========================================
// 4. SITUATIONAL QUESTION
// ==========================================

const situationalQuestions = [
  {
    skill: "Problem Solving",
    difficulty: "Intermediate",
    question:
      "Imagine your application suddenly stops working just before an important demonstration. What steps would you take to identify and resolve the problem?",
    source: "local",
    category: "Situational"
  }
];

// ==========================================
// 5. SEPARATE KNOWN AND UNKNOWN SKILLS
// ==========================================

function separateSkills(candidateSkills = []) {
  const localQuestions = [];
  const unknownSkills = [];

  const skills = Array.isArray(candidateSkills)
    ? candidateSkills
    : [];

  const uniqueSkills = [
    ...new Set(
      skills
        .map((skill) => String(skill).trim())
        .filter(Boolean)
    )
  ];

  for (const skill of uniqueSkills) {
    const skillName = skill.toLowerCase();

    if (questionBank[skillName]) {
      questionBank[skillName].forEach((item) => {
        localQuestions.push({
          skill,
          difficulty: item.difficulty,
          question: item.question,
          source: "local",
          category: "Technical"
        });
      });
    } else {
      unknownSkills.push(skill);
    }
  }

  return {
    localQuestions,
    unknownSkills
  };
}

// Resume-based questions use actual resume excerpts, never invented experience.
// The extracted lines are only question context, not proof of experience.
function buildResumeQuestions(resumeText = "") {
  const lines = String(resumeText)
    .split(/\r?\n|[•●]/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 25 && line.length <= 350);

  const candidates = lines.filter((line) =>
    /\b(project|internship|intern|developed|built|implemented|designed|created|led|research|hackathon|experience|achievement|application|system|website|model)\b/i.test(line) &&
    !/^(name|email|phone|address|contact|objective|summary)\s*:/i.test(line)
  );
  const unique = [...new Set(candidates.map((line) => line.toLowerCase()))]
    .map((lower) => candidates.find((line) => line.toLowerCase() === lower));
  const selected = unique.slice(0, 2);
  const questions = selected.map((claim, index) => ({
    category: "Resume-Based",
    skill: "Resume Experience",
    difficulty: "Intermediate",
    source: "resume",
    resumeClaim: claim,
    question: index === 0
      ? `Your resume mentions: "${claim}". Explain what you personally contributed, the tools you used, and the outcome.`
      : `Your resume mentions: "${claim}". Describe the technical decisions, challenges, and your specific role.`
  }));
  while (questions.length < 2) {
    questions.push({
      category: "Resume-Based",
      skill: "Project Reflection",
      difficulty: "Intermediate",
      source: "general",
      resumeClaim: "",
      question: questions.length === 0
        ? "Describe a project, internship, or learning activity you completed. What did you personally contribute?"
        : "Describe a technical challenge you faced in a project or learning activity and how you approached it."
    });
  }
  return questions;
}

// ==========================================
// ROLE-TARGETED QUESTIONS
// Generates role/company-specific questions
// so the mock interview reflects the actual
// target job, not just the candidate's skills.
// ==========================================

function buildRoleTargetedQuestions(targetInfo) {
  if (!targetInfo?.role || targetInfo.role === 'Software Engineer') return [];
  const { role, company, experienceLevel } = targetInfo;
  const companyCtx = company && company !== 'Target Company' ? ` at ${company}` : '';
  const levelCtx = experienceLevel ? ` (${experienceLevel})` : '';
  return [
    {
      skill: role,
      difficulty: 'Intermediate',
      question: `As a candidate for the ${role} position${companyCtx}${levelCtx}, describe how you would approach designing and shipping a new feature — from requirement gathering through to production deployment. What tools, processes, and practices would you follow?`,
      source: 'role-targeted',
      category: 'Technical'
    }
  ];
}

// ==========================================
// 6. SELECT EXACTLY 7 QUESTIONS
// ==========================================

function buildInterviewQuestions(
  localQuestions = [],
  geminiQuestions = [],
  redactedResumeText = "",
  roleTargetedQuestions = []
) {
  const technicalQuestions = [];
  const usedQuestions = new Set();

  function addQuestion(item) {
    if (!item || typeof item.question !== "string") {
      return;
    }

    const questionText = item.question.trim();

    if (!questionText) {
      return;
    }

    const questionKey = questionText.toLowerCase();

    if (usedQuestions.has(questionKey)) {
      return;
    }

    if (technicalQuestions.length >= 3) {
      return;
    }

    usedQuestions.add(questionKey);

    technicalQuestions.push({
      ...item,
      question: questionText,
      category: "Technical"
    });
  }

  // Role-targeted questions take first priority so they appear
  // in the interview regardless of local question bank coverage.
  roleTargetedQuestions.forEach(addQuestion);

  localQuestions.forEach(addQuestion);

  geminiQuestions.forEach(addQuestion);

  defaultTechnicalQuestions.forEach(addQuestion);

  return [
    ...technicalQuestions,
    behavioralQuestions[0],
    situationalQuestions[0],
    ...buildResumeQuestions(redactedResumeText)
  ];
}

// ==========================================
// DEMONSTRATION DATA — NOT AN AI ASSESSMENT
// ==========================================
const DEMO_RUBRICS = {
  Technical: [
    ["Technical Correctness", 4], ["Conceptual Understanding", 2],
    ["Completeness", 2], ["Example or Application", 1], ["Clarity", 1]
  ],
  Behavioral: [
    ["Relevant Situation", 2], ["Personal Responsibility", 2],
    ["Actions Taken", 3], ["Outcome and Learning", 2], ["Clarity", 1]
  ],
  Situational: [
    ["Problem Identification", 2], ["Proposed Actions", 3],
    ["Reasoning", 2], ["Practicality", 2], ["Clarity", 1]
  ],
  "Resume-Based": [
    ["Technical Explanation", 3], ["Personal Contribution", 3],
    ["Decisions and Challenges", 2], ["Outcome and Learning", 1], ["Clarity", 1]
  ]
};

function buildDemoEvaluation(answers) {
  // These scores are illustrative and DO NOT depend on the user's answers.
  const sampleScores = [8, 7, 8, 7, 8, 6, 7];
  const questionEvaluations = answers.map((item, index) => {
    let remaining = sampleScores[index] ?? 7;
    const rubricBreakdown = DEMO_RUBRICS[item.category].map(([label, maxScore], criterionIndex) => {
      const score = Math.min(maxScore, remaining);
      remaining -= score;
      return {
        key: `${criterionIndex}`,
        label,
        score,
        maxScore,
        explanation: "Illustrative criterion score for interface demonstration only."
      };
    });
    return {
      questionNumber: index + 1,
      category: item.category,
      question: item.question,
      answer: item.answer,
      score: sampleScores[index] ?? 7,
      rubricBreakdown,
      feedback: "Sample feedback: This is a demonstration of how Gemini feedback will appear.",
      improvement: "Sample suggestion: Include a specific example and explain your reasoning."
    };
  });
  const categoryScores = {};
  for (const category of ["Technical", "Behavioral", "Situational", "Resume-Based"]) {
    const selected = questionEvaluations.filter((q) => q.category === category);
    categoryScores[category] = selected.length
      ? Math.round(selected.reduce((sum, q) => sum + q.score, 0) / selected.length * 10) / 10
      : null;
  }
  return {
    status: "completed",
    source: "demo",
    overallScore: Math.round(questionEvaluations.reduce((sum, q) => sum + q.score, 0) / questionEvaluations.length * 10) / 10,
    categoryScores,
    questionEvaluations,
    strengths: ["Sample strength: Clear communication"],
    improvementAreas: ["Sample improvement area: More detailed examples"],
    recommendations: ["Sample recommendation: Practise explaining technical decisions"],
    summary: "DEMO DATA ONLY: Scores and comments are predefined examples, not an assessment of these answers.",
    resumeConsistency: {
      status: "DEMO_SAMPLE",
      findings: answers.filter((item) => item.category === "Resume-Based").map((item) => ({
        questionNumber: item.questionNumber,
        claimExcerpt: item.answer.slice(0, 200),
        status: "NOT_EVALUATED_DEMO",
        resumeEvidence: "",
        note: "Demo preview only. No Gemini comparison or evidence validation was performed."
      }))
    }
  };
}

// ==========================================
// 7. MAIN INTERVIEW COMPONENT
// ==========================================

export default function InterviewPanel({
  targetInfo,
  candidateSkills = [],
  redactedResumeText = ""
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);

  // AI evaluation states
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");

  const skillsKey = JSON.stringify(
    Array.isArray(candidateSkills) ? candidateSkills : []
  );

  // ==========================================
  // 8. LOAD INTERVIEW QUESTIONS
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuestions() {
      setLoading(true);
      setError("");

      setCurrentQuestion(0);
      setAnswer("");
      setAnswers([]);
      setCompleted(false);

      setEvaluation(null);
      setEvaluationError("");
      setEvaluating(false);

      const skills = JSON.parse(skillsKey);

      const {
        localQuestions,
        unknownSkills
      } = separateSkills(skills);

      let geminiQuestions = [];

      if (
        unknownSkills.length > 0 &&
        localQuestions.length < 3
      ) {
        try {
          const response = await fetch(
            "/api/resume/generate-questions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                skills: unknownSkills
              }),
              signal: controller.signal
            }
          );

          if (!response.ok) {
            throw new Error(
              `Gemini question request failed: ${response.status}`
            );
          }

          const data = await response.json();

          if (
            !data.success ||
            !Array.isArray(data.questions)
          ) {
            throw new Error(
              "Invalid questions received from Gemini."
            );
          }

          geminiQuestions = data.questions
            .filter(
              (item) =>
                item &&
                typeof item.question === "string" &&
                item.question.trim()
            )
            .map((item) => ({
              skill:
                item.skill ||
                unknownSkills[0] ||
                "Technical",
              difficulty:
                item.difficulty ||
                "Intermediate",
              question: item.question,
              source: "gemini",
              category: "Technical"
            }));

        } catch (err) {
          if (controller.signal.aborted) {
            return;
          }

          console.error(
            "Gemini question generation failed:",
            err
          );

          setError(
            "Gemini questions are temporarily unavailable. " +
            "Your interview will continue using the local question bank."
          );
        }
      }

      if (controller.signal.aborted) {
        return;
      }

      const finalQuestions = buildInterviewQuestions(
        localQuestions,
        geminiQuestions,
        redactedResumeText,
        buildRoleTargetedQuestions(targetInfo)
      );

      setQuestions(finalQuestions);
      setLoading(false);
    }

    loadQuestions();

    return () => {
      controller.abort();
    };
  }, [skillsKey, redactedResumeText]);

  // ==========================================
  // 9. HANDLE NEXT QUESTION
  // ==========================================

  const handleNext = () => {
    if (!answer.trim()) {
      alert(
        "Please enter your answer before continuing."
      );
      return;
    }

    const question = questions[currentQuestion];

    const updatedAnswers = [
      ...answers,
      {
        questionNumber: currentQuestion + 1,
        category: question.category,
        skill: question.skill,
        difficulty: question.difficulty,
        question: question.question,
        answer: answer.trim(),
        source: question.source,
        resumeClaim: question.resumeClaim || ""
      }
    ];

    setAnswers(updatedAnswers);
    setAnswer("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCompleted(true);
    }
  };

  // ==========================================
  // 10. AI EVALUATION
  // ==========================================

  const handleEvaluate = async () => {
    if (evaluating || !completed) {
      return;
    }

    setEvaluating(true);
    setEvaluationError("");

    try {
      const response = await fetch(
        "/api/resume/evaluate-interview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            answers,
            redactedResumeText
          })
        }
      );

      // Read the response as text first.
      // This prevents an unclear JSON parsing error.
      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new Error(
          "The backend returned an empty response. " +
          "Please check whether your backend server is running."
        );
      }

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "The backend returned an invalid response. " +
          "Please check the VS Code backend terminal."
        );
      }

      if (!response.ok || !data.success || !data.evaluation) {
        throw new Error(
          data.error ||
          "AI evaluation is temporarily unavailable."
        );
      }

      setEvaluation(data.evaluation);

    } catch (err) {
      console.error("Interview evaluation error:", err);

      setEvaluationError(
        err.message ||
        "AI evaluation is temporarily unavailable."
      );

    } finally {
      setEvaluating(false);
    }
  };

  const handleDemoEvaluation = () => {
    if (!completed || answers.length !== 7) return;
    setEvaluation(buildDemoEvaluation(answers));
    setEvaluationError("");
  };

  // ==========================================
  // 11. RESTART INTERVIEW
  // ==========================================

  const restartInterview = () => {
    setCurrentQuestion(0);
    setAnswer("");
    setAnswers([]);
    setCompleted(false);

    setEvaluation(null);
    setEvaluationError("");
    setEvaluating(false);
  };

  // ==========================================
  // 12. LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-white">

        <h2 className="text-2xl font-bold mb-4">
          Preparing Your Interview...
        </h2>

        <p className="text-indigo-400">
          Selecting technical, behavioral, situational, and resume-based questions.
        </p>

      </div>
    );
  }

  // ==========================================
  // 13. INTERVIEW USER INTERFACE
  // ==========================================

  return (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-white">

      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 flex-wrap">
        <span>Adaptive AI Mock Interview</span>
        {targetInfo?.company && (
          <span className="text-indigo-400 font-normal text-lg">
            • {targetInfo.role || 'Software Engineer'} @ {targetInfo.company}
          </span>
        )}
      </h2>

      <p className="text-slate-400 mb-6 text-sm">
        Complete 7 interview questions customized for {targetInfo?.company ? `${targetInfo.company} hiring benchmarks` : 'technical hiring evaluations'}, covering technical depth, behavioral scenarios, and resume verification.
      </p>

      {/* QUESTION GENERATION WARNING */}

      {error && (
        <div className="bg-amber-950/30 border border-amber-700 rounded-xl p-4 mb-6">
          <p className="text-amber-400">
            {error}
          </p>
        </div>
      )}

      {/* ====================================== */}
      {/* INTERVIEW QUESTIONS */}
      {/* ====================================== */}

      {!completed && questions.length > 0 ? (
        <>

          {/* QUESTION PROGRESS */}

          <div className="mb-6">

            <p className="text-indigo-400 mb-3">
              Question {currentQuestion + 1} of {questions.length}
            </p>

            <div className="w-full bg-slate-800 rounded-full h-2">

              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestion + 1) / questions.length) * 100
                  }%`
                }}
              />

            </div>

          </div>

          {/* QUESTION CATEGORY */}

          <div className="flex flex-wrap gap-3 mb-5">

            <span className="bg-indigo-950 text-indigo-300 px-3 py-2 rounded-lg text-sm">
              {questions[currentQuestion].category}
            </span>

            <span className="bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm">
              Skill: {questions[currentQuestion].skill}
            </span>

            <span className="bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-sm">
              Difficulty: {questions[currentQuestion].difficulty}
            </span>

          </div>

          {/* QUESTION SOURCE */}

          <p className="text-sm text-emerald-400 mb-4">
            Source:{" "}
            {questions[currentQuestion].source === "gemini"
              ? "Gemini AI"
              : questions[currentQuestion].source === "resume"
                 ? "Your Redacted Resume"
                 : questions[currentQuestion].source === "general"
                   ? "General Reflection"
                   : questions[currentQuestion].source === "role-targeted"
                     ? `Role-Targeted (${targetInfo?.role || 'Engineering'})`
                     : "Local Question Bank"}
          </p>

          {/* QUESTION */}

          <h3 className="text-xl font-semibold mb-6">
            {questions[currentQuestion].question}
          </h3>

          {/* ANSWER INPUT */}

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />

          {/* NEXT BUTTON */}

          <button
            onClick={handleNext}
            className="mt-5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold"
          >
            {currentQuestion === questions.length - 1
              ? "Finish Interview"
              : "Next Question"}
          </button>

        </>

      ) : completed ? (

        // ======================================
        // INTERVIEW COMPLETION SCREEN
        // ======================================

        <>

          <div className="bg-emerald-950/30 border border-emerald-800 rounded-xl p-6 mb-6">

            <h3 className="text-2xl font-bold text-emerald-400 mb-3">
              Interview Completed!
            </h3>

            <p className="text-slate-300">
              You successfully answered {answers.length} questions.
            </p>

          </div>

          {evaluation?.source === "demo" && (
            <div className="bg-amber-950/40 border border-amber-500 rounded-xl p-4 mb-6">
              <strong className="text-amber-300">DEMO MODE — SAMPLE RESULTS ONLY</strong>
              <p className="text-slate-200 mt-2">No Gemini evaluation or resume verification was performed.</p>
              <button onClick={handleEvaluate} disabled={evaluating}
                className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-50">
                {evaluating ? "Requesting Gemini..." : "Try Real Gemini Evaluation"}
              </button>
              {evaluationError && <p role="alert" className="text-amber-300 mt-2">{evaluationError}</p>}
            </div>
          )}

          {/* INTERVIEW SUMMARY */}

          <h3 className="text-xl font-semibold mb-4">
            Interview Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">

              <p className="text-slate-400 text-sm mb-2">
                Technical Questions
              </p>

              <p className="text-2xl font-bold text-indigo-400">
                {answers.filter(
                  (item) => item.category === "Technical"
                ).length} / 3
              </p>

            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">

              <p className="text-slate-400 text-sm mb-2">
                Behavioral Questions
              </p>

              <p className="text-2xl font-bold text-indigo-400">
                {answers.filter(
                  (item) => item.category === "Behavioral"
                ).length} / 1
              </p>

            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">

              <p className="text-slate-400 text-sm mb-2">
                Situational Questions
              </p>

              <p className="text-2xl font-bold text-indigo-400">
                {answers.filter(
                  (item) => item.category === "Situational"
                ).length} / 1
              </p>

            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
              <p className="text-slate-400 text-sm mb-2">Resume-Based Questions</p>
              <p className="text-2xl font-bold text-indigo-400">
                {answers.filter((item) => item.category === "Resume-Based").length} / 2
              </p>
            </div>

          </div>

          {/* RECORDED ANSWERS */}

          <h3 className="text-xl font-semibold mb-4">
            Your Interview Responses
          </h3>

          <div className="space-y-4 mb-6">

            {answers.map((item, index) => (
              <div
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5"
              >

                <p className="text-indigo-400 text-sm mb-2">
                  Question {item.questionNumber} — {item.category}
                </p>

                <h4 className="font-semibold mb-3">
                  {item.question}
                </h4>

                <p className="text-slate-300 whitespace-pre-wrap">
                  {item.answer}
                </p>

              </div>
            ))}

          </div>

          {/* ====================================== */}
          {/* AI EVALUATION BUTTON */}
          {/* ====================================== */}

          {evaluation?.status !== "completed" && (

            <div className="bg-indigo-950/30 border border-indigo-800 rounded-xl p-5 mb-6">

              <h3 className="text-xl font-semibold text-indigo-300 mb-2">
                AI Interview Evaluation
              </h3>

              <p className="text-slate-300 mb-4">
                Your seven responses have been recorded.
                Click below to request question-wise AI feedback
                and a final score.
              </p>

              <button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-semibold"
              >
                {evaluating
                  ? "Evaluating your answers..."
                  : evaluation?.status === "unavailable"
                    ? "Retry AI Evaluation"
                    : "Generate AI Evaluation & Final Report"}
              </button>

              <button
                type="button"
                onClick={handleDemoEvaluation}
                disabled={evaluating}
                className="ml-0 sm:ml-3 mt-3 sm:mt-0 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl font-semibold"
              >
                Show Sample Report (Demo Mode)
              </button>
              <p className="mt-3 text-sm text-amber-300">
                Demo Mode displays predefined example scores; it does not evaluate your answers.
              </p>

              {evaluationError && (
                <p
                  className="text-amber-400 mt-4"
                  role="alert"
                >
                  {evaluationError}
                </p>
              )}

            </div>
          )}

          {/* ====================================== */}
          {/* GEMINI UNAVAILABLE MESSAGE */}
          {/* ====================================== */}

          {evaluation?.status === "unavailable" && (

            <div className="bg-amber-950/30 border border-amber-700 rounded-xl p-5 mb-6">

              <h3 className="text-xl font-bold text-amber-400 mb-3">
                AI Evaluation Temporarily Unavailable
              </h3>

              <p className="text-amber-200">
                {evaluation.message}
              </p>

              <p className="text-slate-300 mt-3">
                Your interview answers have been recorded.
                Please try again after your Gemini API quota resets.
              </p>

            </div>
          )}

          {/* ====================================== */}
          {/* FINAL REPORT - ONLY IF COMPLETED */}
          {/* ====================================== */}

          {evaluation?.status === "completed" && (

            <div className="space-y-6 mb-6">

              {/* OVERALL SCORE */}

              <div className="bg-emerald-950/30 border border-emerald-800 rounded-xl p-6">

                <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                  {evaluation.source === "demo" ? "Sample Interview Report (Demo Mode)" : "Final AI Interview Report"}
                </h3>

                <p className="text-3xl font-bold">
                  Overall Score: {evaluation.overallScore}/10
                </p>

                <p className="text-sm text-slate-400 mt-2">
                  {evaluation.source === "demo" ? "Source: Predefined demonstration data (not assessed by Gemini)" : "Assessed by: Gemini AI"}
                </p>

                {evaluation.summary && (
                  <p className="text-slate-300 mt-4">
                    {evaluation.summary}
                  </p>
                )}

              </div>

              {/* CATEGORY SCORES */}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {[
                  "Technical",
                  "Behavioral",
                  "Situational",
                  "Resume-Based"
                ].map((category) => (

                  <div
                    key={category}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5"
                  >

                    <p className="text-slate-400">
                      {category}
                    </p>

                    <p className="text-2xl font-bold text-indigo-400">
                      {evaluation.categoryScores?.[category] == null
                         ? "—"
                         : `${evaluation.categoryScores[category]}/10`}
                    </p>

                  </div>

                ))}

              </div>

              {/* QUESTION-WISE FEEDBACK */}

              <h3 className="text-xl font-semibold">
                Question-wise AI Feedback
              </h3>

              {evaluation.questionEvaluations?.map((item) => (

                <div
                  key={item.questionNumber}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5"
                >

                  <p className="text-indigo-400">
                    Question {item.questionNumber}
                    {" — "}
                    {item.category}
                    {" — "}
                    {item.score}/10
                  </p>

                  <h4 className="font-semibold mt-2">
                    {item.question}
                  </h4>

                {/* CRITERION-WISE MARKS */}

{Array.isArray(item.rubricBreakdown) &&
  item.rubricBreakdown.length > 0 && (

    <div className="mt-4 mb-4 rounded-xl border border-slate-700 bg-slate-900 p-4">

      <h5 className="font-semibold text-indigo-300 mb-3">
        Marking Breakdown
      </h5>

      <div className="space-y-3">

        {item.rubricBreakdown.map((criterion) => (

          <div
            key={criterion.key}
            className="border-b border-slate-800 pb-2"
          >

            <div className="flex justify-between gap-4">

              <span className="text-slate-200">
                {criterion.label}
              </span>

              <span className="font-semibold text-indigo-300">
                {criterion.score}/{criterion.maxScore}
              </span>

            </div>

            {criterion.explanation && (
              <p className="text-sm text-slate-400 mt-1">
                {criterion.explanation}
              </p>
            )}

          </div>

        ))}

      </div>

    </div>

)}

{/* EXISTING FEEDBACK */}

<p className="mt-3 text-slate-300">
  <strong>Feedback:</strong> {item.feedback}
</p>

<p className="mt-2 text-slate-300">
  <strong>Improve:</strong> {item.improvement}
</p>

                 

                </div>

              ))}

              {/* STRENGTHS AND RECOMMENDATIONS */}

              {[
                ["Strengths", evaluation.strengths],
                ["Areas for Improvement", evaluation.improvementAreas],
                ["Recommendations", evaluation.recommendations]
              ].map(([title, items]) => (

                Array.isArray(items) && items.length > 0 && (

                  <div
                    key={title}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5"
                  >

                    <h4 className="font-semibold text-indigo-300 mb-2">
                      {title}
                    </h4>

                    <ul className="list-disc pl-5 space-y-2 text-slate-300">

                      {items.map((item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      ))}

                    </ul>

                  </div>

                )

              ))}

              {/* RESUME CONSISTENCY */}

              {evaluation.resumeConsistency && (

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

                  <h4 className="font-semibold text-indigo-300 mb-3">
                    Layer 2: Resume Consistency Review
                  </h4>

                  <p className="text-slate-400 mb-3">
                    Status: {evaluation.resumeConsistency.status}
                  </p>

                  {evaluation.resumeConsistency.findings?.length > 0 ? (

                    <div className="space-y-4">

                      {evaluation.resumeConsistency.findings.map(
                        (finding, index) => (

                          <div
                            key={index}
                            className="border border-slate-700 rounded-lg p-4"
                          >

                            <p className="text-slate-300">
                              <strong>{evaluation.source === "demo" ? "Answer excerpt:" : "Claim:"}</strong>{" "}
                              {finding.claimExcerpt}
                            </p>

                            <p className="text-slate-300 mt-2">
                              <strong>Status:</strong>{" "}
                              {finding.status}
                            </p>

                            {/* Resume evidence */}
<div className="mt-3">
  <p className="text-sm font-semibold text-indigo-300 mb-2">
    Resume Evidence:
  </p>

  {finding.resumeEvidence ? (
    <div className="bg-emerald-950/30 border border-emerald-800 rounded-lg p-3">
      <p className="text-emerald-200 text-sm whitespace-pre-wrap">
        {finding.resumeEvidence}
      </p>
    </div>
  ) : (
    <p className="text-amber-300 text-sm">
      {evaluation.source === "demo" ? "Not checked in Demo Mode." : "No matching resume evidence was identified."}
    </p>
  )}
</div>

{/* AI explanation */}
<div className="mt-3">
  <p className="text-sm font-semibold text-indigo-300 mb-2">
    {evaluation.source === "demo" ? "Demo explanation:" : "AI Explanation:"}
  </p>

  <p className="text-slate-300 text-sm">
    {finding.note || "No explanation available."}
  </p>
</div>


                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <p className="text-slate-400">
                      No resume consistency findings are available.
                    </p>

                  )}

                  <p className="text-amber-300 text-sm mt-4">
                    {evaluation.source === "demo"
                      ? "Demo preview only: no resume consistency check was performed."
                      : "This is a text-based consistency check, not independent factual verification."}
                  </p>

                </div>

              )}

              <p className="text-sm text-slate-400">
                AI-generated interview scores are intended for
                preparation and feedback, not as the sole basis
                for hiring decisions.
              </p>

            </div>

          )}

          {/* ====================================== */}
          {/* RESTART BUTTON */}
          {/* ====================================== */}

          <button
            onClick={restartInterview}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold"
          >
            Restart Interview
          </button>

        </>

      ) : (

        <p className="text-slate-400">
          No interview questions are available.
        </p>

      )}

    </div>
  );
}