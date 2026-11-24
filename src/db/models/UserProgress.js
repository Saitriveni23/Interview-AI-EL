import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  readinessScore: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastPracticeDate: { type: Date, default: null },
  competencies: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    coding: { type: Number, default: 0 },
    systemDesign: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 }
  },
  achievements: [
    {
      id: String,
      name: String,
      earnedAt: { type: Date, default: Date.now }
    }
  ],
  weeklyScores: [
    {
      week: Date,
      score: Number
    }
  ]
}, { timestamps: true });

export default mongoose.model('UserProgress', userProgressSchema);
