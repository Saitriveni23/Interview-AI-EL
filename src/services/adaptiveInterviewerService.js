import { GoogleGenAI } from '@google/genai';

export const INTERVIEW_PERSONALITIES = {
  friendly: {
    id: 'friendly',
    name: 'Friendly & Supportive',
    badge: 'Coaching Focus',
    description: 'Encouraging, constructive, helps you uncover insights with guiding prompts.',
    promptTone: 'Warm, encouraging, positive, and constructive. Praise good points and ask gentle follow-ups.'
  },
  professional: {
    id: 'professional',
    name: 'Professional & Structured',
    badge: 'Standard Bar',
    description: 'Objective, balanced industry standard. Evaluates clear technical communication.',
    promptTone: 'Calm, structured, objective, and neutral. Focus on industry-standard competencies.'
  },
  strict: {
    id: 'strict',
    name: 'Strict & Demanding',
    badge: 'High Rigor',
    description: 'Direct, demands precision, challenges loose statements, minimal praise.',
    promptTone: 'Direct, formal, highly critical, minimal praise. Highlight omissions and demand precision.'
  },
  senior_engineer: {
    id: 'senior_engineer',
    name: 'Staff / Principal Engineer',
    badge: 'Deep Tech Probing',
    description: 'Drills deep into architectural tradeoffs, failure modes, scale, and edge cases.',
    promptTone: 'Deeply technical, analytical, questioning architectural choices, failure modes, and tradeoffs.'
  },
  high_pressure: {
    id: 'high_pressure',
    name: 'High-Pressure / Executive',
    badge: 'FAANG Final Round',
    description: 'Rapid-fire, pushes for concrete metrics, challenges assumptions, tests composure.',
    promptTone: 'Fast-paced, demanding specific metrics, questioning assumptions, testing candidate composure.'
  }
};

export const INTERVIEW_TYPES = [
  'Technical',
  'HR',
  'Behavioral',
  'Resume-Based',
  'System Design'
];

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Staff'];

