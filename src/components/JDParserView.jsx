import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building,
  Clock,
  Globe,
  Tag,
  Target,
  PlayCircle,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import {
  parseJobDescription,
  matchResumeToJD,
  generateJDQuestions
} from '../services/jdParserService.js';

const SAMPLE_JDS = [
  {
    label: 'Senior Full Stack @ TechCorp',
    text: `Job Title: Senior Full Stack Engineer
Company: TechCorp
Location: San Francisco, CA (Hybrid: 2 days in office)
Experience: 5+ years of full-stack engineering experience

About the Role:
We are looking for a Senior Full Stack Engineer to lead the architecture and development of our customer analytics platform. You will design scalable microservices and build responsive frontend web applications.

Responsibilities:
- Architect and develop high-throughput APIs using Node.js, Express, and TypeScript.
- Build clean, accessible, and performant user interfaces using React, Next.js, and Tailwind CSS.
- Optimize complex database queries and schema designs with PostgreSQL and Redis caching.
- Deploy and monitor distributed services on AWS (ECS, Lambda, S3, CloudFront) using Terraform and GitHub Actions.
- Mentor junior engineers and champion clean code, TDD, and agile methodologies.

Required Qualifications:
- 5+ years building production full-stack web applications.
- Strong proficiency in TypeScript, React, Node.js, and modern JavaScript (ES6+).
- Experience with relational databases like PostgreSQL and in-memory caches like Redis.
- Solid understanding of REST APIs, GraphQL, and microservice architecture.
- Hands-on experience with Docker and AWS cloud infrastructure.

Preferred Qualifications:
- Experience with Kafka or RabbitMQ event streaming.
- Knowledge of system design for applications serving 1M+ active users.
- Familiarity with CI/CD automation and Jest/Playwright unit testing.`
  },
  {
    label: 'Backend Engineer @ DistributedCloud',
    text: `Job Title: Backend Systems Engineer
Company: DistributedCloud
Location: 100% Remote (US/Canada)
Experience: 3-5 years backend development

We are seeking a Backend Engineer to scale our distributed cloud storage layer.

Requirements:
- 3+ years experience with Go, Python, or Node.js in backend production environments.
- Deep expertise in SQL and NoSQL databases (PostgreSQL, MongoDB, DynamoDB).
- Hands-on experience with Kubernetes, Docker, and cloud deployments on GCP or AWS.
- Strong knowledge of concurrency, caching patterns, and API security (OAuth, JWT).`
  }
];

