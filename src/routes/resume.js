import { Router } from 'express';
import multer from 'multer';
import { parsePdfToText } from '../services/pdfParser.js';
import { ResumeRedactor } from '../services/redactor.js';
import { SkillExtractor } from '../services/skillExtractor.js';
import { LLMService } from '../services/llmService.js';
import { generateGeminiQuestions } from '../services/geminiService.js';
import { evaluateInterview } from '../services/interviewEvaluationService.js';
import { getPresetJobDescription } from '../data/companyRolePresets.js';
import { parseLinkedInJob } from '../services/linkedInService.js';
import { CandidateSession, LinkedInJob, InterviewEvaluation, isDBConnected } from '../db/mongo.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const redactor = new ResumeRedactor();
const skillExtractor = new SkillExtractor();
const llmService = new LLMService();

// ==========================================
// 1. RESUME UPLOAD AND SKILL ANALYSIS
// ==========================================

router.post(
  '/parse-and-redact',
  upload.single('resumeFile'),
  async (req, res) => {
    try {
      let rawText = req.body.resumeText || '';
      const targetCompany = (req.body.targetCompany || 'Target Tech Company').trim();
      const targetRole = (req.body.targetRole || 'Full Stack Developer').trim();
      const experienceLevel = (req.body.experienceLevel || 'Mid-Level (3-5 yrs)').trim();
      let jobDescription = req.body.jobDescription || '';

      if (req.file) {
        rawText = await parsePdfToText(req.file.buffer);
      }

      if (!rawText.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid PDF resume or resume text.'
        });
      }

      // Auto-populate target role job description if empty or using company-role preset
      if (!jobDescription.trim()) {
        jobDescription = getPresetJobDescription(targetCompany, targetRole, experienceLevel);
      }

      const redactionResult = redactor.redact(rawText);

      const candidateProfile = skillExtractor.extract(
        redactionResult.redactedText
      );

      const deltaAnalysis = skillExtractor.calculateDelta(
        candidateProfile.skills,
        jobDescription
      );

      const targetInfo = {
        company: targetCompany,
        role: targetRole,
        experienceLevel
      };

      // Generate personalized study plan targeting the company and role
      const planMode = req.body.studyPlanMode || 'gemini'; // 'gemini' | 'fixed'
      const studyPlan = await llmService.generateStudyPlan(
        candidateProfile,
        deltaAnalysis,
        4,
        10,
        targetInfo,
        planMode
      );

      // Asynchronously persist to MongoDB if connected
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      if (isDBConnected()) {
        try {
          await CandidateSession.create({
            sessionId,
            targetCompany,
            targetRole,
            experienceLevel,
            extractedSkills: candidateProfile.skills || [],
            matchingSkills: deltaAnalysis.matchingSkills || [],
            missingSkills: deltaAnalysis.missingSkills || [],
            matchPercentage: deltaAnalysis.matchPercentage,
            totalRedactions: redactionResult.stats?.totalRedactions || 0,
            redactionTypes: (redactionResult.auditLog || []).map(a => a.type),
            studyPlan
          });
        } catch (dbErr) {
          console.warn('MongoDB session save warning (non-blocking):', dbErr.message);
        }
      }

      return res.json({
        success: true,
        sessionId,
        dbStatus: isDBConnected() ? 'MongoDB Active' : 'Offline / Resilient Edge Mode',
        targetInfo,
        originalText: rawText,
        redactedText: redactionResult.redactedText,
        auditLog: redactionResult.auditLog,
        stats: redactionResult.stats,
        candidateProfile,
        deltaAnalysis: {
          ...deltaAnalysis,
          targetCompany,
          targetRole,
          experienceLevel
        },
        studyPlan,
        processedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Resume processing error:', error);

      return res.status(500).json({
        success: false,
        error: 'Failed to process resume: ' + error.message
      });
    }
  }
);

// ==========================================
// 2. LINKEDIN JOB RECRUITMENT IMPORT & TABLE MATCHING
// ==========================================

router.post('/parse-linkedin-job', async (req, res) => {
  try {
    const { rawJobText, sourceUrl } = req.body;

    if (!rawJobText || !rawJobText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please paste a LinkedIn job recruitment post or text.'
      });
    }

    const jobData = parseLinkedInJob(rawJobText, sourceUrl);

    // Save to MongoDB if available
    if (isDBConnected()) {
      try {
        await LinkedInJob.create({
          jobId: jobData.jobId,
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          employmentType: jobData.employmentType,
          experienceLevel: jobData.experienceLevel,
          sourceUrl: jobData.sourceUrl,
          rawJobDescription: jobData.rawJobDescription,
          requiredSkills: jobData.requiredSkills,
          responsibilities: jobData.responsibilities
        });
      } catch (dbErr) {
        console.warn('MongoDB job save warning (non-blocking):', dbErr.message);
      }
    }

    return res.json({
      success: true,
      job: jobData,
      dbStatus: isDBConnected() ? 'MongoDB Stored' : 'In-Memory / Edge Mode'
    });

  } catch (error) {
    console.error('LinkedIn job parsing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to parse LinkedIn job post: ' + error.message
    });
  }
});

