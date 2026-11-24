// jdParserService.js — Job Description Parser Service (frontend, no LLM required for parsing)

// ─── Tech keyword dictionaries ────────────────────────────────────────────────
const TECH_KEYWORDS = [
  // Languages
  'javascript','typescript','python','java','go','golang','rust','c++','c#','ruby','swift','kotlin','scala','php','r','matlab',
  // Frontend
  'react','vue','angular','next.js','nextjs','nuxt','svelte','redux','mobx','zustand','tailwind','sass','css','html','webpack','vite','babel',
  // Backend
  'node.js','nodejs','express','fastapi','flask','django','spring','rails','graphql','rest','grpc','websocket','microservices','kafka','rabbitmq',
  // Databases
  'sql','postgresql','mysql','mongodb','redis','elasticsearch','dynamodb','cassandra','sqlite','neo4j','firebase',
  // Cloud / DevOps
  'aws','gcp','azure','docker','kubernetes','k8s','terraform','ansible','ci/cd','github actions','jenkins','circleci','nginx','linux',
  // AI / ML
  'machine learning','deep learning','tensorflow','pytorch','scikit-learn','llm','openai','gemini','langchain','pandas','numpy','spark','hadoop',
  // Practices / Misc
  'agile','scrum','tdd','bdd','solid','design patterns','microservices','system design','api','sdk','oauth','jwt','rest api',
];

const EXPERIENCE_SIGNALS = {
  junior: ['0-2 years','1+ year','entry level','junior','new grad','recent graduate','associate','intern'],
  mid: ['2-4 years','3+ years','mid level','mid-level','intermediate','2+ years','3-5 years'],
  senior: ['5+ years','senior','4+ years','4-6 years','5-7 years','experienced','7+ years'],
  lead: ['lead','principal','staff','architect','manager','director','10+ years','8+ years'],
};

const REMOTE_SIGNALS = {
  remote: ['remote','fully remote','work from home','wfh','distributed','100% remote'],
  hybrid: ['hybrid','flexible','2-3 days','part-time remote','partially remote'],
  onsite: ['onsite','on-site','in-office','in office','fully onsite','on site','relocation required'],
};

const FOCUS_ICONS = {
  'System Design': '🏗️',
  'Data Structures & Algorithms': '🧮',
  'Frontend Engineering': '🎨',
  'Backend Engineering': '⚙️',
  'Cloud & Infrastructure': '☁️',
  'Machine Learning': '🤖',
  'Database Design': '🗄️',
  'Behavioral': '🗣️',
  'DevOps & CI/CD': '🔄',
  'Security': '🔒',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s.#+]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSection(text, headings) {
  const lines = text.split('\n');
  const results = [];
  let capturing = false;
  const headingPattern = new RegExp(`^(${headings.join('|')})`, 'i');
  const nextSectionPattern = /^[A-Z][A-Za-z\s]{3,30}:?\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (headingPattern.test(line)) {
      capturing = true;
      continue;
    }
    if (capturing) {
      if (nextSectionPattern.test(line) && line.length < 50 && i > 0) {
        // Likely a new section heading
        const isKnownHeading = /required|preferred|qualifications|responsibilities|experience|skills|about|benefits|perks|compensation|salary|location|work/i.test(line);
        if (isKnownHeading) break;
      }
      if (line) results.push(line.replace(/^[-•*✓→]\s*/, '').trim());
    }
  }
  return results.filter(l => l.length > 5 && l.length < 300);
}