// Deterministic question bank categorized by interview type and difficulty
const ADAPTIVE_QUESTION_CATALOG = {
  Technical: {
    Beginner: [
      { question: "Can you explain the difference between synchronous and asynchronous execution in your primary programming language?", skill: "Core Programming" },
      { question: "How does memory management or garbage collection work in the runtime you use most frequently?", skill: "Runtime Internals" },
      { question: "What is the difference between a relational database (SQL) and a document database (NoSQL)? When do you choose each?", skill: "Databases" }
    ],
    Intermediate: [
      { question: "Walk me through how you optimize an API endpoint experiencing high latency and database query bottlenecks.", skill: "API Performance" },
      { question: "How do you handle state management and race conditions in concurrent or multi-threaded environments?", skill: "Concurrency" },
      { question: "Explain how connection pooling and database indexing affect query performance at scale.", skill: "Database Optimization" }
    ],
    Advanced: [
      { question: "Design an idempotency mechanism for payment or webhook processing across distributed microservices.", skill: "Distributed Systems" },
      { question: "How would you diagnose and resolve a severe memory leak occurring only under heavy production load?", skill: "Diagnostics & Debugging" },
      { question: "Explain how distributed transactions (Saga pattern vs 2PC) handle partial network partitions and failures.", skill: "System Architecture" }
    ],
    Staff: [
      { question: "How do you design a multi-region active-active database replication strategy balancing RPO, RTO, and CAP theorem trade-offs?", skill: "Global Architecture" },
      { question: "What governance and automated guardrails do you establish across 50+ microservices to prevent cascading failures?", skill: "Resilience Engineering" }
    ]
  },
  HR: {
    Beginner: [
      { question: "What motivated you to apply for this specific role, and what are you looking for in your next team?", skill: "Motivation" },
      { question: "How do you organize your day when managing multiple competing priorities or deadlines?", skill: "Time Management" }
    ],
    Intermediate: [
      { question: "Describe your ideal engineering culture. How do you handle situations where team practices don't align with that ideal?", skill: "Culture Fit" },
      { question: "Where do you see your technical trajectory in the next 2 to 3 years, and how does this company help you reach it?", skill: "Career Growth" }
    ],
    Advanced: [
      { question: "Tell me about a time you had to advocate for technical debt refactoring to non-technical stakeholders who wanted new features.", skill: "Stakeholder Alignment" },
      { question: "How do you navigate ambiguity when requirements change halfway through a sprint or project milestone?", skill: "Adaptability" }
    ],
    Staff: [
      { question: "How do you build consensus across cross-functional teams when there is fundamental disagreement on technical strategy?", skill: "Leadership" }
    ]
  },
  Behavioral: {
    Beginner: [
      { question: "Tell me about a project you are particularly proud of. What was your individual contribution and the outcome?", skill: "Ownership" },
      { question: "Describe a situation where you made a mistake at work. How did you handle it and what did you learn?", skill: "Accountability" }
    ],
    Intermediate: [
      { question: "Describe a conflict you had with a teammate or lead regarding code review or technical approach. How did you resolve it?", skill: "Conflict Resolution" },
      { question: "Tell me about a time you had to deliver a critical feature under an unrealistic deadline. What trade-offs did you make?", skill: "Delivery Under Pressure" }
    ],
    Advanced: [
      { question: "Tell me about a time when a production incident occurred due to code you touched. Walk me through your triage, postmortem, and prevention steps.", skill: "Incident Ownership" },
      { question: "Give an example of a technical initiative you spearheaded that improved developer velocity or team efficiency.", skill: "Initiative & Impact" }
    ],
    Staff: [
      { question: "Describe a scenario where you mentored a junior or mid-level engineer through a difficult technical milestone. What was your coaching framework?", skill: "Mentorship & Influence" }
    ]
  },
  'Resume-Based': {
    Beginner: [
      { question: "Looking at your resume, walk me through the tech stack of your most recent project and why you selected those specific tools.", skill: "Tech Stack Justification" },
      { question: "Can you explain the day-to-day responsibilities you held in your most prominent role listed?", skill: "Role Ownership" }
    ],
    Intermediate: [
      { question: "You listed multiple technologies on your resume. Which one do you consider your deepest strength, and where are you actively looking to grow?", skill: "Self-Awareness & Depth" },
      { question: "Pick a quantified achievement or optimization on your resume. Exactly what was your individual contribution toward that metric?", skill: "Quantified Impact Defense" }
    ],
    Advanced: [
      { question: "In your highlighted project, what was the most difficult architectural challenge you faced, and what alternative solutions did you reject?", skill: "Architectural Tradeoffs" },
      { question: "If you had to rewrite or redesign the main system described on your resume from scratch today, what would you change?", skill: "Retrospective Reflection" }
    ],
    Staff: [
      { question: "How did the systems you built on your resume impact the business bottom line or operational costs?", skill: "Business Alignment" }
    ]
  },
  'System Design': {
    Beginner: [
      { question: "Design a simple URL shortening service (like bit.ly). Walk me through the API design, database schema, and unique hash generation.", skill: "URL Shortener" },
      { question: "How does a reverse proxy or load balancer distribute traffic across web application servers?", skill: "Load Balancing" }
    ],
    Intermediate: [
      { question: "Design a rate limiter capable of handling millions of requests per minute across multiple regions. What algorithms and caching mechanisms would you use?", skill: "Rate Limiting" },
      { question: "Design a real-time notification service (email, push, SMS) with guaranteed delivery and retry policies.", skill: "Message Queues" }
    ],
    Advanced: [
      { question: "Design an Instagram/Twitter-like distributed newsfeed system supporting fanout-on-write vs fanout-on-read for celebrity accounts.", skill: "High-Throughput Feeds" },
      { question: "Design a distributed logging and metric collection system (like Datadog/Elastic) processing 100,000 events per second with sub-second search.", skill: "Stream Processing" }
    ],
    Staff: [
      { question: "Design a globally distributed collaborative document editing service (like Google Docs) with conflict-free replicated data types (CRDTs).", skill: "Realtime Collaboration" }
    ]
  }
};

/**
 * Analyzes candidate answer quality, completeness, depth, and validity deterministically.
 */
