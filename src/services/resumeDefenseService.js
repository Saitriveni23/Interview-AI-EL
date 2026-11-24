import { GoogleGenAI } from '@google/genai';

/**
 * Extracts quantifiable metrics, architectural claims, and leadership points from resume text.
 */
export function extractResumeClaims(resumeText, includeDefaults = false) {
  if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
    return [];
  }

  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const claims = [];

  // Patterns for metrics, performance, architectures, and leadership
  const metricPattern = /(\d+[\d,.]*\s*(%|percent|x|ms|sec|seconds|users|qps|rps|million|billion|k|m)|(\$|€|£)\s*\d+[\d,.]*)/i;
  const actionVerbPattern = /\b(built|designed|architected|developed|optimized|implemented|reduced|increased|improved|led|spearheaded|migrated|scaled|automated|engineered|deployed)\b/i;
  const techPattern = /\b(react|node|python|java|sql|postgres|mongodb|docker|kubernetes|aws|redis|kafka|graphql|rest|ci\/cd|microservices|distributed)\b/i;

  let claimIndex = 1;

  for (const line of lines) {
    // Look for bullet-point or achievement lines with substance
    const cleanLine = line.replace(/^[•\-\*▪►✔✓\d.]+\s*/, '').trim();
    if (cleanLine.length < 25 || cleanLine.length > 300) continue;

    const hasMetric = metricPattern.test(cleanLine);
    const hasAction = actionVerbPattern.test(cleanLine);
    const hasTech = techPattern.test(cleanLine);

    if (hasMetric || (hasAction && hasTech)) {
      let category = 'Technical Architecture';
      let riskLevel = 'Medium';

      if (hasMetric) {
        category = 'Quantified Achievement';
        riskLevel = 'High'; // Interviewers always probe numbers
      } else if (/\b(led|managed|spearheaded|mentored|team of)\b/i.test(cleanLine)) {
        category = 'Leadership & Ownership';
        riskLevel = 'Medium';
      } else if (/\b(optimized|reduced|improved|latency|scale|throughput)\b/i.test(cleanLine)) {
        category = 'Performance & Scalability';
        riskLevel = 'High';
      }

      // Generate customized cross-examination challenges
      const challenges = generateDefenseChallengesForClaim(cleanLine, category);

      claims.push({
        id: `claim_${claimIndex++}`,
        rawText: cleanLine,
        category,
        riskLevel,
        challenges,
        currentChallengeIndex: 0,
        status: 'pending' // 'pending' | 'defended' | 'partially_defended' | 'struggled'
      });
    }

    if (claims.length >= 8) break; // Focus on top 8 substantive claims
  }

  // If no explicit claims found and defaults are explicitly requested (e.g. demo mode)
  if (claims.length === 0 && includeDefaults) {
    claims.push(
      {
        id: 'claim_1',
        rawText: 'Engineered scalable REST APIs and microservices handling production user requests.',
        category: 'Technical Architecture',
        riskLevel: 'Medium',
        challenges: [
          'How did you structure error handling and retries when downstream services failed?',
          'What was the average latency and throughput of these endpoints under peak load?'
        ],
        status: 'pending'
      },
      {
        id: 'claim_2',
        rawText: 'Optimized frontend performance and reduced bundle size for faster page load.',
        category: 'Performance & Scalability',
        riskLevel: 'High',
        challenges: [
          'What was the exact baseline bundle size and load time before your optimization?',
          'Which specific profiling tools did you use, and what was the single biggest bottleneck you removed?'
        ],
        status: 'pending'
      }
    );
  }

  return claims;
}

/**
 * Generates tailored cross-examination challenges for a specific claim.
 */
function generateDefenseChallengesForClaim(claimText, category) {
  const challenges = [];

  if (category === 'Quantified Achievement') {
    challenges.push(
      `How exactly was this metric measured? What was the baseline before your intervention?`,
      `Which profiling tools or monitoring (e.g. Datadog, Grafana) verified this result?`,
      `What failure modes or bottleneck did you encounter while scaling to this metric?`,
      `What was your individual contribution toward achieving this number versus the rest of your team?`,
      `What trade-offs or technical compromises did you have to make to hit this metric?`
    );
  } else if (category === 'Performance & Scalability') {
    challenges.push(
      `What profiling or monitoring tools (e.g. APM, flamegraphs, explain plans) did you use to diagnose the bottleneck?`,
      `Walk me through the exact code or architectural change that produced the optimization.`,
      `Under what load or data volume would this optimization begin to degrade?`
    );
  } else if (category === 'Leadership & Ownership') {
    challenges.push(
      `How did you handle technical disagreements or pushback from team members on this initiative?`,
      `If a member was struggling with their assigned deliverable, how did you step in without micromanaging?`,
      `What would you do differently in retrospect regarding project estimation or delegation?`
    );
  } else {
    challenges.push(
      `Why did you choose this specific architectural pattern or technology over alternative solutions?`,
      `What was the single most difficult edge case or production failure encountered with this design?`,
      `How did you ensure test coverage and backwards compatibility during rollout?`
    );
  }

  return challenges;
}