function extractRole(text) {
  // Common patterns: "We are looking for a Senior React Developer" / "Job Title: ..."
  const titlePatterns = [
    /job\s*title\s*[:\-–]\s*([^\n]+)/i,
    /position\s*[:\-–]\s*([^\n]+)/i,
    /role\s*[:\-–]\s*([^\n]+)/i,
    /we(?:'re| are) (?:looking for|hiring|seeking) (?:an? )?([^\n.]{5,60})/i,
    /^([\w\s]+(?:developer|engineer|architect|designer|manager|lead|analyst|scientist|consultant))/im,
  ];
  for (const p of titlePatterns) {
    const m = text.match(p);
    if (m) return m[1].trim().replace(/\s+/g, ' ');
  }
  return '';
}

function extractCompany(text) {
  const patterns = [
    /company\s*[:\-–]\s*([^\n]+)/i,
    /at\s+([A-Z][a-zA-Z0-9&.\s]{1,30})\s*,/,
    /join\s+([A-Z][a-zA-Z0-9&.\s]{1,30})\s+(?:as|team)/i,
    /^([A-Z][a-zA-Z0-9&.\s]{1,30})\s+is\s+(?:looking|hiring|seeking)/m,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return '';
}

function extractSalary(text) {
  const m = text.match(/\$[\d,]+\s*(?:[-–]\s*\$[\d,]+)?\s*(?:\/\s*(?:yr|year|annually|month|mo|hr|hour))?/i)
    || text.match(/(?:salary|compensation|pay)\s*[:\-–]\s*([^\n]+)/i);
  return m ? m[0].trim() : null;
}

function extractSkillsFromSection(sectionText) {
  if (!sectionText) return [];
  const norm = normalizeText(sectionText);
  return TECH_KEYWORDS.filter(kw => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(norm);
  });
}

function detectExperienceLevel(text) {
  const norm = normalizeText(text);
  for (const [level, signals] of Object.entries(EXPERIENCE_SIGNALS)) {
    if (signals.some(s => norm.includes(s))) return level;
  }
  return 'mid';
}

function detectRemotePolicy(text) {
  const norm = normalizeText(text);
  for (const [policy, signals] of Object.entries(REMOTE_SIGNALS)) {
    if (signals.some(s => norm.includes(s))) return policy;
  }
  return 'unknown';
}

function extractKeywords(text, topN = 15) {
  const norm = normalizeText(text);
  const freq = {};
  for (const kw of TECH_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = norm.match(new RegExp(`\\b${escaped}\\b`, 'g'));
    if (matches) freq[kw] = (freq[kw] || 0) + matches.length;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([kw]) => kw);
}

function predictInterviewFocus(requiredSkills, keywords, role) {
  const focus = [];
  const all = [...requiredSkills, ...keywords].map(s => s.toLowerCase());
  const roleLower = (role || '').toLowerCase();

  const checks = [
    { label: 'System Design', signals: ['system design','microservices','distributed','architecture','scalab'] },
    { label: 'Data Structures & Algorithms', signals: ['algorithm','leetcode','data structures','dynamic programming','graph','tree'] },
    { label: 'Frontend Engineering', signals: ['react','vue','angular','css','html','ui','ux','frontend','next.js','svelte'] },
    { label: 'Backend Engineering', signals: ['node','express','spring','django','api','rest','grpc','backend','server'] },
    { label: 'Cloud & Infrastructure', signals: ['aws','gcp','azure','docker','kubernetes','terraform','cloud','devops','infrastructure'] },
    { label: 'Machine Learning', signals: ['machine learning','deep learning','tensorflow','pytorch','ml','ai','nlp','llm','data science'] },
    { label: 'Database Design', signals: ['sql','postgresql','mysql','mongodb','database','redis','nosql','schema'] },
    { label: 'DevOps & CI/CD', signals: ['ci/cd','jenkins','github actions','docker','kubernetes','deployment','pipeline'] },
    { label: 'Security', signals: ['security','oauth','jwt','encryption','vulnerability','penetration','auth'] },
    { label: 'Behavioral', signals: ['leadership','communication','teamwork','collaboration','agile','scrum','cross-functional'] },
  ];

  for (const { label, signals } of checks) {
    if (signals.some(sig => all.some(a => a.includes(sig)) || roleLower.includes(sig))) {
      focus.push(label);
    }
  }

  // Fallback
  if (focus.length === 0) focus.push('Behavioral', 'System Design', 'Data Structures & Algorithms');
  return [...new Set(focus)].slice(0, 5);
}

// ─── Main parse function ───────────────────────────────────────────────────────

/**
 * parseJobDescription(jdText)
 * Parses raw JD text → structured object
 */
export function parseJobDescription(jdText) {
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length < 20) {
    throw new Error('Please provide a valid job description (at least 20 characters).');
  }

  const text = jdText.trim();
  const norm = normalizeText(text);

  // Role + Company
  const role = extractRole(text);
  const company = extractCompany(text);

  // Sections
  const reqSection = extractSection(text, ['required skills','requirements','must have','qualifications','what you bring','what we require','minimum qualifications']);
  const prefSection = extractSection(text, ['preferred','nice to have','bonus','plus','desired','additional qualifications']);
  const respSection = extractSection(text, ['responsibilities','what you will do','what you\'ll do','duties','your role','key responsibilities','day to day']);
  const qualSection = extractSection(text, ['qualifications','about you','education','experience required','background']);

  // Extract tech skills from sections + full text
  const requiredSkillsFromSection = extractSkillsFromSection(reqSection.join(' '));
  const preferredSkillsFromSection = extractSkillsFromSection(prefSection.join(' '));
  const allKeywords = extractKeywords(text);

  // Merge: required = from requirements section + top keywords not in preferred
  const preferredSet = new Set(preferredSkillsFromSection.map(s => s.toLowerCase()));
  const requiredSkills = [...new Set([
    ...requiredSkillsFromSection,
    ...allKeywords.filter(k => !preferredSet.has(k))
  ])].slice(0, 15);
  const preferredSkills = [...new Set(preferredSkillsFromSection)].slice(0, 10);

  const experienceLevel = detectExperienceLevel(text);
  const salaryRange = extractSalary(text);
  const remotePolicy = detectRemotePolicy(text);
  const keywords = allKeywords;
  const interviewFocus = predictInterviewFocus(requiredSkills, keywords, role);

  return {
    role,
    company,
    requiredSkills,
    preferredSkills,
    responsibilities: respSection.slice(0, 10),
    qualifications: qualSection.slice(0, 8),
    experienceLevel,
    salaryRange,
    remotePolicy,
    keywords,
    interviewFocus,
  };
}

