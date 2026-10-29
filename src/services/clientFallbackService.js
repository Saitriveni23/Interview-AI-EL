import { ResumeRedactor } from './redactor.js';
import { SkillExtractor } from './skillExtractor.js';
import { getPresetJobDescription } from '../data/companyRolePresets.js';
import { STUDY_MATERIALS_REGISTRY } from '../data/studyMaterials.js';

const redactor = new ResumeRedactor();
const skillExtractor = new SkillExtractor();

/**
 * Builds a deterministic, structured study plan in the browser
 */
function buildClientStudyPlan(candidateProfile, deltaAnalysis, targetInfo) {
  const missingSkills = deltaAnalysis.missingSkills || [];
  const targetCompany = targetInfo.company || 'Tech Benchmark';
  const targetRole = targetInfo.role || 'Software Engineer';

  // Build weekly roadmap
  const weeks = [];
  const numWeeks = Math.max(2, Math.min(6, Math.ceil(missingSkills.length / 2) || 3));

  for (let w = 1; w <= numWeeks; w++) {
    const startIdx = (w - 1) * 2;
    const weekSkills = missingSkills.slice(startIdx, startIdx + 2);
    const focusTitle = weekSkills.length > 0 ? weekSkills.join(' & ') : 'Full Stack Architecture & STAR Interview Prep';

    weeks.push({
      weekNumber: w,
      title: `Week ${w}: ${focusTitle}`,
      focus: `Master core concepts and practical interview exercises for ${focusTitle}`,
      topics: weekSkills.length > 0 ? weekSkills.map(s => `${s} core architecture, common interview questions, and hands-on coding exercises`) : [
        'System design tradeoffs and scalable architecture patterns',
        'STAR method behavioral stories and mock interview practice'
      ],
      practicalExercise: weekSkills.length > 0 ? `Build a mini integration project utilizing ${weekSkills.join(' and ')}.` : 'Complete 3 timed technical mock interviews with STAR feedback.'
    });
  }

  // Gather curated resources
  const curatedResources = [];
  const allNeededSkills = [...(deltaAnalysis.missingSkills || []), ...(deltaAnalysis.skillsToImprove || [])];
  
  allNeededSkills.forEach(skillName => {
    const reg = STUDY_MATERIALS_REGISTRY[skillName];
    if (reg) {
      curatedResources.push(reg);
    }
  });

  return {
    title: `Personalized Study Plan: ${targetRole} @ ${targetCompany}`,
    domainCategory: candidateProfile.domainCategory || 'Software Engineering',
    summary: `Targeted preparation plan designed to bridge the ${missingSkills.length} identified gap${missingSkills.length === 1 ? '' : 's'} for ${targetRole} hiring benchmarks at ${targetCompany}.`,
    minimumStudyWeeks: numWeeks,
    finalStudyWeeks: numWeeks,
    weeklyStudyHours: 10,
    estimatedLearningHours: missingSkills.length * 20,
    roadmap: weeks,
    curatedMaterials: curatedResources,
    source: 'client-deterministic'
  };
}

/**
 * Client-Side Resume Analysis Fallback Engine
 * Runs completely inside the browser with zero external network dependencies
 */
export async function analyzeResumeClientSide({
  rawText,
  targetCompany = 'Google',
  targetRole = 'Full Stack Developer',
  experienceLevel = 'Mid-Level (3-5 yrs)',
  jobDescription = ''
}) {
  const effectiveCompany = targetCompany.trim() || 'Google';
  const effectiveRole = targetRole.trim() || 'Full Stack Developer';
  const effectiveSeniority = experienceLevel.trim() || 'Mid-Level (3-5 yrs)';
  
  const effectiveJD = jobDescription.trim() || getPresetJobDescription(effectiveCompany, effectiveRole, effectiveSeniority);
  const textToAnalyze = rawText && rawText.trim() ? rawText : 'Software engineer with experience in web technologies.';

  // 1. Redact PII & Demographic bias
  const redactionResult = redactor.redact(textToAnalyze);

  // 2. Extract Candidate Profile
  const candidateProfile = skillExtractor.extract(redactionResult.redactedText);

  // 3. Compute Delta Gap Analysis
  const deltaAnalysis = skillExtractor.calculateDelta(candidateProfile.skills, effectiveJD);

  const targetInfo = {
    company: effectiveCompany,
    role: effectiveRole,
    experienceLevel: effectiveSeniority
  };

  // 4. Build Study Plan
  const studyPlan = buildClientStudyPlan(candidateProfile, deltaAnalysis, targetInfo);

  return {
    success: true,
    targetInfo,
    originalText: textToAnalyze,
    redactedText: redactionResult.redactedText,
    auditLog: redactionResult.auditLog || [],
    stats: redactionResult.stats || { totalRedactions: 0 },
    candidateProfile,
    deltaAnalysis: {
      ...deltaAnalysis,
      targetCompany: effectiveCompany,
      targetRole: effectiveRole,
      experienceLevel: effectiveSeniority
    },
    studyPlan,
    processedAt: new Date().toISOString(),
    isClientProcessed: true
  };
}

