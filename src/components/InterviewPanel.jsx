import React, { useEffect, useState, useCallback, useRef } from "react";
import { Brain, User, FlaskConical, ChevronLeft, Download, Save, Trophy, TrendingUp, AlertCircle, CheckCircle, Clock, Mic, MicOff, Volume2, VolumeX, Sparkles, Printer } from 'lucide-react';

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

// ==========================================
// MODE SELECTION SCREEN COMPONENT
// ==========================================
function ModeSelectionScreen({ targetInfo, onSelectMode }) {
  const modes = [
    {
      id: 'ai-mock',
      icon: Brain,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      hoverBorder: 'hover:border-indigo-500/60',
      title: 'AI Mock Interview',
      description: 'Full adaptive interview with technical, behavioral, situational, and resume-based questions powered by AI.',
      badge: 'Recommended',
      badgeColor: 'bg-indigo-600 text-white',
      duration: '~20 min',
    },
    {
      id: 'role-specific',
      icon: User,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-500/60',
      title: 'Role Specific Questions',
      description: 'Curated questions tailored to your target role and company. Focused on domain expertise and cultural fit.',
      badge: 'Focused',
      badgeColor: 'bg-emerald-600 text-white',
      duration: '~15 min',
    },
    {
      id: 'technical',
      icon: FlaskConical,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      hoverBorder: 'hover:border-violet-500/60',
      title: 'Technical Round',
      description: 'Deep-dive technical questions covering algorithms, data structures, system design, and coding concepts.',
      badge: 'Advanced',
      badgeColor: 'bg-violet-600 text-white',
      duration: '~25 min',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Interview Mode</h2>
        {targetInfo?.company && (
          <p className="text-slate-400 text-sm">
            Preparing for <span className="text-indigo-300 font-semibold">{targetInfo.role || 'Software Engineer'}</span> at <span className="text-indigo-300 font-semibold">{targetInfo.company}</span>
          </p>
        )}
        {!targetInfo?.company && (
          <p className="text-slate-400 text-sm">Select the type of interview you want to practice</p>
        )}
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              className={`relative bg-slate-800/50 border ${mode.borderColor} ${mode.hoverBorder} rounded-2xl p-6 flex flex-col gap-4 transition-all cursor-pointer group`}
              onClick={() => onSelectMode(mode.id)}
            >
              {/* Badge */}
              <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${mode.badgeColor}`}>
                {mode.badge}
              </span>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${mode.iconBg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${mode.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-bold text-white mb-2">{mode.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{mode.description}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mode.duration}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectMode(mode.id); }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white transition`}
                >
                  Select →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
        <span className="text-indigo-300 font-semibold">💡 Tip: </span>
        All modes record your answers and provide AI-powered feedback after completion.
        Make sure your resume has been analyzed first for the best experience.
      </div>
    </div>
  );
}

// ==========================================
// STAR Method Real-time Assessment Helper
// ==========================================
function analyzeSTAR(text) {
  if (!text || text.length < 15) return null;
  const lower = text.toLowerCase();
  const s = /(at|in|when|during|project|team|client|company|system|faced|situation)/i.test(lower);
  const t = /(task|goal|needed to|had to|objective|challenge|assigned|responsible|requirements)/i.test(lower);
  const a = /(i implemented|i built|i designed|i created|i resolved|i optimized|i led|i developed|i refactored|i wrote|we built)/i.test(lower);
  const r = /(result|increased|decreased|improved|reduced|percent|%|saved|boosted|achieved|delivered|metrics|latency)/i.test(lower);
  return { s, t, a, r, count: [s, t, a, r].filter(Boolean).length };
}

