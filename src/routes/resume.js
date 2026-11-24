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
import { User, CandidateSession, LinkedInJob, InterviewEvaluation, isDBConnected } from '../db/mongo.js';
import {
  generateAdaptiveQuestion,
  generateContextualFollowUp,
  analyzeAnswerQuality,
  calculateNextDifficulty,
  INTERVIEW_PERSONALITIES,
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS
} from '../services/adaptiveInterviewerService.js';
import {
  extractResumeClaims,
  evaluateDefenseResponse,
  generateResumeDefenseReport
} from '../services/resumeDefenseService.js';
import {
  calculateIntelligenceMetrics,
  generateTargetedPracticeDrills
} from '../services/interviewIntelligenceService.js';
import { evaluateAnswerWithLLM } from '../services/llmScoringService.js';
import Session from '../db/models/Session.js';
import UserProgress from '../db/models/UserProgress.js';

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
// 0. USER AUTHENTICATION & PROFILE ENDPOINTS
// ==========================================

router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (isDBConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
      }

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: Buffer.from(password).toString('base64'),
        headline: 'Software Engineering Candidate'
      });

      return res.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, headline: user.headline }
      });
    }

    // In-memory / edge response if MongoDB is offline
    return res.json({
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        headline: 'Software Engineering Candidate'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    if (isDBConnected()) {
      const user = await User.findOne({
        email: email.toLowerCase().trim(),
        password: Buffer.from(password).toString('base64')
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      return res.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, headline: user.headline }
      });
    }

    // Edge offline fallback login
    return res.json({
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        headline: 'Software Engineering Candidate'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

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
      answers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Interview answers are required.'
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
          'Resume-Based',
          'System Design',
          'HR'
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

// ==========================================
// 6. ADAPTIVE INTERVIEWER ENDPOINTS
// ==========================================

router.post('/adaptive-question', async (req, res) => {
  try {
    const {
      category = 'Technical',
      difficulty = 'Intermediate',
      personality = 'professional',
      previousQuestion = '',
      previousAnswer = '',
      candidateSkills = [],
      targetInfo = {},
      usedQuestions = []
    } = req.body;

    const result = await generateAdaptiveQuestion({
      category,
      currentDifficulty: difficulty,
      personality,
      previousQuestion,
      previousAnswer,
      candidateSkills,
      targetInfo,
      usedQuestions
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Adaptive question generation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate adaptive question' });
  }
});

router.post('/adaptive-followup', async (req, res) => {
  try {
    const {
      question = '',
      answer = '',
      personality = 'professional',
      category = 'Technical'
    } = req.body;

    const followUp = await generateContextualFollowUp({
      question,
      answer,
      personality,
      category
    });

    const analysis = analyzeAnswerQuality(answer, question);
    const nextDifficulty = calculateNextDifficulty('Intermediate', analysis.quality);

    return res.json({
      success: true,
      followUp,
      analysis,
      nextDifficulty
    });
  } catch (error) {
    console.error('Follow-up generation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate follow-up question' });
  }
});

// ==========================================
// 7. RESUME DEFENSE & CROSS-EXAMINATION
// ==========================================

router.post('/extract-claims', async (req, res) => {
  try {
    const { resumeText = '' } = req.body;
    const claims = extractResumeClaims(resumeText);
    return res.json({ success: true, claims });
  } catch (error) {
    console.error('Resume claims extraction error:', error);
    return res.status(500).json({ success: false, error: 'Failed to extract resume claims' });
  }
});

router.post('/defend-claim', async (req, res) => {
  try {
    const {
      claimText = '',
      challengeText = '',
      defenseText = '',
      targetRole = 'Software Engineer'
    } = req.body;

    const evaluation = await evaluateDefenseResponse({
      claimText,
      challengeText,
      defenseText,
      targetRole
    });

    return res.json({ success: true, evaluation });
  } catch (error) {
    console.error('Claim defense evaluation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to evaluate defense' });
  }
});

router.post('/defense-report', (req, res) => {
  try {
    const { claims = [], targetInfo = {} } = req.body;
    const report = generateResumeDefenseReport(claims, targetInfo);
    return res.json({ success: true, report });
  } catch (error) {
    console.error('Defense report error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate defense report' });
  }
});

// ==========================================
// 8. INTERVIEW INTELLIGENCE DASHBOARD
// ==========================================

router.post('/intelligence-metrics', (req, res) => {
  try {
    const {
      sessions = [],
      interviewEvaluations = [],
      resumeDefenseReport = null,
      deltaAnalysis = null
    } = req.body;

    const metrics = calculateIntelligenceMetrics({
      sessions,
      interviewEvaluations,
      resumeDefenseReport,
      deltaAnalysis
    });

    const drills = generateTargetedPracticeDrills(metrics);

    return res.json({ success: true, metrics, drills });
  } catch (error) {
    console.error('Intelligence metrics calculation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to calculate intelligence metrics' });
  }
});

// ==========================================
// 9. LLM ANSWER SCORING & EVALUATION
// ==========================================

router.post('/evaluate-answer-llm', async (req, res) => {
  try {
    const {
      question = '',
      answer = '',
      category = 'Technical',
      difficulty = 'Intermediate',
      personality = 'professional'
    } = req.body;

    const evaluation = await evaluateAnswerWithLLM({
      question,
      answer,
      category,
      difficulty,
      personality
    });

    return res.json({ success: true, evaluation });
  } catch (error) {
    console.error('LLM evaluation error:', error);
    return res.status(500).json({ success: false, error: 'Failed to evaluate answer with LLM' });
  }
});

// ==========================================
// 10. MONGODB SESSION PERSISTENCE & USER PROGRESS
// ==========================================

// In-memory fallback stores when MongoDB is offline
const inMemorySessions = new Map(); // userId -> [sessions]
const inMemoryProgress = new Map(); // userId -> progressObj

router.post('/sessions/save', async (req, res) => {
  try {
    const {
      userId = 'anon_candidate',
      targetRole = 'Full Stack Developer',
      company = 'Target Tech',
      score = 80,
      answers = [],
      evaluation = {},
      metadata = {}
    } = req.body;

    let savedSessionId = 'sess_' + Date.now();

    if (isDBConnected()) {
      const newSession = await Session.create({
        userId,
        targetRole,
        company,
        score,
        answers,
        evaluation,
        metadata
      });
      savedSessionId = newSession._id.toString();

      // Update User Progress
      const existingProgress = await UserProgress.findOne({ userId });
      if (existingProgress) {
        existingProgress.sessionsCompleted += 1;
        existingProgress.readinessScore = Math.round(
          (existingProgress.readinessScore * 0.7) + (score * 0.3)
        );
        const lastDate = existingProgress.lastPracticeDate ? new Date(existingProgress.lastPracticeDate) : null;
        const today = new Date();
        if (lastDate && (today - lastDate) < 48 * 3600 * 1000) {
          existingProgress.streak += 1;
        } else if (!lastDate) {
          existingProgress.streak = 1;
        }
        existingProgress.lastPracticeDate = today;
        await existingProgress.save();
      } else {
        await UserProgress.create({
          userId,
          readinessScore: score,
          sessionsCompleted: 1,
          streak: 1,
          lastPracticeDate: new Date()
        });
      }
    } else {
      // In-memory fallback
      const userList = inMemorySessions.get(userId) || [];
      const sessionObj = {
        _id: savedSessionId,
        userId,
        targetRole,
        company,
        score,
        answers,
        evaluation,
        date: new Date().toISOString()
      };
      userList.unshift(sessionObj);
      inMemorySessions.set(userId, userList);

      const prog = inMemoryProgress.get(userId) || {
        userId,
        readinessScore: score,
        sessionsCompleted: 0,
        streak: 1
      };
      prog.sessionsCompleted += 1;
      prog.readinessScore = Math.round((prog.readinessScore * 0.7) + (score * 0.3));
      inMemoryProgress.set(userId, prog);
    }

    return res.json({ success: true, sessionId: savedSessionId });
  } catch (error) {
    console.error('Session save error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save session' });
  }
});

router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (isDBConnected()) {
      const sessions = await Session.find({ userId }).sort({ createdAt: -1 }).limit(50);
      return res.json({ success: true, sessions });
    } else {
      const sessions = inMemorySessions.get(userId) || [];
      return res.json({ success: true, sessions });
    }
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;

    if (isDBConnected()) {
      const progress = await UserProgress.findOne({ userId });
      return res.json({ success: true, progress: progress || null });
    } else {
      const progress = inMemoryProgress.get(userId) || {
        userId,
        readinessScore: 82,
        sessionsCompleted: 5,
        streak: 4
      };
      return res.json({ success: true, progress });
    }
  } catch (error) {
    console.error('Fetch progress error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch user progress' });
  }
});

export default router;