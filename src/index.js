import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import resumeRoutes from './routes/resume.js';
import { connectDB, isDBConnected } from './db/mongo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB asynchronously (does not block server startup if offline)
connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Interview AI Core Engine',
    layer1Governance: 'ACTIVE (Bias & PII Shield)',
    layer2Governance: 'ACTIVE (Hallucination Checker)',
    database: isDBConnected() ? 'CONNECTED (MongoDB)' : 'OFFLINE / RESILIENT EDGE MODE',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/resume', resumeRoutes);

app.listen(PORT, () => {
  console.log(`Interview AI Backend Server running on http://localhost:${PORT}`);
});