/**
 * Evaluates candidate defense response against a specific claim challenge.
 */
export async function evaluateDefenseResponse(options = {}) {
  const claimText = options.claimText || options.claim?.rawText || options.claim || '';
  const challengeText = options.challengeText || options.challenge || '';
  const defenseText = options.defenseText || options.candidateResponse || options.answer || '';
  const targetRole = options.targetRole || 'Software Engineer';
  const personality = options.personality || 'strict';

  const cleanAns = (defenseText || '').trim();
  const wordCount = cleanAns ? cleanAns.split(/\s+/).filter(Boolean).length : 0;
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Check for vague or gibberish responses
  const isGibberish =
    !cleanAns ||
    cleanAns.length < 5 ||
    /^(.)\1{3,}$/.test(cleanAns) ||
    /^(test|asdf|qwerty|idk|dont know|no idea|nothing|none|xyz|abc|blah|\?+|\.+)$/i.test(cleanAns) ||
    /\b(asdf|qwerty)\b/i.test(cleanAns) ||
    (wordCount <= 2 && !/(yes|no|sql|acid|rest|soap|cap|jwt)/i.test(cleanAns));

  if (isGibberish) {
    return {
      status: 'struggled',
      score: 0,
      credibilityScore: 0,
      verdict: 'Vulnerable — Non-responsive or random input',
      feedback: 'No credit awarded: defense provided was identified as random, irrelevant, or non-responsive.',
      coachingTip: 'Provide concrete architectural context, metrics, and individual contributions.',
      rubric: {
        methodology: 'None',
        ownership: 'None',
        metricsValidation: 'None',
        tradeoffs: 'None'
      },
      strengths: [],
      vulnerabilities: ['Non-responsive or meaningless defense']
    };
  }

  // 2. Try Gemini evaluation if available and network is active
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are an expert technical interviewer cross-examining a candidate's resume claim.
Resume Claim: "${claimText}"
Role: ${targetRole}
Your Cross-Examination Challenge: "${challengeText}"
Candidate Defense Response: "${cleanAns}"

Evaluate whether the candidate defended their claim with technical depth, honesty, and concrete specifics.
Return strictly valid JSON:
{
  "status": "defended" | "partially_defended" | "struggled",
  "score": 85, // 0 to 100
  "credibilityScore": 8.5, // 0.0 to 10.0
  "verdict": "One sentence summary verdict",
  "feedback": "Detailed evaluation of their defense",
  "coachingTip": "Actionable coaching on how to state this in an actual interview",
  "rubric": {
    "methodology": "Strong" | "Adequate" | "Weak",
    "ownership": "Clear Individual Ownership" | "Partial" | "Unclear",
    "metricsValidation": "Quantified & Verified" | "Needs Baseline" | "None",
    "tradeoffs": "Demonstrated" | "Implicit" | "None"
  },
  "strengths": ["string", "string"],
  "vulnerabilities": ["string"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text);
      if (parsed?.status) {
        return {
          status: parsed.status,
          score: Number(parsed.score) || (Number(parsed.credibilityScore) * 10) || 75,
          credibilityScore: Number(parsed.credibilityScore) || 7.5,
          verdict: parsed.verdict || 'Evaluation completed',
          feedback: parsed.feedback || '',
          coachingTip: parsed.coachingTip || '',
          rubric: parsed.rubric || {
            methodology: 'Adequate',
            ownership: 'Partial',
            metricsValidation: 'Needs Baseline',
            tradeoffs: 'Implicit'
          },
          strengths: parsed.strengths || [],
          vulnerabilities: parsed.vulnerabilities || []
        };
      }
    } catch (err) {
      console.warn('Gemini defense evaluation fallback:', err.message);
    }
  }

  // 3. Deterministic evaluation engine (100% offline, resilient & fast)
  const technicalMarkers = [
    'baseline', 'measured', 'metric', 'profiler', 'apm', 'latency', 'tradeoff',
    'alternative', 'pr', 'pull request', 'architecture', 'refactored', 'schema',
    'cache', 'index', 'monitoring', 'grafana', 'datadog', 'percent', 'reduced',
    'redis', 'pprof', 'production', 'postmortem', 'triage', 'docker', 'actions', 'github', 'express', 'node',
    'helm', 'kubernetes', 'k8s', 'sprint', 'standup', 'tickets'
  ];

  const matched = technicalMarkers.filter(m => new RegExp(`\\b${m}\\b`, 'i').test(cleanAns));
  const hasNumbers = /\d+/.test(cleanAns);
  const mentionsPersonalAction = /\b(i (helped|designed|built|wrote|profiled|benchmarked|chose|replaced|re-architected|organized|delivered|led|spearheaded|migrated|refactored|implemented|attended)|my (responsibility|pr|role|contribution)|as tech lead)\b/i.test(cleanAns);
  const mentionsTeamOnly = /\b(we did it as a team|team did it|we just|everyone helped)\b/i.test(cleanAns) && !cleanAns.toLowerCase().includes('individual');

  if (mentionsTeamOnly || cleanAns.trim().toLowerCase() === 'we did it as a team.') {
    return {
      status: 'struggled',
      score: 35,
      credibilityScore: 3.5,
      verdict: 'Struggled — Weak Individual Ownership',
      feedback: 'The candidate claimed sole credit on the resume but failed to articulate their individual contribution during cross-examination.',
      coachingTip: 'Clarify exact individual ownership boundary: what was your code vs the rest of the team.',
      rubric: {
        methodology: 'Weak',
        ownership: 'Unsubstantiated / Team Conflation',
        metricsValidation: 'Weak',
        tradeoffs: 'None'
      },
      strengths: [],
      vulnerabilities: ['Failed to distinguish individual ownership from team efforts']
    };
  }

  const isStrong = hasNumbers && (
    (wordCount >= 20 && matched.length >= 2) ||
    (wordCount >= 10 && matched.length >= 2)
  );
  if (isStrong) {
    const scoreVal = Math.min(96, 82 + matched.length * 3);
    return {
      status: 'defended',
      score: scoreVal,
      credibilityScore: Math.round(scoreVal / 10 * 10) / 10,
      verdict: 'Well Defended — Highly Credible',
      feedback: 'You clearly articulated personal ownership, methodology, and specific tooling. The claim stands on solid technical ground.',
      coachingTip: 'Keep this exact narrative structure handy for your phone screen and onsite rounds.',
      rubric: {
        methodology: 'Strong',
        ownership: 'Clear Individual Ownership',
        metricsValidation: hasNumbers ? 'Quantified & Verified' : 'Solid Estimation',
        tradeoffs: 'Demonstrated'
      },
      strengths: ['Clearly distinguished personal contribution', 'Referenced concrete tools and methods', 'Provided measurable context'],
      vulnerabilities: []
    };
  }

  const isPartial = wordCount >= 10 && (matched.length >= 1 || mentionsPersonalAction);
  if (isPartial) {
    return {
      status: 'partially_defended',
      score: 65,
      credibilityScore: 6.5,
      verdict: 'Partially Defended — Needs Specifics',
      feedback: 'You described the general context, but an aggressive interviewer will press harder for exact numbers and why alternatives were rejected.',
      coachingTip: 'Explicitly state: "The team handled X, while I was personally responsible for writing the Y component and measuring Z."',
      rubric: {
        methodology: 'Adequate',
        ownership: 'Partial',
        metricsValidation: 'Needs Baseline',
        tradeoffs: 'Implicit'
      },
      strengths: ['Relevant conceptual understanding'],
      vulnerabilities: ['Lacks exact baseline metrics', 'Could more strongly define individual boundary vs team']
    };
  }

  return {
    status: 'struggled',
    score: 40,
    credibilityScore: 4.0,
    verdict: 'Struggled — High Interview Risk',
    feedback: 'The explanation was broad or speculative and lacks concrete specifics. In an interview, this signals potential resume inflation.',
    coachingTip: 'If you did not build this directly, rephrase the resume bullet to reflect your true role, or prepare a 3-step technical deep dive before the interview.',
    rubric: {
      methodology: 'Weak',
      ownership: 'Unclear',
      metricsValidation: 'Unsubstantiated',
      tradeoffs: 'Missing'
    },
    strengths: [],
    vulnerabilities: ['High risk of being caught in cross-examination', 'Weak ownership demonstration']
  };
}

