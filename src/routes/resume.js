import { Router } from 'express';
import multer from 'multer';
import { parsePdfToText } from '../services/pdfParser.js';
import { ResumeRedactor } from '../services/redactor.js';
import { SkillExtractor } from '../services/skillExtractor.js';
import { LLMService } from '../services/llmService.js';
import { generateGeminiQuestions } from '../services/geminiService.js';
import { evaluateInterview } from '../services/interviewEvaluationService.js';
import { getPresetJobDescription } from '../data/companyRolePresets.js';

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
      const studyPlan = await llmService.generateStudyPlan(
        candidateProfile,
        deltaAnalysis,
        4,
        10,
        targetInfo
      );

      return res.json({
        success: true,
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
// 2. GENERATE PERSONALIZED STUDY PLAN
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

    const studyPlan = await llmService.generateStudyPlan(
      candidateProfile,
      deltaAnalysis,
      selectedWeeks,
      hoursPerWeek,
      targetInfo
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

    return res.json({
      success: true,
      evaluation
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