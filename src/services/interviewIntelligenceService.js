export const COMPETENCY_DIMENSIONS = [
  { key: 'technical', label: 'Technical Knowledge', icon: 'Code', description: 'Understanding of core languages, runtimes, and frameworks' },
  { key: 'communication', label: 'Communication & Clarity', icon: 'MessageSquare', description: 'Concise, structured delivery and articulation of ideas' },
  { key: 'problemSolving', label: 'Problem Solving & Logic', icon: 'Brain', description: 'Deconstructing ambiguity and structured analytical thought' },
  { key: 'coding', label: 'Coding & Algorithms', icon: 'Terminal', description: 'Algorithmic efficiency, clean code, and data structures' },
  { key: 'systemDesign', label: 'System Design & Scale', icon: 'Layers', description: 'Distributed systems, database tradeoffs, and resilience' },
  { key: 'behavioral', label: 'Behavioral & Leadership', icon: 'Award', description: 'STAR alignment, conflict resolution, and personal ownership' }
];

/**
 * Calculates long-term competency metrics and Interview Readiness Score.
 */
export function calculateIntelligenceMetrics({
  sessions = [],
  interviewEvaluations = [],
  resumeDefenseReport = null,
  deltaAnalysis = null
}) {
  // 1. Initial baseline scores
  let scores = {
    technical: 68,
    communication: 72,
    problemSolving: 65,
    coding: 60,
    systemDesign: 58,
    behavioral: 70
  };

  // If deltaAnalysis exists, factor in resume skill-match
  if (deltaAnalysis?.matchPercentage != null) {
    const match = Number(deltaAnalysis.matchPercentage) || 0;
    scores.technical = Math.round(match * 0.75 + scores.technical * 0.25);
  }

  // If Resume Defense report exists, factor in credibility
  if (resumeDefenseReport?.overallCredibilityScore != null) {
    const cred = Number(resumeDefenseReport.overallCredibilityScore) || 70;
    scores.communication = Math.round(scores.communication * 0.6 + cred * 0.4);
    scores.behavioral = Math.round(scores.behavioral * 0.5 + cred * 0.5);
  }

  // If historical interview evaluations exist, factor them in
  if (interviewEvaluations.length > 0) {
    let techSum = 0, commSum = 0, psSum = 0, count = 0;

    for (const ev of interviewEvaluations) {
      if (ev.overallScore != null) {
        const sc = ev.overallScore * 10; // convert 0-10 to 0-100
        techSum += sc;
        commSum += sc * 0.95;
        psSum += sc * 0.9;
        scores.coding = Math.round(scores.coding * 0.3 + sc * 0.7);
        scores.systemDesign = Math.round(scores.systemDesign * 0.3 + sc * 0.7);
        scores.technical = Math.round(scores.technical * 0.3 + sc * 0.7);
        count++;
      }
      if (ev.categoryScores) {
        if (ev.categoryScores.Technical != null) scores.technical = ev.categoryScores.Technical * 10;
        if (ev.categoryScores.Behavioral != null) scores.behavioral = ev.categoryScores.Behavioral * 10;
        if (ev.categoryScores.Situational != null) scores.problemSolving = ev.categoryScores.Situational * 10;
        if (ev.categoryScores['Resume-Based'] != null) scores.communication = ev.categoryScores['Resume-Based'] * 10;
      }
    }

    if (count > 0 && !interviewEvaluations.some(e => e.categoryScores)) {
      scores.technical = Math.round((scores.technical + techSum / count) / 2);
      scores.communication = Math.round((scores.communication + commSum / count) / 2);
      scores.problemSolving = Math.round((scores.problemSolving + psSum / count) / 2);
    }
  }

  // Clamp all scores between 20 and 99
  for (const k of Object.keys(scores)) {
    scores[k] = Math.max(25, Math.min(99, Math.round(scores[k])));
  }

  // Calculate Overall Interview Readiness Score (weighted composite)
  const readinessScore = Math.round(
    scores.technical * 0.25 +
    scores.systemDesign * 0.20 +
    scores.coding * 0.15 +
    scores.problemSolving * 0.15 +
    scores.behavioral * 0.15 +
    scores.communication * 0.10
  );

  // Identify Strengths and Weaknesses
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strengths = sorted.slice(0, 3).map(([k, score]) => ({
    key: k,
    label: COMPETENCY_DIMENSIONS.find(d => d.key === k)?.label || k,
    score
  }));
  const weaknesses = sorted.slice(-3).reverse().map(([k, score]) => ({
    key: k,
    label: COMPETENCY_DIMENSIONS.find(d => d.key === k)?.label || k,
    score
  }));

  // Historical Trends (sessions timeline)
  const timeline = sessions.slice(0, 7).reverse().map((s, idx) => ({
    id: s.id || `sess_${idx}`,
    date: s.date ? new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Int ${idx + 1}`,
    score: s.score != null ? s.score : Math.min(95, 60 + idx * 6),
    role: s.targetRole || 'Engineering'
  }));

  if (timeline.length === 0) {
    timeline.push(
      { id: 't1', date: 'Session 1', score: Math.max(50, readinessScore - 12), role: 'Initial Baseline' },
      { id: 't2', date: 'Session 2', score: Math.max(55, readinessScore - 5), role: 'Intermediate Prep' },
      { id: 't3', date: 'Current', score: readinessScore, role: 'Current Assessment' }
    );
  }

  const drills = generateTargetedPracticeDrills(weaknesses, deltaAnalysis?.missingSkills || []);

  return {
    competencies: scores,
    readinessScore,
    readinessTier: readinessScore >= 80 ? 'Offer Ready' : readinessScore >= 65 ? 'Competitive' : 'Developing',
    strengths,
    weaknesses,
    timeline,
    drills,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Generates actionable targeted training drills based on weak competencies.
 */
export function generateTargetedPracticeDrills(weaknesses = [], missingSkills = []) {
  const drills = [];
  const weakKeys = new Set(weaknesses.map(w => w.key));

  if (weakKeys.has('systemDesign')) {
    drills.push({
      id: 'drill_sd_1',
      title: 'Distributed Caching & Invalidation Drill',
      competency: 'System Design & Scale',
      duration: '8 mins',
      focus: 'Explain write-through vs write-back caching and Thundering Herd mitigation.',
      actionType: 'interview',
      presetType: 'System Design'
    });
  }

  if (weakKeys.has('behavioral') || weakKeys.has('communication')) {
    drills.push({
      id: 'drill_beh_1',
      title: 'STAR Method Conflict Resolution Rehearsal',
      competency: 'Behavioral & Leadership',
      duration: '5 mins',
      focus: 'Frame a technical disagreement with clear Situation, Task, Action, and Quantifiable Result.',
      actionType: 'interview',
      presetType: 'Behavioral'
    });
  }

  if (weakKeys.has('coding')) {
    drills.push({
      id: 'drill_coding_1',
      title: 'Data Structures & Algorithmic Efficiency Drill',
      competency: 'Coding & Algorithms',
      duration: '7 mins',
      focus: 'Optimize time and space complexity with clean data structure selections.',
      actionType: 'interview',
      presetType: 'Technical'
    });
  }

  if (weakKeys.has('technical')) {
    drills.push({
      id: 'drill_tech_1',
      title: 'Core Runtime & API Performance Drill',
      competency: 'Technical Knowledge',
      duration: '6 mins',
      focus: 'Practice articulating failure modes and scaling limits in core frameworks.',
      actionType: 'interview',
      presetType: 'Technical'
    });
  }

  if (Array.isArray(missingSkills) && missingSkills.length > 0) {
    missingSkills.slice(0, 2).forEach((skill, idx) => {
      drills.push({
        id: `drill_gap_${idx}`,
        title: `Target Gap: ${skill} Deep Dive`,
        competency: 'Technical Knowledge',
        duration: '5 mins',
        focus: `Bridge resume requirement gap for ${skill} with targeted architectural questions.`,
        actionType: 'interview',
        presetType: 'Technical'
      });
    });
  }

  if (drills.length === 0) {
    drills.push({
      id: 'drill_gen_1',
      title: 'Quantified Resume Claim Defense Rehearsal',
      competency: 'Communication & Clarity',
      duration: '6 mins',
      focus: 'Defend your top metric claim under high-pressure interviewer cross-examination.',
      actionType: 'defense',
      presetType: 'Resume-Based'
    });
  }

  return drills;
}

/**
 * Mathematical polar coordinate calculations for rendering clean SVG spider/radar charts.
 */
export function getRadarPolygonPoints(competencies, centerX, centerY, radius) {
  const keys = ['technical', 'communication', 'problemSolving', 'coding', 'systemDesign', 'behavioral'];
  const total = keys.length;
  const points = [];

  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const score = (competencies[keys[i]] || 60) / 100;
    const r = radius * score;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    points.push(`${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`);
  }

  return points.join(' ');
}