/**
 * Generates an aggregated Resume Defense Report across all evaluated claims.
 */
export function generateResumeDefenseReport(claimsWithEvaluations = [], targetInfo = {}) {
  const total = claimsWithEvaluations.length;
  const now = new Date().toISOString();

  if (total === 0) {
    return {
      overallCredibilityScore: 70,
      totalClaimsCount: 0,
      totalClaimsEvaluated: 0,
      defendedCount: 0,
      partiallyDefendedCount: 0,
      struggledCount: 0,
      verdict: 'Exceptional Defense',
      unconvincingClaims: [],
      actionableTips: ['Run at least 3 claim defense drills to establish baseline credibility.'],
      targetRole: targetInfo?.role,
      targetCompany: targetInfo?.company,
      generatedAt: now,
      summary: 'No claims evaluated yet. Begin cross-examination to benchmark resume defense readiness.',
      recommendations: ['Run at least 3 claim defense drills to establish baseline credibility.']
    };
  }

  const defended = claimsWithEvaluations.filter(c => c.status === 'defended' || c.evaluation?.status === 'defended');
  const partial = claimsWithEvaluations.filter(c => c.status === 'partially_defended' || c.evaluation?.status === 'partially_defended');
  const struggled = claimsWithEvaluations.filter(c => c.status === 'struggled' || c.evaluation?.status === 'struggled');

  const totalScore = claimsWithEvaluations.reduce((acc, c) => {
    let sc = 70;
    if (c.evaluation?.score != null) {
      sc = c.evaluation.score;
    } else if (c.evaluation?.credibilityScore != null) {
      sc = c.evaluation.credibilityScore * 10;
    } else if (c.status === 'defended') {
      sc = 88;
    } else if (c.status === 'partially_defended') {
      sc = 65;
    } else if (c.status === 'struggled') {
      sc = 30;
    }
    // High risk weight factor
    const weight = c.riskLevel === 'High' ? 1.2 : 1.0;
    return acc + sc * weight;
  }, 0);

  const totalWeight = claimsWithEvaluations.reduce((acc, c) => acc + (c.riskLevel === 'High' ? 1.2 : 1.0), 0);
  const credibilityScore = Math.min(100, Math.max(0, Math.round(totalScore / totalWeight)));

  let verdict = 'Exceptional Defense';
  if (credibilityScore < 55) {
    verdict = 'Questionable Defense';
  } else if (credibilityScore < 80) {
    verdict = 'Mixed Credibility';
  }

  const recommendations = [];
  const actionableTips = [];

  if (struggled.length > 0) {
    const tip = `Revise or thoroughly rehearse the ${struggled.length} high-risk claim${struggled.length > 1 ? 's' : ''} where personal ownership or metrics were questioned.`;
    recommendations.push(tip);
    actionableTips.push(tip);
  }
  if (partial.length > 0) {
    const tip = 'Prepare exact baseline numbers and tool names for partially defended bullet points.';
    recommendations.push(tip);
    actionableTips.push(tip);
  }
  if (defended.length === total) {
    recommendations.push('Outstanding defense! Your resume claims are backed by solid, demonstrable engineering depth.');
    actionableTips.push('Solidify code snippets demonstrating your architectural trade-offs.');
  }

  return {
    overallCredibilityScore: credibilityScore,
    totalClaimsCount: total,
    totalClaimsEvaluated: total,
    defendedCount: defended.length,
    partiallyDefendedCount: partial.length,
    struggledCount: struggled.length,
    verdict,
    unconvincingClaims: struggled,
    actionableTips,
    targetRole: targetInfo?.role,
    targetCompany: targetInfo?.company,
    generatedAt: now,
    claimBreakdown: claimsWithEvaluations.map(c => ({
      id: c.id,
      claimText: c.rawText,
      category: c.category,
      status: c.status || c.evaluation?.status || 'pending',
      score: c.evaluation?.score != null ? c.evaluation.score : 70,
      verdict: c.evaluation?.verdict || 'Assessed',
      coachingTip: c.evaluation?.coachingTip || ''
    })),
    recommendations
  };
}
