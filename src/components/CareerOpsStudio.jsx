import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  Send,
  FileText,
  UserCheck,
  Mail,
  Copy,
  Check,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Building,
  ExternalLink,
  Target,
  Zap,
  Award
} from 'lucide-react';
import {
  evaluateJobOffer,
  generateTailoredCV,
  generateCoverLetter,
  generateOutreachNotes,
  diagnoseFunnelGaps
} from '../services/careerOpsService.js';

const SAMPLE_ROLES = [
  {
    label: 'Senior Full Stack @ Stripe',
    text: `Company: Stripe
Role: Senior Full Stack Engineer (Payment Workflows)
Location: San Francisco, CA / Remote (US)
Compensation: $175,000 - $225,000 base + equity

About the Role:
We are looking for a Senior Full Stack Engineer to lead architecture for our high-reliability payment checkout experience.

Responsibilities:
- Architect and deploy reliable web services using TypeScript, React, and Node.js.
- Build low-latency microservices with PostgreSQL and Redis caching.
- Optimize distributed event streaming pipelines with Kafka.
- Champion code quality, unit testing, and automated CI/CD releases.

Qualifications:
- 5+ years of software engineering experience.
- Strong proficiency in modern TypeScript, React, and backend API design.
- Hands-on experience with relational databases and caching architectures.
- US work authorization required. Visa sponsorship available for qualified candidates.`
  },
  {
    label: 'Backend Lead @ Stealth AI (No Sponsorship)',
    text: `Company: Stealth AI Labs
Role: Backend Infrastructure Lead
Compensation: $160,000 - $190,000
Requirements:
- 6+ years building distributed Go/Python services.
- US Citizens or Green Card holders only. No visa sponsorship provided.
- Must have active Secret Clearance or eligibility.`
  }
];