// ─── Resume Match ─────────────────────────────────────────────────────────────

/**
 * matchResumeToJD(resumeSkills, jdParsed)
 * Returns match score + matched/missing/suggestions
 */
export function matchResumeToJD(resumeSkills = [], jdParsed = {}) {
  const candidateNorm = resumeSkills.map(s => s.toLowerCase().trim());
  const required = jdParsed.requiredSkills || [];
  const preferred = jdParsed.preferredSkills || [];
  const allJD = [...new Set([...required, ...preferred])];

  const matched = allJD.filter(skill =>
    candidateNorm.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );
  const missing = required.filter(skill =>
    !candidateNorm.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );

  // Score: matched required skills weighted 2x, preferred 1x
  const reqMatched = matched.filter(s => required.includes(s)).length;
  const prefMatched = matched.filter(s => preferred.includes(s)).length;
  const maxScore = required.length * 2 + preferred.length;
  const rawScore = maxScore > 0 ? Math.round(((reqMatched * 2 + prefMatched) / maxScore) * 100) : 50;
  const matchScore = Math.min(100, Math.max(0, rawScore));

  const suggestions = missing.slice(0, 5).map(skill => {
    const learningMap = {
      'react': 'Build projects with React Hooks + Context API',
      'typescript': 'Complete TypeScript Handbook + add TS to existing projects',
      'aws': 'Get AWS Cloud Practitioner certification',
      'docker': 'Containerize a personal project using Docker + Compose',
      'kubernetes': 'Follow the official Kubernetes interactive tutorial',
      'python': 'Complete Python for Everybody course on Coursera',
      'graphql': 'Build a GraphQL API with Apollo Server',
      'postgresql': 'Practice SQL queries on PostgreSQL with pgExercises.com',
      'machine learning': 'Take Andrew Ng\'s ML Specialization on Coursera',
      'system design': 'Study Designing Data-Intensive Applications (DDIA)',
    };
    return learningMap[skill.toLowerCase()] || `Study and practice ${skill} with hands-on projects`;
  });

  return { matchScore, matched, missing, suggestions };
}

