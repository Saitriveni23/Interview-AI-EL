/**
 * Interview AI
 * LLM-Powered Answer Scoring Service
 *
 * Provides:
 * - evaluateAnswerWithLLM: Gemini-powered answer evaluation with full rubric
 * - detectHallucination: Detects fabricated or unverifiable claims in answers
 * - computeSemanticSimilarity: Keyword-overlap semantic similarity scoring
 *
 * Full offline fallback (regex/keyword scoring) when Gemini is unavailable.
 */

import { GoogleGenAI } from '@google/genai';

// ------------------------------------
// KEYWORD BANKS FOR OFFLINE SCORING
// ------------------------------------

const CATEGORY_KEYWORDS = {
  Technical: [
    'algorithm', 'complexity', 'data structure', 'time complexity', 'space complexity',
    'big o', 'recursion', 'iteration', 'optimization', 'cache', 'memory', 'stack',
    'queue', 'tree', 'graph', 'hash', 'array', 'linked list', 'binary', 'sort',
    'search', 'api', 'rest', 'http', 'database', 'sql', 'index', 'query',
    'async', 'promise', 'callback', 'function', 'class', 'object', 'interface',
    'pattern', 'design', 'solid', 'dry', 'microservice', 'monolith', 'docker',
    'kubernetes', 'ci/cd', 'test', 'unit', 'integration', 'mock', 'scalab'
  ],
  Behavioral: [
    'situation', 'task', 'action', 'result', 'star', 'challenge', 'learned',
    'team', 'collaborate', 'communicate', 'conflict', 'resolve', 'initiative',
    'deadline', 'priority', 'feedback', 'improve', 'achieve', 'ownership',
    'responsible', 'lead', 'mentor', 'deliver', 'impact', 'stakeholder'
  ],
  Situational: [
    'would', 'approach', 'consider', 'first', 'then', 'identify', 'analyze',
    'plan', 'strategy', 'option', 'trade-off', 'risk', 'stakeholder', 'escalate',
    'coordinate', 'communicate', 'measure', 'outcome', 'mitigate', 'assumption'
  ],
  'System Design': [
    'scalability', 'availability', 'reliability', 'latency', 'throughput',
    'load balancer', 'cache', 'cdn', 'database', 'sharding', 'replication',
    'microservice', 'api gateway', 'message queue', 'event', 'partition',
    'consistency', 'cap theorem', 'eventual consistency', 'distributed',
    'horizontal scaling', 'vertical scaling', 'bottleneck', 'monitoring',
    'rate limiting', 'authentication', 'service mesh'
  ],
  'Resume-Based': [
    'experience', 'project', 'built', 'developed', 'implemented', 'designed',
    'led', 'managed', 'improved', 'reduced', 'increased', 'achieved',
    'responsible', 'worked', 'team', 'role', 'contribution', 'result', 'impact'
  ],
  HR: [
    'goal', 'career', 'growth', 'strength', 'weakness', 'motivat', 'passion',
    'culture', 'value', 'company', 'role', 'opportunity', 'learn', 'develop',
    'long-term', 'short-term', 'five year', 'contribution', 'expect'
  ]
};

// ------------------------------------
// OFFLINE FALLBACK SCORING
// ------------------------------------

