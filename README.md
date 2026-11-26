# Interview AI EL — Adaptive Interview Preparation & Intelligence Platform 🚀

**Interview AI EL** is an end-to-end AI-powered career preparation platform designed to simulate realistic interviews, verify candidate resume claims, and provide continuous training loops toward interview readiness.

Powered by a **2-Layer Governance Architecture** (Privacy/Bias Redaction + Hallucination Checking), dynamic Gemini LLM integration, and fully deterministic offline fallbacks.

---

## 🌟 Core Feature Pillars

### 1. 🎭 Adaptive AI Interviewer
A dynamic interview simulator that adapts to answers instead of reciting static question scripts:
- **5 Interviewer Personas**:
  - `Friendly`: Supportive coach focused on encouraging candidates through constructive hints.
  - `Professional`: Standard benchmark evaluating communication, technical depth, and structured reasoning.
  - `Strict`: Demanding interviewer pressing for exact definitions, precision, and zero hand-waving.
  - `Senior Engineer`: Architecture and scale focus; challenges trade-offs, concurrency, and failure modes.
  - `High-Pressure`: Rapid stress testing that evaluates poise under intense scrutiny.
- **Dynamic Difficulty Adaptation**: Real-time escalation across 4 tiers (`Beginner` → `Intermediate` → `Advanced` → `Staff`).
- **Live Answer Quality Assessment**: Real-time classification of answers (`Strong & Detailed`, `Vague`, `Incomplete`, `Incorrect`).
- **Contextual Follow-Up Generation**: Automatically challenges technical decisions, presses for metrics, or requests trade-off justification.
- **🎙️ Voice & Real-Time Mode**: Web Speech API speech-to-text dictation, filler word counter (`um`, `uh`, `like`), pacing countdown timer, and text-to-speech question reading.
- **💻 In-Browser Code Sandbox**: Interactive execution sandbox for algorithmic and DSA challenges with multi-language selector and built-in unit tests.

---

### 2. 🛡️ Resume Defense & Cross-Examination
An AI system that interrogates bullet points written on candidate resumes:
- **Claim Extraction**: Extracts quantifiable percentage metrics, throughput numbers, team leadership, architecture decisions, and financial impacts.
- **Cross-Examination Interrogation**: Probes the baseline measurement, individual contribution, edge cases, and technical trade-offs.
- **Rubric-Based Defense Evaluation**: Scores defense responses across Methodology, Ownership, Metrics Validation, and Trade-off Awareness.
- **🔍 GitHub Project Verifier**: Scans public GitHub repositories to verify claimed projects, check commit recency, stars, and language distribution.
- **🏢 Company-Specific Defense**: Tailors defense questions to specific company interview styles (Google, Amazon, Meta, Microsoft).
- **📄 Zero-Dependency PDF Export**: One-click print-optimized PDF generation for the Resume Defense Verification Report.

---

### 3. 🧠 Interview Intelligence Dashboard & Training Loop
A longitudinal readiness tracking system that identifies weaknesses and closes skill gaps:
- **6-Axis Competency Radar**: SVG radar chart tracking `Technical Knowledge`, `Communication`, `Problem Solving`, `Coding`, `System Design`, and `Behavioral`.
- **Composite Readiness Score**: Weighted 0–100 score categorizing candidates into `Offer Ready`, `Competitive`, or `Developing`.
- **Targeted Practice Drills**: Automatically synthesized training drills focusing on lowest-scoring competencies and identified resume delta gaps.
- **📈 Week-over-Week Score Trends**: Multi-line SVG chart tracking readiness and communication scores across sessions.
- **🔥 Heatmap & Streak Tracking**: 12+ technical topic proficiency heatmap, practice streaks, and achievement badges.
- **⏪ Session Replay & Markdown Export**: Chronological replay of previous interview Q&As with full rubric scoring and Markdown download.

---

### 4. 🔗 Job Description Intelligence & Integrations
- **JD Parser Engine**: Extracts role, company, experience seniority, remote policy, and technical requirements from raw job posts.
- **Resume Match & Gap Benchmarking**: Compares candidate skills against job requirements with match percentages and prioritized missing skills.
- **Targeted Question Synthesis**: Generates custom interview questions aligned with target JD requirements.
- **Export to Notion & Google Docs**: Generates formatted study plans and session summaries.
- **🏆 Global Leaderboard**: Candidate benchmarking with percentile rankings and achievement badges.