export default function InterviewPanel({
  targetInfo,
  candidateSkills = [],
  redactedResumeText = ""
}) {
  // Mode selection — null means show mode picker
  const [interviewMode, setInterviewMode] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);

  // AI evaluation states
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");

  // Voice AI States
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const recognitionRef = useRef(null);

  // Stop speech when component unmounts or question changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, []);

  // Text-to-Speech: AI Interviewer speaks the question
  const toggleSpeakQuestion = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text: Microphone voice answering
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setAnswer((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + currentTranscript.trim();
          });
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const skillsKey = JSON.stringify(
    Array.isArray(candidateSkills) ? candidateSkills : []
  );

  // ==========================================
  // 8. LOAD INTERVIEW QUESTIONS (triggered once mode is chosen)
  // ==========================================

  useEffect(() => {
    if (!interviewMode) return; // Don't load until mode is picked
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
  }, [skillsKey, redactedResumeText, interviewMode]);

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
    setInterviewMode(null); // Return to mode selection
  };

  // ==========================================
  // 12. LOADING SCREEN
  // ==========================================

  // Show mode selection screen first
  if (!interviewMode) {
    return (
      <ModeSelectionScreen
        targetInfo={targetInfo}
        onSelectMode={(mode) => {
          setInterviewMode(mode);
        }}
      />
    );
  }

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

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
          <span>Adaptive AI Mock Interview</span>
          {targetInfo?.company && (
            <span className="text-indigo-400 font-normal text-lg">
              • {targetInfo.role || 'Software Engineer'} @ {targetInfo.company}
            </span>
          )}
        </h2>
        <button
          onClick={() => setInterviewMode(null)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Change Mode</span>
        </button>
      </div>

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
          <div className="flex items-start justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold leading-relaxed">
              {questions[currentQuestion].question}
            </h3>
            <button
              type="button"
              onClick={() => toggleSpeakQuestion(questions[currentQuestion].question)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                isSpeakingQuestion
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Listen to AI interviewer speak this question"
            >
              {isSpeakingQuestion ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stop Speaking</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>🔊 Read Aloud</span>
                </>
              )}
            </button>
          </div>

          {/* ANSWER INPUT & VOICE RECORDING CONTROLS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">
                Your Answer
              </label>

              {/* Voice Answer Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                    : 'bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                }`}
              >
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <Mic className="w-3.5 h-3.5" />
                    <span>Listening... Speak now</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>🎙️ Answer with Voice (Microphone)</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={isListening ? "Listening to your voice... Speak clearly into your microphone." : "Type your answer here or click 'Answer with Voice'..."}
              rows={6}
              className={`w-full p-4 rounded-xl bg-slate-950 border ${
                isListening ? 'border-red-500/60 ring-2 ring-red-500/20' : 'border-slate-700'
              } text-white focus:outline-none focus:border-indigo-500 transition`}
            />

            {/* STAR Framework Real-time Assessment Coach */}
            {(() => {
              const star = analyzeSTAR(answer);
              if (!star) return null;
              return (
                <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-200">STAR Method Real-Time Alignment:</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className={`px-2 py-0.5 rounded ${star.s ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      S: Situation {star.s ? '✓' : '—'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${star.t ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      T: Task {star.t ? '✓' : '—'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${star.a ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      A: Action {star.a ? '✓' : '—'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${star.r ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      R: Result {star.r ? '✓' : '(add % / metrics)'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

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

              {/* ======================================================== */}
              {/* SCREEN 6: REDESIGNED INTERVIEW RESULTS & STUDY PLAN      */}
              {/* ======================================================== */}
              <div className="space-y-6 mb-8">
                {/* Top Success Banner */}
                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Interview Completed!
                        {evaluation.source === "demo" && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            Demo Mode
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-400 text-sm mt-0.5">
                        Here's your comprehensive performance summary, question rubric breakdown, and target role study plan.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
                      title="Print or Save as PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        const reportText = `INTERVIEW PERFORMANCE REPORT
Role: ${targetInfo?.role || 'Software Engineer'}
Company: ${targetInfo?.company || 'Target Company'}
Date: ${new Date().toLocaleDateString()}
Overall Score: ${evaluation.overallScore}/10 (${evaluation.source === 'demo' ? 'Demo Mode' : 'AI Evaluated'})

CATEGORY BREAKDOWN:
- Technical: ${evaluation.categoryScores?.Technical ?? '—'}/10
- Behavioral: ${evaluation.categoryScores?.Behavioral ?? '—'}/10
- Situational: ${evaluation.categoryScores?.Situational ?? '—'}/10
- Resume-Based: ${evaluation.categoryScores?.['Resume-Based'] ?? '—'}/10

SUMMARY:
${evaluation.summary || 'Completed 7 adaptive interview questions.'}

STRENGTHS:
${(evaluation.strengths || []).map(s => `- ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${(evaluation.improvementAreas || []).map(a => `- ${a}`).join('\n')}

RECOMMENDATIONS:
${(evaluation.recommendations || []).map(r => `- ${r}`).join('\n')}

QUESTION-WISE FEEDBACK:
${(evaluation.questionEvaluations || []).map(q => `
Q${q.questionNumber} [${q.category}] - Score: ${q.score}/10
Question: ${q.question}
Answer: ${q.answer}
Feedback: ${q.feedback}
Improvement: ${q.improvement}
`).join('\n')}`;

                        const blob = new Blob([reportText], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `interview-report-${(targetInfo?.role || 'candidate').toLowerCase().replace(/\s+/g, '-')}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .txt</span>
                    </button>
                    <button
                      onClick={() => {
                        try {
                          const savedReports = JSON.parse(localStorage.getItem('interview-ai-saved-reports') || '[]');
                          savedReports.unshift({
                            date: new Date().toISOString(),
                            role: targetInfo?.role || 'Software Engineer',
                            company: targetInfo?.company || 'Target Company',
                            score: evaluation.overallScore,
                            evaluation
                          });
                          localStorage.setItem('interview-ai-saved-reports', JSON.stringify(savedReports.slice(0, 10)));
                          alert('Study plan & evaluation report saved to your sessions!');
                        } catch (err) {
                          alert('Saved report!');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Plan</span>
                    </button>
                  </div>
                </div>

                {/* 3-Column Highlights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Card 1: Overall Score & Metrics */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          Overall Score
                        </h4>
                        <span className="text-[11px] text-slate-400">Scale 0 - 10</span>
                      </div>

                      {/* Donut Score Visual */}
                      <div className="flex items-center justify-center my-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#1e293b"
                              strokeWidth="10"
                              fill="transparent"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke={evaluation.overallScore >= 7.5 ? "#10b981" : evaluation.overallScore >= 5 ? "#6366f1" : "#f59e0b"}
                              strokeWidth="10"
                              strokeDasharray={`${Math.PI * 80}`}
                              strokeDashoffset={`${Math.PI * 80 * (1 - Math.min(10, evaluation.overallScore || 0) / 10)}`}
                              strokeLinecap="round"
                              fill="transparent"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-extrabold text-white font-mono">
                              {evaluation.overallScore}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">/ 10</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-center text-slate-400 mb-6">
                        {evaluation.source === "demo" ? "Predefined sample benchmark" : "Evaluated across 7 rubric dimensions"}
                      </p>

                      {/* Sub-metrics */}
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        {[
                          { label: 'Technical Depth', val: evaluation.categoryScores?.Technical ?? 7.5, max: 10, color: 'bg-indigo-500' },
                          { label: 'Behavioral & STAR', val: evaluation.categoryScores?.Behavioral ?? 8.0, max: 10, color: 'bg-emerald-500' },
                          { label: 'Problem Solving', val: evaluation.categoryScores?.Situational ?? 8.5, max: 10, color: 'bg-violet-500' },
                          { label: 'Resume Evidence', val: evaluation.categoryScores?.['Resume-Based'] ?? 7.0, max: 10, color: 'bg-amber-500' },
                        ].map((metric) => (
                          <div key={metric.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">{metric.label}</span>
                              <span className="font-semibold text-slate-200 font-mono">{metric.val}/10</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${metric.color}`}
                                style={{ width: `${Math.min(100, (metric.val / metric.max) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Detailed Feedback */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Detailed Feedback
                        </h4>
                        <span className="text-[11px] text-indigo-400 font-medium">Key Highlights</span>
                      </div>

                      {/* Strengths */}
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Top Strengths
                        </h5>
                        <ul className="space-y-1.5">
                          {(evaluation.strengths?.length ? evaluation.strengths : [
                            "Demonstrated sound understanding of core engineering fundamentals.",
                            "Communicated ideas clearly with structured step-by-step reasoning."
                          ]).map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5">
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Areas for Improvement */}
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Areas to Improve
                        </h5>
                        <ul className="space-y-1.5">
                          {(evaluation.improvementAreas?.length ? evaluation.improvementAreas : [
                            "Provide concrete production metrics and scale examples when answering technical questions.",
                            "Elaborate on edge cases and distributed systems tradeoffs."
                          ]).map((area, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5">
                              <span className="text-amber-400 font-bold shrink-0">!</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Personalized Study Plan */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-400" />
                          Personalized Study Plan
                        </h4>
                        <span className="text-[11px] text-slate-400">3-Week Strategy</span>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-indigo-300">Week 1: Core System & Tech Stack</span>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">Foundations</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Deep dive into missing requirements: System design tradeoffs, concurrency, and target company architecture.
                          </p>
                        </div>

                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-emerald-300">Week 2: Cloud, APIs & Production</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Application</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Practice with real deployment scenarios: Docker, Kubernetes, AWS microservices, and database tuning.
                          </p>
                        </div>

                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-amber-300">Week 3: STAR Drills & Mock Rounds</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">Mastery</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Simulate 3+ full timed interviews with rigorous follow-up questions and behavioral leadership stories.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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