// ==========================================
// 3. GENERATE PERSONALIZED STUDY PLAN
// ==========================================

router.post('/generate-study-plan', async (req, res) => {
  try {
    const {
      candidateProfile,
      deltaAnalysis,
      preferredStudyWeeks,
      weeklyStudyHours,
      targetInfo
    } = req.body;

    if (
      !candidateProfile ||
      !deltaAnalysis ||
      !Array.isArray(candidateProfile.skills) ||
      !Array.isArray(deltaAnalysis.missingSkills)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Candidate profile or skill-gap analysis is missing.'
      });
    }

    const selectedWeeks = Number(preferredStudyWeeks);
    const hoursPerWeek = Number(weeklyStudyHours);

    if (
      !Number.isInteger(selectedWeeks) ||
      selectedWeeks < 1 ||
      selectedWeeks > 52
    ) {
      return res.status(400).json({
        success: false,
        error: 'Preparation duration must be between 1 and 52 weeks.'
      });
    }

    if (
      !Number.isFinite(hoursPerWeek) ||
      hoursPerWeek < 1 ||
      hoursPerWeek > 80
    ) {
      return res.status(400).json({
        success: false,
        error: 'Weekly study hours must be between 1 and 80.'
      });
    }

    const planMode = req.body.studyPlanMode || 'gemini'; // 'gemini' | 'fixed'
    const studyPlan = await llmService.generateStudyPlan(
      candidateProfile,
      deltaAnalysis,
      selectedWeeks,
      hoursPerWeek,
      targetInfo,
      planMode
    );

    return res.json({
      success: true,
      studyPlan
    });

  } catch (error) {
    console.error('Study plan generation error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to generate study plan: ' + error.message
    });
  }
});

// ==========================================
// 3. LAYER 2: RESUME CLAIM VERIFICATION
// ==========================================

router.post('/verify-factuality', async (req, res) => {
  try {
    const { claim, redactedResumeText } = req.body;

    if (
      typeof claim !== 'string' ||
      !claim.trim() ||
      typeof redactedResumeText !== 'string' ||
      !redactedResumeText.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing claim or redactedResumeText parameters.'
      });
    }

    const verification = await llmService.verifyClaimAgainstResume(
      claim,
      redactedResumeText
    );

    return res.json({
      success: true,
      verification
    });

  } catch (error) {
    console.error('Factuality verification error:', error);

    return res.status(500).json({
      success: false,
      error: 'Factuality check failed: ' + error.message
    });
  }
});

// ==========================================
// 4. GEMINI INTERVIEW QUESTION GENERATION
// ==========================================

router.post('/generate-questions', async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide candidate skills.'
      });
    }

    const questions = await generateGeminiQuestions(skills);

    return res.json({
      success: true,
      source: 'gemini',
      questions
    });

  } catch (error) {
    console.error('Gemini question generation error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to generate interview questions.'
    });
  }
});

// ==========================================
// 5. AI INTERVIEW EVALUATION
// ==========================================

router.post('/evaluate-interview', async (req, res) => {
  try {
    const {
      answers,
      redactedResumeText = ''
    } = req.body;

    if (
      !Array.isArray(answers) ||
      answers.length !== 7
    ) {
      return res.status(400).json({
        success: false,
        error: 'Exactly 7 interview answers are required.'
      });
    }

    const validAnswers = answers.every(
      item =>
        item &&
        typeof item.question === 'string' &&
        item.question.trim() &&
        typeof item.answer === 'string' &&
        item.answer.trim() &&
        [
  'Technical',
  'Behavioral',
  'Situational',
  'Resume-Based'
].includes(
          item.category
        )
    );

    if (!validAnswers) {
      return res.status(400).json({
        success: false,
        error: 'Interview answers contain missing or invalid information.'
      });
    }

    const evaluation = await evaluateInterview({
      answers,
      redactedResumeText,
      llmService
    });

    // Save evaluation to MongoDB if connected
    if (isDBConnected() && evaluation?.overallScore != null) {
      try {
        await InterviewEvaluation.create({
          sessionId: req.body.sessionId || `eval_${Date.now()}`,
          overallScore: evaluation.overallScore,
          categoryScores: evaluation.categoryScores || {},
          questionEvaluations: evaluation.questionEvaluations || [],
          strengths: evaluation.strengths || [],
          improvementAreas: evaluation.improvementAreas || [],
          recommendations: evaluation.recommendations || [],
          source: evaluation.source || 'ai'
        });
      } catch (dbErr) {
        console.warn('MongoDB evaluation save warning (non-blocking):', dbErr.message);
      }
    }

    return res.json({
      success: true,
      evaluation,
      dbStatus: isDBConnected() ? 'MongoDB Saved' : 'In-Memory / Client Saved'
    });

  } catch (error) {
    console.error('Interview evaluation error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to evaluate interview answers.'
    });
  }
});

export default router;