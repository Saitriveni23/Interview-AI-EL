import express from 'express';
import cors from 'cors';
import resumeRoutes from '../src/routes/resume.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Interview AI Core Engine (Vercel Serverless)',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/resume', resumeRoutes);

export default app;