export default function CareerOpsStudio({ candidateCV = '', onStartInterview }) {
  const [jobInput, setJobInput] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [overrideSkip, setOverrideSkip] = useState(false);
  const [activeTab, setActiveTab] = useState('eval'); // 'eval' | 'cv' | 'cover' | 'contacto' | 'tracker'
  const [coverAngle, setCoverAngle] = useState('impact');
  const [copiedKey, setCopiedKey] = useState(null);

  // Application tracker state persisted locally
  const [trackerList, setTrackerList] = useState(() => {
    return [
      { id: 1, company: 'Stripe', role: 'Senior Full Stack', score: 4.6, status: 'Applied', date: '2 days ago' },
      { id: 2, company: 'Datadog', role: 'Distributed Systems Lead', score: 4.2, status: 'Interviewing', date: '4 days ago' },
      { id: 3, company: 'Legacy Corp', role: 'Senior Java Dev', score: 2.8, status: 'Skipped', date: '1 week ago' },
      { id: 4, company: 'FinTech Co', role: 'Backend Engineer', score: 3.1, status: 'Skipped', date: '1 week ago' },
    ];
  });

  const handleRunEvaluation = (textToEvaluate = jobInput) => {
    if (!textToEvaluate.trim()) return;
    const result = evaluateJobOffer({
      jobText: textToEvaluate,
      jobUrl,
      candidateCV: candidateCV || 'Senior Full Stack Engineer. TypeScript, React, Node.js, PostgreSQL, Redis, Docker, System Design, REST APIs, Git.'
    });
    setEvaluation(result);
    setOverrideSkip(false);
    setActiveTab('eval');
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tailoredCV = evaluation ? generateTailoredCV(candidateCV, evaluation) : null;
  const coverLetter = evaluation ? generateCoverLetter({
    candidateName: 'Triveni Reddy',
    company: 'Target Company',
    role: 'Senior Full Stack Engineer',
    angle: coverAngle
  }) : null;
  const outreach = generateOutreachNotes({
    candidateName: 'Triveni Reddy',
    role: 'Senior Full Stack Engineer',
    company: 'Stripe'
  });
  const gapDiagnosis = diagnoseFunnelGaps(trackerList);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">CareerOps Job Intelligence Pipeline</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              "Paste a job. It tells you whether that night is worth it." Evaluates fit, verifies liveness, drafts tailored CVs & notes. You decide.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Try Sample Role:</span>
            {SAMPLE_ROLES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => { setJobInput(sample.text); handleRunEvaluation(sample.text); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Paste Job Description or Requirements
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              Evaluates against your real CV · Zero data uploaded externally
            </span>
          </div>

          <textarea
            value={jobInput}
            onChange={(e) => setJobInput(e.target.value)}
            placeholder="Paste raw job description text here (role, responsibilities, technical stack, requirements, compensation)..."
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none transition leading-relaxed font-sans"
          />

          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-500">
              {jobInput.length > 0 ? `${jobInput.split(/\s+/).filter(Boolean).length} words entered` : 'Ready for job post input'}
            </span>
            <button
              onClick={() => handleRunEvaluation()}
              disabled={!jobInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Evaluate Role & Run Pipeline
            </button>
          </div>
        </div>

        {/* Evaluation & Output Arena */}
        {evaluation && (
          <div className="space-y-6">
            {/* Top Verdict Banner */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
              (evaluation.isWorthIt || overrideSkip)
                ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border-emerald-500/40'
                : 'bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900 border-rose-500/40'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-2xl font-black font-mono px-3 py-1 rounded-xl border ${
                    (evaluation.isWorthIt || overrideSkip)
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {evaluation.score} / 5.0
                  </span>
                  <span className="text-lg font-bold text-white">
                    {(evaluation.isWorthIt || overrideSkip) ? 'WORTH YOUR TIME — RECOMMEND APPLYING' : 'SKIP THIS ROLE — WEAK FIT'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {overrideSkip ? 'Candidate override applied. Proceeding with application drafting.' : evaluation.verdictReason}
                </p>
              </div>

              {!evaluation.isWorthIt && !overrideSkip && (
                <button
                  onClick={() => setOverrideSkip(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition whitespace-nowrap self-start md:self-auto"
                >
                  Override & Apply Anyway →
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
              {[
                { id: 'eval', label: '1. A-H Evaluation Matrix', icon: Award },
                { id: 'cv', label: '2. Tailored ATS CV', icon: FileText },
                { id: 'cover', label: '3. Cover Letter', icon: Mail },
                { id: 'contacto', label: '4. Who to Contact (Notes)', icon: UserCheck },
                { id: 'tracker', label: '5. Pipeline & Gap Diagnosis', icon: TrendingUp }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── TAB 1: A-H Matrix ── */}
            {activeTab === 'eval' && (
              <div className="space-y-4">
                {/* Liveness & Work Auth Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Block G: Liveness */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Block G: Posting Liveness Check
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">{evaluation.livenessStatus}</span>
                      <span className="text-[11px] text-slate-400">— {evaluation.livenessNotes}</span>
                    </div>
                  </div>

                  {/* Block C: Work-Auth */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Block C: Work-Auth & Visa Signal
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${evaluation.workAuthSignal.blocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {evaluation.workAuthSignal.blocked ? '⚠️ Blocker Detected' : '✓ No Disqualifiers'}
                      </span>
                      <span className="text-[11px] text-slate-400">— {evaluation.workAuthSignal.message}</span>
                    </div>
                  </div>
                </div>

                {/* Level Strategy & Comp Benchmark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-purple-400" /> Block D: Seniority Level Strategy
                    </span>
                    <span className="text-xs font-bold text-white block">{evaluation.level}</span>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Block E: Compensation Research
                    </span>
                    <span className="text-xs font-bold text-amber-300 font-mono block">{evaluation.compBenchmark}</span>
                  </div>
                </div>

                {/* Block A & B: Core Requirements with Weight Provenance */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Block A & B: Core Requirements with Weight Provenance
                  </h3>
                  <div className="space-y-2">
                    {evaluation.requirementsAnalysis.map((req, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2.5">
                          {req.matched ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <span className={`font-semibold ${req.matched ? 'text-slate-200' : 'text-slate-400'}`}>
                              {req.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Source: {req.provenanceLabel} ({req.weight} Priority)
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          req.matched ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                        }`}>
                          {req.matched ? 'CV Matched' : 'Skill Gap'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Block H: STAR+R Stories */}
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Block H: STAR+R Interview Prep Stories (Pre-Synthesized)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluation.starStories.map((story, i) => (
                      <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <span className="font-bold text-indigo-300 block">{story.requirement}</span>
                        <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                          <p><strong className="text-slate-400">Situation:</strong> {story.situation}</p>
                          <p><strong className="text-slate-400">Action:</strong> {story.action}</p>
                          <p><strong className="text-emerald-400">Result:</strong> {story.result}</p>
                          <p><strong className="text-purple-400">Reflection:</strong> {story.reflection}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: Tailored ATS CV ── */}
            {activeTab === 'cv' && tailoredCV && (
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">ATS-Tailored Resume Draft</h3>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {tailoredCV.verifiedFacts.provenanceStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(`${tailoredCV.headline}\n\n${tailoredCV.summary}\n\n${tailoredCV.tailoredBullets.join('\n')}`, 'cv')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                  >
                    {copiedKey === 'cv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cv' ? 'Copied CV' : 'Copy All'}</span>
                  </button>
                </div>

                <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 font-sans space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Tailored Headline</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{tailoredCV.headline}</h4>
                  </div>

                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Summary Statement</span>
                    <p className="text-slate-300 leading-relaxed mt-0.5">{tailoredCV.summary}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block mb-1.5">Keywords & Experience Bullets</span>
                    <ul className="space-y-2 text-slate-300 list-disc list-inside">
                      {tailoredCV.tailoredBullets.map((b, i) => (
                        <li key={i} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: Cover Letter ── */}
            {activeTab === 'cover' && coverLetter && (
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Angle:</span>
                    {['impact', 'technical', 'culture'].map(a => (
                      <button
                        key={a}
                        onClick={() => setCoverAngle(a)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                          coverAngle === a
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopy(coverLetter.content, 'cover')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                  >
                    {copiedKey === 'cover' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cover' ? 'Copied Letter' : 'Copy Letter'}</span>
                  </button>
                </div>

                <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs space-y-3 leading-relaxed whitespace-pre-line text-slate-200">
                  {coverLetter.content}
                </div>
              </div>
            )}

            {/* ── TAB 4: Who to Contact (contacto) ── */}
            {activeTab === 'contacto' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Human-in-the-Loop Guarantee:</strong> These outreach notes are drafts prepared for you to review, personalize, and send directly. CareerOps never auto-messages anyone.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Hiring Manager Note */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Hiring Manager Note</span>
                        <span className="text-[10px] text-slate-500 font-mono">{outreach.hiringManagerNote.length}/300 chars</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{outreach.hiringManagerNote}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(outreach.hiringManagerNote, 'hm')}
                      className="mt-2 w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      {copiedKey === 'hm' ? '✓ Copied' : 'Copy Note'}
                    </button>
                  </div>

                  {/* Recruiter Note */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Talent Recruiter Note</span>
                        <span className="text-[10px] text-slate-500 font-mono">{outreach.recruiterNote.length}/300 chars</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{outreach.recruiterNote}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(outreach.recruiterNote, 'rec')}
                      className="mt-2 w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      {copiedKey === 'rec' ? '✓ Copied' : 'Copy Note'}
                    </button>
                  </div>

                  {/* Peer Note */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Engineering Peer Note</span>
                        <span className="text-[10px] text-slate-500 font-mono">{outreach.peerEngineerNote.length}/300 chars</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{outreach.peerEngineerNote}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(outreach.peerEngineerNote, 'peer')}
                      className="mt-2 w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      {copiedKey === 'peer' ? '✓ Copied' : 'Copy Note'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 5: Tracker & Gap Diagnosis ── */}
            {activeTab === 'tracker' && (
              <div className="space-y-4">
                {/* Gap Diagnosis Banner */}
                <div className="p-5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    "After a Run of Noes, It Names the Gap" — AI Diagnosis
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {gapDiagnosis.recommendation}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gapDiagnosis.topGaps.map((gap, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
                        Target Gap: {gap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pipeline List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Application Funnel Tracker ({trackerList.length} Roles)
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">Skip Rate: {gapDiagnosis.skipRate}</span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Role & Company</th>
                        <th className="py-3 px-4 text-center">Score</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {trackerList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4">
                            <span className="text-slate-200 font-bold block">{item.role}</span>
                            <span className="text-[11px] text-slate-500 font-mono">@{item.company}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-indigo-400">
                            {item.score}/5.0
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.status === 'Applied' || item.status === 'Interviewing'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                            {item.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