function offlineScore(question, answer, category = 'Technical') {
  if (!answer || answer.trim().length < 10) {
    return {
      score: 0,
      grade: 'F',
      feedback: 'No meaningful answer was provided.',
      strengths: [],
      improvements: ['Provide a detailed answer to the question.'],
      detectedIssues: ['Answer too short or empty.'],
      rubric: { clarity: 0, depth: 0, accuracy: 0, relevance: 0 }
    };
  }

  const lowerAnswer = answer.toLowerCase();
  const words = lowerAnswer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // --- Keyword relevance ---
  const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS.Technical;
  const matchedKeywords = keywords.filter(kw => lowerAnswer.includes(kw));
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / Math.max(keywords.length * 0.3, 1)) * 100));

  // --- Clarity: sentence structure, punctuation ---
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const avgSentenceLen = wordCount / Math.max(sentences.length, 1);
  const clarityScore = Math.min(100, Math.max(10,
    avgSentenceLen >= 5 && avgSentenceLen <= 30 ? 75 : 50
  ) + (sentences.length >= 2 ? 15 : 0));

  // --- Depth: length & structure ---
  let depthScore = 0;
  if (wordCount >= 200) depthScore = 90;
  else if (wordCount >= 100) depthScore = 75;
  else if (wordCount >= 50) depthScore = 55;
  else if (wordCount >= 20) depthScore = 35;
  else depthScore = 15;

  // --- Accuracy: keyword precision ---
  const accuracyScore = keywordScore;

  // --- Relevance: question term overlap ---
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const relevantMatches = questionWords.filter(qw => lowerAnswer.includes(qw));
  const relevanceScore = Math.min(100, Math.round((relevantMatches.length / Math.max(questionWords.length * 0.3, 1)) * 100));

  const rubric = {
    clarity: Math.round(clarityScore),
    depth: Math.round(depthScore),
    accuracy: Math.round(accuracyScore),
    relevance: Math.round(relevanceScore)
  };

  const score = Math.round(
    rubric.clarity * 0.2 +
    rubric.depth * 0.3 +
    rubric.accuracy * 0.3 +
    rubric.relevance * 0.2
  );

  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  const strengths = [];
  const improvements = [];

  if (rubric.depth >= 70) strengths.push('Good answer depth and elaboration.');
  else improvements.push('Expand your answer with more detail and examples.');

  if (rubric.relevance >= 70) strengths.push('Answer is relevant to the question asked.');
  else improvements.push('Focus more directly on what the question is asking.');

  if (matchedKeywords.length >= 3) strengths.push(`Uses relevant technical terms: ${matchedKeywords.slice(0, 3).join(', ')}.`);
  else improvements.push('Include more domain-specific terminology.');

  if (rubric.clarity >= 70) strengths.push('Answer is clearly structured and readable.');
  else improvements.push('Improve sentence structure and overall clarity.');

  const detectedIssues = [];
  if (wordCount < 30) detectedIssues.push('Answer is very brief — consider elaborating.');
  if (matchedKeywords.length === 0) detectedIssues.push('No relevant technical keywords detected.');

  const feedback = `Your answer scored ${score}/100 (${grade}). ` +
    (strengths.length ? `Strengths: ${strengths[0]} ` : '') +
    (improvements.length ? `To improve: ${improvements[0]}` : '');

  return { score, grade, feedback, strengths, improvements, detectedIssues, rubric };
}

// ------------------------------------
// GEMINI-POWERED EVALUATION
// ------------------------------------

/**
 * Evaluate a candidate's interview answer using Gemini LLM.
 *
 * @param {{ question: string, answer: string, category: string, difficulty: string, personality?: string }}
 * @returns {{ score, grade, feedback, strengths, improvements, detectedIssues, rubric }}
 */
export async function evaluateAnswerWithLLM({ question, answer, category = 'Technical', difficulty = 'Intermediate', personality = 'professional' }) {
  const apiKey = process.env.GEMINI_API_KEY || null;

  if (!apiKey) {
    console.warn('[LLMScoring] GEMINI_API_KEY missing — using offline fallback scoring.');
    return offlineScore(question, answer, category);
  }

  if (!answer || answer.trim().length < 5) {
    return offlineScore(question, answer, category);
  }

  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer.

INTERVIEW CONTEXT:
- Question Category: ${category}
- Difficulty Level: ${difficulty}
- Interviewer Style: ${personality}

QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

EVALUATION TASK:
Evaluate the candidate's answer on the following rubric. Be fair, specific, and constructive.

Scoring rubric (each 0-100):
- clarity: How well-structured, clear, and readable is the answer?
- depth: How comprehensive, thorough, and insightful is the answer?
- accuracy: How technically correct and factually accurate is the answer?
- relevance: How directly does the answer address the question?

Overall score = weighted average (clarity 20%, depth 30%, accuracy 30%, relevance 20%).
Grade: A (90-100), B (80-89), C (70-79), D (60-69), F (<60).

Return ONLY valid JSON (no markdown, no explanation) in this exact structure:
{
  "score": <0-100 integer>,
  "grade": "<A|B|C|D|F>",
  "feedback": "<2-3 sentence overall evaluation>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "detectedIssues": ["<issue 1 if any>"],
  "rubric": {
    "clarity": <0-100>,
    "depth": <0-100>,
    "accuracy": <0-100>,
    "relevance": <0-100>
  }
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });

    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
        break;
      } catch (err) {
        const isTemp = err.status === 503 || String(err.message || err).includes('UNAVAILABLE');
        if (!isTemp || attempt === 3) throw err;
        await new Promise(r => setTimeout(r, attempt * 2000));
      }
    }

    const parsed = JSON.parse(response.text);

    // Validate required fields
    const score = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : null;
    if (score === null) throw new Error('Invalid score from Gemini');

    const grade = ['A', 'B', 'C', 'D', 'F'].includes(parsed.grade) ? parsed.grade : (score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F');

    return {
      score,
      grade,
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback : `Score: ${score}/100.`,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter(s => typeof s === 'string') : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.filter(s => typeof s === 'string') : [],
      detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues.filter(s => typeof s === 'string') : [],
      rubric: {
        clarity: Math.round(parsed.rubric?.clarity ?? 50),
        depth: Math.round(parsed.rubric?.depth ?? 50),
        accuracy: Math.round(parsed.rubric?.accuracy ?? 50),
        relevance: Math.round(parsed.rubric?.relevance ?? 50)
      },
      source: 'gemini'
    };

  } catch (err) {
    console.error('[LLMScoring] Gemini evaluation failed, using offline fallback:', err.message);
    return { ...offlineScore(question, answer, category), source: 'fallback' };
  }
}