// ─── JD-based question generation ────────────────────────────────────────────

/**
 * generateJDQuestions(jdParsed, count = 10)
 * Attempts Gemini backend call; falls back to deterministic generation.
 */
export async function generateJDQuestions(jdParsed, count = 10) {
  // Try Gemini via backend
  try {
    const prompt = `You are a senior technical interviewer. 
Given this job description analysis:
- Role: ${jdParsed.role || 'Software Engineer'}
- Required Skills: ${(jdParsed.requiredSkills || []).join(', ')}
- Interview Focus Areas: ${(jdParsed.interviewFocus || []).join(', ')}
- Experience Level: ${jdParsed.experienceLevel || 'mid'}

Generate exactly ${count} targeted interview questions as a JSON array.
Each item must have: { question, category, difficulty, reason }
difficulty: "easy" | "medium" | "hard"
category: one of the focus areas or skill areas
reason: 1 sentence why this question matters for this role

Return ONLY valid JSON array, no explanation.`;

    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gemini-2.0-flash' }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.text || data.content || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(questions) && questions.length > 0) {
          return questions.slice(0, count);
        }
      }
    }
  } catch (_) {
    // Fallback to deterministic generation below
  }

  return generateDeterministicQuestions(jdParsed, count);
}

function generateDeterministicQuestions(jdParsed, count) {
  const skills = jdParsed.requiredSkills || [];
  const focus = jdParsed.interviewFocus || ['Behavioral', 'System Design'];
  const level = jdParsed.experienceLevel || 'mid';

  const questionBank = {
    'System Design': [
      { question: 'Design a scalable URL shortening service. Walk through your architecture choices.', difficulty: 'hard', reason: 'Tests distributed systems thinking and scalability awareness.' },
      { question: 'How would you design a notification system that handles millions of users?', difficulty: 'hard', reason: 'Evaluates knowledge of queues, pub/sub, and reliability.' },
      { question: 'Explain how you would architect a real-time chat application.', difficulty: 'medium', reason: 'Checks WebSocket/event-driven architecture knowledge.' },
    ],
    'Data Structures & Algorithms': [
      { question: 'Given an array of integers, find the longest subarray with sum equal to k.', difficulty: 'medium', reason: 'Tests sliding window and prefix sum techniques.' },
      { question: 'Implement a LRU (Least Recently Used) cache with O(1) operations.', difficulty: 'hard', reason: 'Classic problem testing LinkedList + HashMap combination.' },
      { question: 'Find the shortest path in a weighted graph using Dijkstra\'s algorithm.', difficulty: 'hard', reason: 'Tests graph traversal and priority queue knowledge.' },
    ],
    'Frontend Engineering': [
      { question: 'Explain the React reconciliation algorithm and virtual DOM diffing.', difficulty: 'medium', reason: 'Core React internals question for frontend roles.' },
      { question: 'How would you optimize a React application suffering from performance issues?', difficulty: 'medium', reason: 'Tests real-world debugging and optimization skills.' },
      { question: 'Implement a custom debounce function and explain when you\'d use it.', difficulty: 'easy', reason: 'Common frontend utility question testing JavaScript fundamentals.' },
    ],
    'Backend Engineering': [
      { question: 'How do you handle database connection pooling in a high-traffic Node.js API?', difficulty: 'medium', reason: 'Tests backend performance and scalability awareness.' },
      { question: 'Explain the differences between REST, GraphQL, and gRPC — when would you use each?', difficulty: 'medium', reason: 'API design question relevant to backend engineers.' },
      { question: 'How would you implement rate limiting in an Express.js application?', difficulty: 'medium', reason: 'Common security and reliability pattern for APIs.' },
    ],
    'Cloud & Infrastructure': [
      { question: 'Walk me through deploying a containerized application to Kubernetes with zero downtime.', difficulty: 'hard', reason: 'Tests cloud deployment and orchestration expertise.' },
      { question: 'How would you design a CI/CD pipeline for a microservices architecture?', difficulty: 'medium', reason: 'Evaluates DevOps practices and automation knowledge.' },
      { question: 'Explain the difference between horizontal and vertical scaling with examples.', difficulty: 'easy', reason: 'Fundamental cloud architecture concept for all roles.' },
    ],
    'Machine Learning': [
      { question: 'Explain overfitting and describe three techniques to prevent it.', difficulty: 'medium', reason: 'Core ML concept applicable to any ML engineering role.' },
      { question: 'How would you evaluate the performance of a classification model?', difficulty: 'easy', reason: 'Tests understanding of ML metrics and evaluation methodology.' },
      { question: 'Describe your experience with feature engineering — give a concrete example.', difficulty: 'medium', reason: 'Practical ML workflow knowledge assessment.' },
    ],
    'Database Design': [
      { question: 'When would you choose a NoSQL database over a relational database?', difficulty: 'easy', reason: 'Fundamental database selection decision-making question.' },
      { question: 'Explain database indexing — how do you decide what to index?', difficulty: 'medium', reason: 'Performance optimization knowledge for database-heavy roles.' },
      { question: 'How would you handle database migrations in a live production system?', difficulty: 'hard', reason: 'Tests zero-downtime deployment and schema evolution skills.' },
    ],
    'Behavioral': [
      { question: 'Tell me about a time you had to debug a critical production issue under pressure.', difficulty: 'medium', reason: 'Assesses problem-solving, calm under pressure, and communication.' },
      { question: `Describe a project where you had to learn ${skills[0] || 'a new technology'} quickly. How did you approach it?`, difficulty: 'easy', reason: 'Tests learning agility and self-directed growth.' },
      { question: 'Give an example of a technical disagreement with a colleague — how did you resolve it?', difficulty: 'medium', reason: 'Evaluates collaboration and conflict resolution skills.' },
    ],
    'DevOps & CI/CD': [
      { question: 'How do you ensure rollback capabilities in your deployment pipeline?', difficulty: 'medium', reason: 'Tests production reliability and deployment best practices.' },
      { question: 'Explain blue-green deployments and when you would use them.', difficulty: 'medium', reason: 'Common deployment strategy for high-availability systems.' },
    ],
    'Security': [
      { question: 'How do you prevent SQL injection in a web application?', difficulty: 'easy', reason: 'Basic security hygiene question for any backend role.' },
      { question: 'Explain how JWT authentication works and what its vulnerabilities are.', difficulty: 'medium', reason: 'Modern auth mechanism knowledge assessment.' },
    ],
  };

  const selected = [];
  const usedFocus = [...focus];
  if (!usedFocus.includes('Behavioral')) usedFocus.push('Behavioral');

  // Build skill-specific question
  if (skills.length > 0) {
    selected.push({
      question: `You listed ${skills[0]} as a required skill. Walk me through the most complex project you've built using it.`,
      category: skills[0],
      difficulty: level === 'junior' ? 'easy' : level === 'senior' || level === 'lead' ? 'hard' : 'medium',
      reason: `Directly validates the candidate's depth with ${skills[0]}, the top required skill.`,
    });
  }

  // Pull from focus areas
  for (const area of usedFocus) {
    if (selected.length >= count) break;
    const bank = questionBank[area] || [];
    for (const q of bank) {
      if (selected.length >= count) break;
      selected.push({ ...q, category: area });
    }
  }

  // If still need more, pull from remaining banks
  if (selected.length < count) {
    for (const [cat, bank] of Object.entries(questionBank)) {
      if (selected.length >= count) break;
      for (const q of bank) {
        if (selected.length >= count) break;
        if (!selected.find(s => s.question === q.question)) {
          selected.push({ ...q, category: cat });
        }
      }
    }
  }

  return selected.slice(0, count);
}