export function analyzeAnswerQuality(arg1, arg2) {
  let question = '';
  let answer = '';
  let type = 'Technical';
  let difficulty = 'Intermediate';

  if (typeof arg1 === 'object' && arg1 !== null) {
    answer = arg1.answer || '';
    question = arg1.question || '';
    type = arg1.type || 'Technical';
    difficulty = arg1.difficulty || 'Intermediate';
  } else {
    answer = typeof arg1 === 'string' ? arg1 : '';
    question = typeof arg2 === 'string' ? arg2 : '';
  }

  const cleanAnswer = (answer || '').trim();
  const wordCount = cleanAnswer ? cleanAnswer.split(/\s+/).filter(Boolean).length : 0;

  // 1. Detect Gibberish / Random characters or empty / meaningless inputs
  const isGibberish =
    !cleanAnswer ||
    cleanAnswer.length < 5 ||
    /^(.)\1{3,}$/.test(cleanAnswer) ||
    /^(test|asdf|qwerty|idk|dont know|no idea|nothing|none|xyz|abc|blah|\?+|\.+)$/i.test(cleanAnswer) ||
    /\b(asdf|qwerty)\b/i.test(cleanAnswer) ||
    (wordCount <= 2 && !/(yes|no|sql|acid|rest|soap|cap|jwt)/i.test(cleanAnswer));

  if (isGibberish) {
    return {
      quality: 'incorrect',
      score: 0,
      classification: 'vague_or_gibberish',
      feedback: 'The answer provided was identified as random, irrelevant, or non-responsive and did not address the question.',
      reasons: ['No credit awarded: answer is meaningless or random', 'Too brief or did not address technical concepts'],
      indicators: ['Gibberish or non-responsive signal detected'],
      followUpAction: 'challenge_fundamentals'
    };
  }

  // 2. Technical keyword density & structural checks
  const technicalKeywords = [
    'because', 'tradeoff', 'trade-off', 'performance', 'latency', 'scale', 'architecture',
    'database', 'query', 'cache', 'redis', 'concurrency', 'asynchronous', 'async', 'await',
    'thread', 'memory', 'cpu', 'index', 'replica', 'partition', 'distributed', 'service',
    'api', 'rest', 'security', 'test', 'deploy', 'metric', 'monitoring', 'incident',
    'impact', 'result', 'optimized', 'reduced', 'increased', 'star', 'situation', 'task', 'action',
    'graphql', 'postgres', 'schema', 'bottleneck', 'load balancer', 'microservices', 'n+1', 'p99'
  ];

  const matchedKeywords = technicalKeywords.filter(k =>
    new RegExp(`\\b${k.replace('+', '\\+')}\\b`, 'i').test(cleanAnswer)
  );

  const hasSpecificExamples = /\b(for example|specifically|such as|in my project|we measured|baseline|instance|reduced by|increased by|redis|datadog|pprof)\b/i.test(cleanAnswer);
  const hasTradeoffMention = /\b(tradeoff|trade-off|pros and cons|alternative|drawback|downside|overhead|instead of|eliminate)\b/i.test(cleanAnswer);
  const hasSTAR = /(during|when|at\s+[a-z]+|team|conflict|disagree|as tech lead|in my role|as a result|ahead of schedule|outcome|resolved)/i.test(cleanAnswer);

  let quality = 'intermediate';
  let score = 5.0;
  let classification = 'acceptable';
  let reasons = [];
  let followUpAction = 'probe_deeper';

  if (wordCount >= 25 && matchedKeywords.length >= 3 && (hasSpecificExamples || hasTradeoffMention || hasSTAR)) {
    quality = 'strong';
    score = 8.8 + Math.min(1.2, (matchedKeywords.length - 3) * 0.2);
    classification = 'strong_and_detailed';
    reasons.push('Architectural / domain terminology detected');
    reasons.push('Demonstrates concrete technical depth and reasoning');
    if (hasSTAR) reasons.push('STAR framework structure detected');
    followUpAction = 'escalate_difficulty';
  } else if (wordCount >= 25 && matchedKeywords.length >= 2) {
    quality = 'acceptable';
    score = 6.5 + Math.min(1.5, wordCount * 0.02);
    classification = 'adequate_overview';
    reasons.push('Good foundation provided');
    reasons.push('Could provide deeper quantitative metrics or edge cases');
    followUpAction = 'probe_tradeoffs';
  } else if (wordCount <= 12) {
    quality = 'incomplete';
    score = 4.0;
    classification = 'incomplete_explanation';
    reasons.push('Answer is too brief and misses essential execution details');
    followUpAction = 'clarify_missing_aspect';
  } else {
    quality = 'vague';
    score = 4.5;
    classification = 'vague_or_brief';
    reasons.push('Answer is overly high-level lacking concrete mechanisms or metrics');
    followUpAction = 'demand_specifics';
  }

  return {
    quality,
    score: Math.round(score * 10) / 10,
    classification,
    feedback: reasons.join('. '),
    reasons,
    indicators: reasons,
    matchedKeywordsCount: matchedKeywords.length,
    wordCount,
    followUpAction
  };
}