export default function JDParserView({
  resumeSkills = [],
  onStartInterview,
  onNavigate
}) {
  const [jdText, setJdText] = useState('');
  const [parsedJD, setParsedJD] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleParse = (textToParse = jdText) => {
    if (!textToParse.trim()) return;
    const parsed = parseJobDescription(textToParse);
    setParsedJD(parsed);

    if (resumeSkills && resumeSkills.length > 0) {
      const match = matchResumeToJD(resumeSkills, parsed);
      setMatchResult(match);
    } else {
      setMatchResult(null);
    }

    setGeneratedQuestions([]);
  };

  const handleLoadSample = (sample) => {
    setJdText(sample.text);
    handleParse(sample.text);
  };

  const handleGenerateQuestions = () => {
    if (!parsedJD) return;
    setIsGeneratingQuestions(true);
    setTimeout(() => {
      const qs = generateJDQuestions(parsedJD, 8);
      setGeneratedQuestions(qs);
      setIsGeneratingQuestions(false);
    }, 400);
  };

  const handleCopyQuestions = () => {
    if (generatedQuestions.length === 0) return;
    const text = generatedQuestions
      .map((q, i) => `${i + 1}. [${q.category} - ${q.difficulty}] ${q.question}\n   Reason: ${q.reason}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <FileSearch className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Job Description Intelligence</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Paste any job post to extract required skills, predict interview focus, and benchmark your match.
            </p>
          </div>

          {/* Sample quick picks */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Try Sample:</span>
            {SAMPLE_JDS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(sample)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Job Description Text
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste full job description here (Role, responsibilities, requirements, technical stack)..."
            rows={7}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition font-sans leading-relaxed"
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-500">
              {jdText.length > 0 ? `${jdText.split(/\s+/).filter(Boolean).length} words entered` : 'Ready for input'}
            </span>
            <button
              onClick={() => handleParse()}
              disabled={!jdText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Job Description
            </button>
          </div>
        </div>

        {/* Parsed Result Display */}
        {parsedJD && (
          <div className="space-y-6">
            {/* Role Header Banner */}
            <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                    {parsedJD.role}
                  </h2>
                  <span className="text-slate-400 text-sm flex items-center gap-1">
                    <Building className="w-4 h-4 text-slate-500" />
                    {parsedJD.company}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold capitalize flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {parsedJD.experienceLevel} Level
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold capitalize flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {parsedJD.remotePolicy}
                  </span>
                  {parsedJD.salaryRange && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold font-mono">
                      {parsedJD.salaryRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Action: Launch Interview */}
              {onStartInterview && (
                <button
                  onClick={() => onStartInterview(parsedJD, generatedQuestions)}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 shrink-0"
                >
                  <PlayCircle className="w-4 h-4" />
                  Practice Interview for this Role →
                </button>
              )}
            </div>

            {/* Resume Match Benchmark */}
            {matchResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold font-mono text-indigo-400">
                        {matchResult.matchScore}%
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Your Resume Match Score</h3>
                      <p className="text-xs text-slate-400">
                        Compared your {resumeSkills.length} parsed skills against {parsedJD.requiredSkills.length} required JD skills
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    matchResult.matchScore >= 75
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : matchResult.matchScore >= 50
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {matchResult.matchScore >= 75 ? 'Strong Match' : matchResult.matchScore >= 50 ? 'Moderate Match' : 'High Skill Gap'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched skills */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Matched Requirements ({matchResult.matched.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matched.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                          {skill}
                        </span>
                      ))}
                      {matchResult.matched.length === 0 && (
                        <span className="text-xs text-slate-500 italic">No exact overlaps detected</span>
                      )}
                    </div>
                  </div>

                  {/* Missing skills */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Identified Skill Gaps ({matchResult.missing.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missing.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
                          {skill}
                        </span>
                      ))}
                      {matchResult.missing.length === 0 && (
                        <span className="text-xs text-emerald-400 italic">All required skills matched!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {matchResult.suggestions && matchResult.suggestions.length > 0 && (
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-indigo-300">Actionable Preparation Advice:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {matchResult.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Skills & Interview Focus 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Required & Preferred Skills */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-400" />
                  Extracted Technical Stack
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="block text-slate-400 font-semibold mb-1.5">
                      Core Required Skills ({parsedJD.requiredSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedJD.requiredSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-indigo-300 font-mono text-xs font-medium">
                          {s}
                        </span>
                      ))}
                      {parsedJD.requiredSkills.length === 0 && (
                        <span className="text-slate-500 italic">No specific tech requirements detected</span>
                      )}
                    </div>
                  </div>

                  {parsedJD.preferredSkills && parsedJD.preferredSkills.length > 0 && (
                    <div>
                      <span className="block text-slate-400 font-semibold mb-1.5">
                        Preferred / Nice-to-Have Skills ({parsedJD.preferredSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedJD.preferredSkills.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-purple-950/60 border border-purple-500/30 rounded-lg text-purple-300 font-mono text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Predicted Interview Focus */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Predicted Interview Focus Areas
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on keyword frequency and technical seniority, this interviewer will likely concentrate on:
                </p>

                <div className="space-y-2">
                  {parsedJD.interviewFocus.map((focus, i) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{focus}</span>
                      <span className="text-[11px] text-indigo-400 font-mono">Priority Area #{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* JD-Generated Questions Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Targeted Interview Questions for this JD
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synthesized questions specifically designed to test competencies required by this job description
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {generatedQuestions.length > 0 && (
                    <button
                      onClick={handleCopyQuestions}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy All'}
                    </button>
                  )}
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingQuestions}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                  >
                    {isGeneratingQuestions ? 'Generating Questions...' : 'Generate JD Questions'}
                  </button>
                </div>
              </div>

              {generatedQuestions.length > 0 && (
                <div className="space-y-3">
                  {generatedQuestions.map((q, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold font-mono">
                          {q.category} · {q.difficulty}
                        </span>
                        <span className="text-[11px] text-slate-500">Question {i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-100 font-medium leading-relaxed">
                        {q.question}
                      </p>
                      {q.reason && (
                        <p className="text-xs text-slate-400 italic">
                          Target intent: {q.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