// ------------------------------------
// HALLUCINATION DETECTION
// ------------------------------------

/**
 * Detect hallucinated or unverifiable claims in a candidate's answer.
 *
 * @param {{ question: string, answer: string, category: string }}
 * @returns {{ hasHallucination: bool, issues: string[], confidence: 'high'|'medium'|'low' }}
 */
export async function detectHallucination({ question, answer, category = 'Technical' }) {
  const apiKey = process.env.GEMINI_API_KEY || null;

  // Offline fallback: basic heuristic checks
  if (!apiKey) {
    return offlineHallucinationCheck(answer);
  }

  const prompt = `
You are a fact-checking AI for technical interview answers.

QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}
CATEGORY: ${category}

Analyze the answer for hallucinations: fabricated facts, impossible claims, contradictions, or unverifiable statements that sound authoritative but are likely false.

Return ONLY valid JSON:
{
  "hasHallucination": <true|false>,
  "issues": ["<specific issue if any>"],
  "confidence": "<high|medium|low>"
}
`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text);
    return {
      hasHallucination: Boolean(parsed.hasHallucination),
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low'
    };
  } catch (err) {
    console.error('[LLMScoring] Hallucination detection failed:', err.message);
    return offlineHallucinationCheck(answer);
  }
}

function offlineHallucinationCheck(answer) {
  const lowerAnswer = (answer || '').toLowerCase();
  const suspiciousPatterns = [
    { pattern: /\b100%\s+(guaranteed|always|never fails)\b/i, issue: 'Absolute guarantee claim detected.' },
    { pattern: /\binvented\s+by\s+me\b/i, issue: 'Personal invention claim without context.' },
    { pattern: /\balways\s+works\b/i, issue: 'Overly absolute correctness claim.' },
    { pattern: /\bnobody\s+(knows|uses|understands)\b/i, issue: 'Unsupported absolute claim about others.' },
    { pattern: /\bproven\s+to\s+be\s+(faster|better)\s+than\s+everything\b/i, issue: 'Unsupported superiority claim.' }
  ];

  const issues = suspiciousPatterns
    .filter(({ pattern }) => pattern.test(lowerAnswer))
    .map(({ issue }) => issue);

  return {
    hasHallucination: issues.length > 0,
    issues,
    confidence: issues.length > 0 ? 'low' : 'low'
  };
}

// ------------------------------------
// SEMANTIC SIMILARITY
// ------------------------------------

/**
 * Compute semantic similarity between a candidate answer and an ideal answer.
 * Uses keyword/concept overlap as proxy when embedding APIs are unavailable.
 *
 * @param {string} answer
 * @param {string} idealAnswer
 * @returns {{ score: 0-1, matchedConcepts: string[], missingConcepts: string[] }}
 */
export function computeSemanticSimilarity(answer, idealAnswer) {
  if (!answer || !idealAnswer) {
    return { score: 0, matchedConcepts: [], missingConcepts: [] };
  }

  // Extract meaningful tokens from ideal answer (words > 3 chars)
  const idealTokens = [...new Set(
    idealAnswer.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  )];

  const lowerAnswer = answer.toLowerCase();

  const matchedConcepts = idealTokens.filter(token => lowerAnswer.includes(token));
  const missingConcepts = idealTokens.filter(token => !lowerAnswer.includes(token));

  const score = idealTokens.length > 0
    ? Math.min(1, parseFloat((matchedConcepts.length / idealTokens.length).toFixed(3)))
    : 0;

  return {
    score,
    matchedConcepts: matchedConcepts.slice(0, 10),
    missingConcepts: missingConcepts.slice(0, 10)
  };
}