/**
 * Calculates next difficulty based on recent performance
 */
export function calculateNextDifficulty(currentDifficulty, answerQuality) {
  const levels = DIFFICULTY_LEVELS;
  const currentIndex = levels.indexOf(currentDifficulty) !== -1 ? levels.indexOf(currentDifficulty) : 1;

  if (answerQuality === 'strong') {
    return levels[Math.min(levels.length - 1, currentIndex + 1)];
  } else if (answerQuality === 'incorrect' || answerQuality === 'vague' || answerQuality === 'incomplete') {
    return levels[Math.max(0, currentIndex - 1)];
  }
  return levels[currentIndex];
}

/**
 * Generates an adaptive contextual follow-up question
 */
export async function generateContextualFollowUp(options = {}) {
  const previousQuestion = options.question || options.previousQuestion || '';
  const previousAnswer = options.answer || options.previousAnswer || '';
  const personality = options.personality || 'professional';
  const category = options.category || options.type || 'Technical';
  const p = INTERVIEW_PERSONALITIES[personality] || INTERVIEW_PERSONALITIES.professional;

  if (!previousAnswer.trim()) {
    return {
      question: 'Could you walk me through your specific approach and decisions on this?',
      type: 'Clarification',
      reasoning: 'Initial candidate answer was brief or blank.'
    };
  }

  const cleanAns = previousAnswer.trim();
  const words = cleanAns.split(/\s+/).filter(w => w.length > 4 && !/^(should|could|would|because|something|anything|developer)$/i.test(w));
  const keyword = words[0] || 'that approach';

  let questionText = '';
  let probeType = 'Trade-off Probing';

  if (personality === 'senior_engineer') {
    probeType = 'Architectural Tradeoffs';
    questionText = `You mentioned using ${keyword}. Under 10x traffic spikes with network partitions, what failure modes and latency tradeoffs emerge, and how do you mitigate them?`;
  } else if (personality === 'high_pressure') {
    probeType = 'Metric Scrutiny';
    questionText = `What concrete metrics or numbers back up that statement? How was the performance measured before and after?`;
  } else if (personality === 'strict') {
    probeType = 'Technical Precision';
    questionText = `That explanation is high-level. Exactly which data structure, protocol, or algorithmic mechanism did you implement for ${keyword}?`;
  } else if (personality === 'friendly') {
    probeType = 'Coaching Deep-Dive';
    questionText = `You are on the right track with ${keyword}! Could you share a specific project example where you applied this in practice?`;
  } else {
    probeType = 'Technical Deep-Dive';
    questionText = `Taking your point about ${keyword} further, how did you handle edge cases and data consistency in production?`;
  }

  return {
    question: questionText,
    type: probeType,
    reasoning: `Challenging candidate response under ${p.name} criteria.`
  };
}

/**
 * Generates next adaptive interview question (using Gemini if available, or deterministic catalog)
 */
export async function generateAdaptiveQuestion(options = {}) {
  const category = options.category || options.type || 'Technical';
  const difficulty = options.currentDifficulty || options.difficulty || 'Intermediate';
  const personality = options.personality || 'professional';
  const candidateSkills = options.candidateSkills || [];
  const targetInfo = options.targetInfo || {};
  const usedQuestions = options.usedQuestions || (options.interviewHistory || []).map(h => h.question) || [];

  const p = INTERVIEW_PERSONALITIES[personality] || INTERVIEW_PERSONALITIES.professional;
  const categoryBank = ADAPTIVE_QUESTION_CATALOG[category] || ADAPTIVE_QUESTION_CATALOG.Technical;
  const questionsForDifficulty = categoryBank[difficulty] || categoryBank.Intermediate || categoryBank.Beginner || [];

  const askedSet = new Set(usedQuestions.map(q => (q || '').toLowerCase().trim()));
  const available = questionsForDifficulty.filter(q => !askedSet.has(q.question.toLowerCase().trim()));
  const chosen = available[0] || questionsForDifficulty[0] || {
    question: `Explain how you design high-reliability software for ${targetInfo?.role || 'engineering'}.`,
    skill: 'General'
  };

  return {
    question: chosen.question,
    category,
    difficulty,
    skill: chosen.skill,
    skillTarget: chosen.skill,
    source: 'adaptive_catalog',
    personality: p.id
  };
}
