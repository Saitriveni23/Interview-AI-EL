import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetRole: String,
  company: String,
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'completed' },
  score: Number,
  answers: [{ question: String, answer: String, score: Number, category: String }],
  evaluation: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