---

## 🛡️ 2-Layer Governance Architecture

### Layer 1: Bias Filter & Privacy Shield (Demographic & PII Redaction)
Automatically redacts data points that could introduce non-merit discrimination or privacy exposure:
- **Demographic Information**: Skin colour / appearance, age, graduation year, gender/pronouns, native place, religion, caste, marital status.
- **Personally Identifiable Information (PII)**: Candidate name, email, phone number, address, social URLs.

### Layer 2: Hallucination & Factuality Checker
Cross-references candidate claims against uploaded resume text and validates technical accuracy.

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide Icons, Web Speech API, Web Audio API
- **Backend**: Node.js (ESM), Express.js, Multer, `pdf-parse`, Mongoose
- **AI / LLM**: `@google/genai` (Gemini Flash & Pro) with deterministic offline fallback
- **Storage**: MongoDB with in-memory resilient fallback
- **Testing**: Node.js built-in test runner (`node --test`) — 114 automated unit & integration tests

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20+)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/Saitriveni23/Interview-AI-EL.git
cd Interview-AI-EL
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` file in the project root:
```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/interview-ai
```
*(Note: If no API key or MongoDB is provided, the application automatically runs in resilient offline mode with deterministic fallbacks).*

### 3. Run Automated Tests
```bash
npm test
# Runs 114 automated tests across all 3 pillars and governance layers
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend Server (runs on http://localhost:5001)
npm run server

# Terminal 2: Frontend Client (runs on http://localhost:3000)
npm run dev
```

### 5. Production Build
```bash
npm run build
# Compiles optimized client bundle into dist/ with code-splitting
```

---

## 📁 Project Architecture

```
interview-ai/
├── api/                       # Vercel serverless entry point
├── dist/                      # Production client build
├── src/
│   ├── components/
│   │   ├── AnswerEvaluationCard.jsx  # Rubric scoring & evaluation display
│   │   ├── AuthModal.jsx             # User authentication modal
│   │   ├── CodeSandbox.jsx           # In-browser DSA code runner
│   │   ├── CompanyDefenseMode.jsx    # Company-specific interview styles
│   │   ├── Dashboard.jsx             # Primary analytics & performance dashboard
│   │   ├── GitHubVerifier.jsx        # GitHub repository & claim verification
│   │   ├── Header.jsx                # Navigation header
│   │   ├── IntelligenceDashboard.jsx # 6-axis radar & training loop
│   │   ├── InterviewPanel.jsx        # Adaptive interview arena
│   │   ├── JDParserView.jsx          # Job description parser & matcher
│   │   ├── LeaderboardView.jsx       # Ranked global candidate benchmarks
│   │   ├── NotionExport.jsx          # Study plan export templates
│   │   ├── RedactionViewer.jsx       # PII redaction audit view
│   │   ├── ResumeDefenseView.jsx     # Resume cross-examination simulator
│   │   ├── ResumeUploader.jsx        # PDF / text resume ingestion
│   │   ├── SessionReplay.jsx         # Historical session replay
│   │   ├── Settings.jsx              # Application settings
│   │   ├── Sidebar.jsx               # Navigation drawer
│   │   ├── SkillParserView.jsx       # Skill gap matrix
│   │   ├── StreakTracker.jsx         # Daily practice streak & XP badges
│   │   └── VoiceInterviewMode.jsx    # Voice interview mode with filler detection
│   ├── data/                         # Company role presets & study materials
│   ├── db/
│   │   ├── models/                   # Mongoose Session & UserProgress models
│   │   └── mongo.js                  # Database connection & connection state
│   ├── middleware/                   # IP-based rate limiter middleware
│   ├── routes/                       # Express API routes
│   └── services/                     # Business logic, LLM, redaction, defense & voice
├── test/
│   └── suite.test.js                 # 114 automated test cases
├── vercel.json                       # Vercel deployment & rewrite config
└── vite.config.js                    # Vite bundler & manual chunk splitting
```

---

## 📜 License
MIT
