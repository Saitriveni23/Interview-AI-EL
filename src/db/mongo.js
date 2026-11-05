import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interview_ai';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return true;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000, // Fast 3s timeout so offline mode activates without delay
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.warn(`MongoDB not available (${err.message}). Using resilient in-memory / edge storage mode.`);
    isConnected = false;
    return false;
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

// --------------------------------------------------------------------------
// 1. Candidate & Resume Model
// --------------------------------------------------------------------------
const CandidateSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  targetCompany: { type: String, default: 'Google' },
  targetRole: { type: String, default: 'Full Stack Developer' },
  experienceLevel: { type: String, default: 'Mid-Level' },
  extractedSkills: [String],
  matchingSkills: [String],
  missingSkills: [String],
  matchPercentage: Number,
  totalRedactions: Number,
  redactionTypes: [String],
  studyPlan: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// --------------------------------------------------------------------------
// 2. LinkedIn Job Recruitment Model
// --------------------------------------------------------------------------
const LinkedInJobSchema = new mongoose.Schema({
  jobId: { type: String, index: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: 'Remote / Hybrid' },
  employmentType: { type: String, default: 'Full-time' },
  experienceLevel: { type: String, default: 'Not specified' },
  sourceUrl: String,
  rawJobDescription: { type: String, required: true },
  requiredSkills: [String],
  responsibilities: [String],
  fetchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// --------------------------------------------------------------------------
// 3. Interview Evaluation Model
// --------------------------------------------------------------------------
const InterviewEvaluationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  overallScore: Number,
  categoryScores: {
    Technical: Number,
    Behavioral: Number,
    Situational: Number,
    'Resume-Based': Number
  },
  questionEvaluations: [mongoose.Schema.Types.Mixed],
  strengths: [String],
  improvementAreas: [String],
  recommendations: [String],
  source: { type: String, default: 'ai' }, // 'gemini' | 'fixed' | 'fallback'
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const CandidateSession = mongoose.models.CandidateSession || mongoose.model('CandidateSession', CandidateSessionSchema);
export const LinkedInJob = mongoose.models.LinkedInJob || mongoose.model('LinkedInJob', LinkedInJobSchema);
export const InterviewEvaluation = mongoose.models.InterviewEvaluation || mongoose.model('InterviewEvaluation', InterviewEvaluationSchema);

