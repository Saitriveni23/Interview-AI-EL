import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  FileSearch,
  ShieldCheck,
  ExternalLink,
  Code,
  Terminal,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Download,
  Sparkles,
  Layers,
  HelpCircle,
  Check,
  PlayCircle,
  Building2,
  Briefcase,
  BarChart2,
  Table2,
  BookMarked
} from 'lucide-react';
import { getStudyMaterialForSkill, getStudyMaterialsForSkills } from '../data/studyMaterials.js';

// ── Circular progress ring ──
function RingProgress({ pct = 0, size = 96, stroke = 8, color = '#6366f1' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

// ── Map experience level → required proficiency label ──
function getRequiredLevel(experienceLevel) {
  if (!experienceLevel) return 'Intermediate';
  const l = experienceLevel.toLowerCase();
  if (l.includes('entry') || l.includes('0-1')) return 'Beginner';
  if (l.includes('junior') || l.includes('1-3')) return 'Intermediate';
  if (l.includes('mid') || l.includes('3-5')) return 'Intermediate+';
  if (l.includes('senior') || l.includes('5-8')) return 'Advanced';
  if (l.includes('staff') || l.includes('principal') || l.includes('8+')) return 'Expert';
  return 'Intermediate';
}

export default function SkillParserView({
  targetInfo,
  candidateProfile,
  deltaAnalysis,
  studyPlan,
  redactedResumeText
}) {
  // ── Outer tab: Skills Analysis | Gap Analysis | Documentation Plan ──
  const [mainTab, setMainTab] = useState('analysis'); // 'analysis' | 'gaps' | 'plan'

  // Layer 2 factuality verification
  const [claimText, setClaimText] = useState(
    'Candidate led a team of 4 frontend engineers and optimized PostgreSQL queries.'
  );
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Study-plan preferences & interactive material states
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(10);
  const [studyWeeks, setStudyWeeks] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState('');
  const [openMaterials, setOpenMaterials] = useState({ 0: true });
  const [activeStudyTab, setActiveStudyTab] = useState('roadmap'); // 'roadmap' | 'library'
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('interview-ai-completed-tasks');
      return saved ? JSON.parse(saved) : {};
    } catch (_) { return {}; }
  });
  const [copiedSyllabus, setCopiedSyllabus] = useState(false);

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const toggleMaterials = (idx) => {
    setOpenMaterials((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Clear previously generated plans when a new resume is processed.
  useEffect(() => {
    setGeneratedPlan(null);
    setStudyWeeks('');
    setPlanError('');
  }, [studyPlan]);

  // Persist completed lab tasks to localStorage so progress survives page refreshes.
  useEffect(() => {
    try {
      localStorage.setItem('interview-ai-completed-tasks', JSON.stringify(completedTasks));
    } catch (_) {}
  }, [completedTasks]);

  // Save session snapshot to localStorage for "Resume Previous Session" banner.
  useEffect(() => {
    if (candidateProfile && deltaAnalysis) {
      try {
        localStorage.setItem('interview-ai-session', JSON.stringify({
          savedAt: new Date().toISOString(),
          targetInfo,
          candidateProfile,
          deltaAnalysis,
          studyPlan
        }));
      } catch (_) {}
    }
  }, [candidateProfile, deltaAnalysis, studyPlan, targetInfo]);

  const SKILL_HOURS = {
  Python: 35,
  JavaScript: 30,
  TypeScript: 25,
  React: 30,
  'Node.js': 30,
  'Express.js': 20,
  Django: 35,
  Prisma: 20,
  Docker: 20,
  AWS: 40,
  LLMs: 40,
  'Machine Learning': 60,
  'Deep Learning': 70,
  'System Design': 45,
  Cybersecurity: 50,
  SQL: 25
};

// Calculate estimated hours from identified missing skills.
const estimatedLearningHours = (deltaAnalysis?.missingSkills || [])
  .reduce(
    (total, skill) => total + (SKILL_HOURS[skill] || 25),
    0
  );

// Calculate minimum recommended weeks.
const minimumStudyWeeks =
  estimatedLearningHours > 0
    ? Math.ceil(estimatedLearningHours / weeklyStudyHours)
    : 1;

  const selectedStudyWeeks = Math.max(
    Number(studyWeeks) || minimumStudyWeeks,
    minimumStudyWeeks
  );

  const displayedPlan = generatedPlan || studyPlan;

  const effectiveCompany =
    targetInfo?.company ||
    displayedPlan?.targetCompany ||
    deltaAnalysis?.targetCompany ||
    'Target Company';

  const effectiveRole =
    targetInfo?.role ||
    displayedPlan?.targetRole ||
    deltaAnalysis?.targetRole ||
    candidateProfile?.domainCategory ||
    'Software Engineer';

  const effectiveLevel =
    targetInfo?.experienceLevel ||
    displayedPlan?.experienceLevel ||
    deltaAnalysis?.experienceLevel ||
    '';

  const handleVerifyClaim = async (e) => {
    e.preventDefault();

    if (!claimText.trim()) return;

    setIsVerifying(true);

    try {
      const res = await fetch('/api/resume/verify-factuality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: claimText,
          redactedResumeText
        })
      });

      const data = await res.json();

      if (data.success) {
        setVerificationResult(data.verification);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!candidateProfile || !deltaAnalysis) return;

    setIsGeneratingPlan(true);
    setPlanError('');

    try {
      const response = await fetch('/api/resume/generate-study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateProfile,
          deltaAnalysis,
          preferredStudyWeeks: selectedStudyWeeks,
          weeklyStudyHours,
          targetInfo: {
            company: effectiveCompany,
            role: effectiveRole,
            experienceLevel: effectiveLevel
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.studyPlan) {
        throw new Error(
          data.error || 'Unable to generate the study plan.'
        );
      }

      setGeneratedPlan(data.studyPlan);
    } catch (error) {
      console.error('Study plan generation failed:', error);
      setPlanError(error.message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleExportSyllabus = () => {
    const modules = displayedPlan?.recommendedModules || [];
    let md = `# ${displayedPlan?.title || 'Personalized Technical Study Plan'}\n\n`;
    md += `**Target Match Score:** ${displayedPlan?.targetMatchScore || 'N/A'}\n`;
    md += `**Total Estimated Effort:** ${estimatedLearningHours} Hours across ${selectedStudyWeeks} Weeks\n`;
    md += `**Exported At:** ${new Date().toLocaleDateString()}\n\n`;
    md += `## Overview & Objectives\n${displayedPlan?.summary || ''}\n\n`;
    md += `## Weekly Roadmap & Curated Study Materials\n\n`;

    modules.forEach((mod) => {
      const material = mod.studyMaterial || getStudyMaterialForSkill(mod.topic);
      md += `### ${mod.week}: ${mod.topic} (${mod.estimatedHours} hrs/week)\n\n`;
      md += `#### Key Focus Areas\n`;
      (mod.focusAreas || []).forEach((fa) => {
        md += `- ${fa}\n`;
      });
      md += `\n`;

      if (material) {
        if (material.documentation?.length) {
          md += `#### Official Documentation & Guides\n`;
          material.documentation.forEach((doc) => {
            md += `- [${doc.title}](${doc.url}) — *${doc.type}*: ${doc.description}\n`;
          });
          md += `\n`;
        }

        if (material.tutorials?.length) {
          md += `#### Recommended Free Tutorials\n`;
          material.tutorials.forEach((tut) => {
            md += `- [${tut.title} (${tut.platform})](${tut.url}) — *${tut.format}* (${tut.duration})\n`;
          });
          md += `\n`;
        }

        if (material.cheatsheet?.tips?.length) {
          md += `#### Syntax & Architecture Cheatsheet\n`;
          material.cheatsheet.tips.forEach((tip) => {
            md += `- ${tip.replace(/`/g, '')}\n`;
          });
          md += `\n`;
        }

        if (material.handsOnLab?.tasks?.length) {
          md += `#### Hands-On Lab Tasks\n`;
          material.handsOnLab.tasks.forEach((t) => {
            md += `- [ ] ${t}\n`;
          });
          md += `\n`;
        }

        if (material.interviewQuestions?.length) {
          md += `#### Core Technical Interview Questions\n`;
          material.interviewQuestions.forEach((q) => {
            md += `- Q: ${q}\n`;
          });
          md += `\n`;
        }
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview_AI_Study_Roadmap_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCopiedSyllabus(true);
    setTimeout(() => setCopiedSyllabus(false), 3000);
  };

  const displayedSkillMaterials =
    displayedPlan?.skillMaterials ||
    getStudyMaterialsForSkills(deltaAnalysis?.missingSkills || []);

  if (!candidateProfile || !deltaAnalysis) return null;

  const matchPct = deltaAnalysis.matchPercentage ?? 0;
  const requiredLevel = getRequiredLevel(effectiveLevel);
  const allRequiredSkills = deltaAnalysis.requiredSkills || [
    ...(deltaAnalysis.matchingSkills || []),
    ...(deltaAnalysis.missingSkills || [])
  ];
  const matchingSet = new Set(deltaAnalysis.matchingSkills || []);

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════════════════
           OUTER TAB BAR: Skills Analysis | Gap Analysis | Documentation Plan
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 px-4 pt-4 gap-1">
          {[
            { id: 'analysis', label: 'Skills Analysis', icon: Award },
            { id: 'gaps',     label: 'Gap Analysis',    icon: BarChart2 },
            { id: 'plan',     label: 'Documentation Plan', icon: BookMarked }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMainTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition -mb-px ${
                mainTab === id
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ─────── TAB: Skills Analysis ─────── */}
        {mainTab === 'analysis' && (
          <div className="p-6 space-y-6">

            {/* Top: Circular score + company banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

              {/* Circular progress */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <RingProgress
                    pct={matchPct}
                    size={100}
                    stroke={9}
                    color={matchPct >= 70 ? '#10b981' : matchPct >= 40 ? '#6366f1' : '#f59e0b'}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold font-mono ${
                      matchPct >= 70 ? 'text-emerald-400' : matchPct >= 40 ? 'text-indigo-400' : 'text-amber-400'
                    }`}>
                      {matchPct}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center">
                  Overall<br />Match
                </span>
              </div>

              {/* Company / Role info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Target Interview Evaluation
                  </span>
                  {effectiveLevel && (
                    <span className="text-[10px] text-slate-500 font-mono">• {effectiveLevel}</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {effectiveRole} <span className="text-indigo-400 font-normal">at</span> {effectiveCompany}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Resume benchmarked against {effectiveCompany}'s hiring requirements for {effectiveRole}.
                </p>

                {/* Mini progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Current: <strong className="text-emerald-400">{matchPct}%</strong></span>
                    <span>Target: <strong className="text-indigo-300">95%</strong></span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-indigo-500/20 rounded-full" style={{ width: '95%' }} />
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(matchPct, 100)}%` }}
                    />
                  </div>
                  {matchPct < 95 && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      {95 - matchPct}% gap — your study plan will bridge this.
                    </p>
                  )}
                </div>
              </div>

              {/* Stats chips */}
              <div className="flex md:flex-col gap-3 flex-shrink-0">
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Skill Gaps</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {deltaAnalysis.missingSkills?.length || 0}
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Matched</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {deltaAnalysis.matchingSkills?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Breakdown — horizontal bars per required skill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Candidate skills */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  Your Skills ({candidateProfile.skills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(candidateProfile.skills || []).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>Est. Experience:</span>
                  <span className="font-bold text-white">
                    {candidateProfile.estimatedExperienceYears != null
                      ? `${candidateProfile.estimatedExperienceYears}+ Years`
                      : 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Skills breakdown bars */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                  Skills Breakdown
                </h4>
                <div className="space-y-2.5">
                  {allRequiredSkills.slice(0, 6).map((skill) => {
                    const has = matchingSet.has(skill);
                    const pct = has ? 85 : 15;
                    return (
                      <div key={skill}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300">{skill}</span>
                          <span className={`text-[10px] font-semibold ${has ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {has ? 'Proficient' : 'Gap'}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${has ? 'bg-emerald-500' : 'bg-amber-500/60'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Match / Gap badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Matching Requirements ({deltaAnalysis.matchingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(deltaAnalysis.matchingSkills || []).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Identified Skill Gaps ({deltaAnalysis.missingSkills?.length || 0})
                </span>
                {(deltaAnalysis.missingSkills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {deltaAnalysis.missingSkills.map((skill, i) => (
                      <button
                        key={i}
                        type="button"
                        title={`View ${skill} study materials`}
                        onClick={() => {
                          setMainTab('plan');
                          setTimeout(() => {
                            setActiveStudyTab('library');
                            const id = `skill-card-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 80);
                        }}
                        className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono cursor-pointer hover:bg-amber-900/60 hover:border-amber-400/60 transition"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No missing technical requirements detected!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────── TAB: Gap Analysis (Delta Table) ─────── */}
        {mainTab === 'gaps' && (
          <div className="p-6 space-y-5">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-indigo-400" />
                  Job Match Delta Analysis
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every required skill for {effectiveRole} at {effectiveCompany} — your current level vs what's expected.
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                matchPct >= 70
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {matchPct}% Match Score
              </span>
            </div>

            {/* Delta Table */}
            <div className="overflow-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Skill</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Level</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Level</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Study Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequiredSkills.length > 0 ? allRequiredSkills.map((skill, i) => {
                    const has = matchingSet.has(skill);
                    const mat = getStudyMaterialForSkill(skill);
                    return (
                      <tr key={i} className={`border-b border-slate-800 ${has ? '' : 'bg-amber-950/10'}`}>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-white text-xs">{skill}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-mono ${has ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {has ? 'Proficient' : 'Not Present'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-slate-400 font-mono">{requiredLevel}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {has ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Gap
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {!has ? (
                            <button
                              type="button"
                              onClick={() => {
                                setMainTab('plan');
                                setTimeout(() => {
                                  setActiveStudyTab('library');
                                  const id = `skill-card-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 80);
                              }}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline-offset-2 hover:underline transition"
                            >
                              Start Learning →
                            </button>
                          ) : mat ? (
                            <button
                              type="button"
                              onClick={() => {
                                setMainTab('plan');
                                setTimeout(() => {
                                  setActiveStudyTab('library');
                                  const id = `skill-card-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 80);
                              }}
                              className="text-[11px] text-slate-500 hover:text-indigo-400 font-semibold transition"
                            >
                              View Resources →
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">
                        No required skills data available. Add a job description to the resume upload step.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary row */}
            {allRequiredSkills.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">{deltaAnalysis.matchingSkills?.length || 0} skills matched</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-500/20 rounded-lg px-3 py-2 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-semibold">{deltaAnalysis.missingSkills?.length || 0} gaps to bridge</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMainTab('plan')}
                  className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-lg px-3 py-2 text-xs text-indigo-300 font-semibold transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  View Full Study Plan →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────── TAB: Documentation Plan ─────── */}
        {mainTab === 'plan' && (
          <div className="p-6 space-y-6">

            {/* Plan heading */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Personalized Up-Skilling & Preparation Study Plan
                </h3>
                <p className="text-xs text-slate-400 mt-1">{displayedPlan?.summary}</p>
              </div>
              {displayedPlan?.targetMatchScore && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-300 flex-shrink-0">
                  {displayedPlan.targetMatchScore}
                </span>
              )}
            </div>

            {/* Duration selector */}
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-5">
              <h4 className="text-sm font-bold text-indigo-300">Customize Your Preparation Duration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Available Study Hours Per Week
                  </label>
                  <select
                    value={weeklyStudyHours}
                    onChange={(e) => { setWeeklyStudyHours(Number(e.target.value)); setStudyWeeks(''); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white"
                  >
                    {[5, 10, 15, 20, 25, 30].map(h => (
                      <option key={h} value={h}>{h} Hours / Week</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Preparation Duration
                  </label>
                  <select
                    value={selectedStudyWeeks}
                    onChange={(e) => setStudyWeeks(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white"
                  >
                    {Array.from({ length: Math.max(0, 52 - minimumStudyWeeks + 1) }, (_, i) => {
                      const w = minimumStudyWeeks + i;
                      return <option key={w} value={w}>{w} Weeks</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-4 text-xs space-y-1.5">
                <p className="text-slate-300">
                  Estimated Learning Effort: <strong className="text-white ml-1">{estimatedLearningHours} Hours</strong>
                </p>
                <p className="text-emerald-400 font-semibold">
                  Minimum Recommended Duration: {minimumStudyWeeks} Weeks
                </p>
                <p className="text-slate-400">
                  Calculated from your missing skills and available weekly hours. You can extend this.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isGeneratingPlan}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition"
                >
                  {isGeneratingPlan ? 'Generating Study Plan...' : 'Generate Personalized Study Plan'}
                </button>

                {displayedPlan && (
                  <button
                    type="button"
                    onClick={handleExportSyllabus}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition border border-slate-700"
                  >
                    {copiedSyllabus ? (
                      <><Check className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Exported!</span></>
                    ) : (
                      <><Download className="w-4 h-4 text-indigo-400" /><span>Export Study Guide (.md)</span></>
                    )}
                  </button>
                )}
              </div>

              {planError && <p className="text-sm text-red-400">{planError}</p>}
            </div>

            {/* Fallback warning */}
            {displayedPlan?.isFallback && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-semibold">⚠️ AI Study Plan Temporarily Unavailable</p>
                <p className="text-amber-200/80 text-xs mt-2">
                  A fallback plan has been provided. Add a Gemini API key and try generating again for a personalised roadmap.
                </p>
              </div>
            )}

            {/* Inner tabs: Weekly Roadmap | Curated Hub */}
            {displayedPlan && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveStudyTab('roadmap')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        activeStudyTab === 'roadmap'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Weekly Roadmap View
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStudyTab('library')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        activeStudyTab === 'library'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Curated Material Hub ({displayedSkillMaterials.length})
                    </button>
                  </div>
                </div>

                {/* ── Weekly Roadmap ── */}
                {activeStudyTab === 'roadmap' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(displayedPlan?.recommendedModules || []).map((module, idx) => {
                      const material =
                        module.studyMaterial ||
                        getStudyMaterialForSkill(module.topic) ||
                        (deltaAnalysis?.missingSkills &&
                          getStudyMaterialForSkill(
                            deltaAnalysis.missingSkills[idx % deltaAnalysis.missingSkills.length]
                          ));
                      const isOpen = !!openMaterials[idx];
                      return (
                        <div key={idx} className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                                {module.week}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">{module.estimatedHours} hrs/week</span>
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white">{module.topic}</h4>
                              {material?.overview && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{material.overview}</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Weekly Focus Objectives:
                              </span>
                              <ul className="space-y-1.5 text-xs text-slate-300">
                                {(module.focusAreas || []).map((area, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span>{area}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {material && (
                            <div className="pt-3 border-t border-slate-800/80 space-y-3">
                              <button
                                type="button"
                                onClick={() => toggleMaterials(idx)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                  Study Materials & Practice Lab
                                </span>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
                              </button>

                              {isOpen && (
                                <div className="space-y-3 pt-1 text-xs">
                                  {/* Docs & Tutorials */}
                                  <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                      <BookOpen className="w-3 h-3 text-indigo-400" />
                                      Verified Documentation & Courses:
                                    </span>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {(material.documentation || []).map((doc, dIdx) => (
                                        <a key={dIdx} href={doc.url} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/70 transition group text-slate-300"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-semibold text-slate-200 group-hover:text-indigo-300">{doc.title}</span>
                                            <span className="text-[10px] text-slate-400">{doc.type} — {doc.description}</span>
                                          </div>
                                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                                        </a>
                                      ))}
                                      {(material.tutorials || []).map((tut, tIdx) => (
                                        <a key={tIdx} href={tut.url} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/70 transition group text-slate-300"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-semibold text-slate-200 group-hover:text-indigo-300">{tut.title}</span>
                                            <span className="text-[10px] text-emerald-400">{tut.platform} • {tut.format} ({tut.duration})</span>
                                          </div>
                                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Cheatsheet */}
                                  {material.cheatsheet?.tips?.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Terminal className="w-3 h-3 text-cyan-400" />
                                        Essential Commands & Patterns:
                                      </span>
                                      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] space-y-1 text-slate-300">
                                        {material.cheatsheet.tips.slice(0, 3).map((tip, tipIdx) => (
                                          <div key={tipIdx} className="leading-relaxed">{tip}</div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Lab tasks */}
                                  {material.handsOnLab?.tasks?.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Code className="w-3 h-3 text-amber-400" />
                                        Hands-On Practice Checklist:
                                      </span>
                                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                                        <p className="text-[11px] font-semibold text-amber-300 mb-1">{material.handsOnLab.title}</p>
                                        {material.handsOnLab.tasks.map((task, taskIdx) => {
                                          const taskId = `${module.week}-task-${taskIdx}`;
                                          const isDone = !!completedTasks[taskId];
                                          return (
                                            <button key={taskIdx} type="button" onClick={() => toggleTask(taskId)}
                                              className="w-full flex items-start gap-2 text-left text-[11px] p-1 rounded hover:bg-slate-800/50 transition group"
                                            >
                                              {isDone
                                                ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                                : <Square className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 flex-shrink-0 mt-0.5" />}
                                              <span className={isDone ? 'line-through text-slate-500' : 'text-slate-300 group-hover:text-white'}>
                                                {task}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Curated Material Hub ── */}
                {activeStudyTab === 'library' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayedSkillMaterials.map((item, idx) => (
                      <div
                        key={idx}
                        id={`skill-card-${item.skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 scroll-mt-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-indigo-400" />
                              {item.skill}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 border border-indigo-500/30 text-indigo-300">
                            Curated Resource Guide
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{item.overview}</p>

                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Official Documentation:</span>
                          <div className="space-y-1.5">
                            {(item.documentation || []).map((doc, dIdx) => (
                              <a key={dIdx} href={doc.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-xs text-slate-200 transition group"
                              >
                                <div>
                                  <span className="font-semibold group-hover:text-indigo-300">{doc.title}</span>
                                  <span className="block text-[10px] text-slate-400">{doc.description}</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                              </a>
                            ))}
                          </div>
                        </div>

                        {item.tutorials?.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recommended Free Tutorials:</span>
                            <div className="space-y-1.5">
                              {item.tutorials.map((tut, tIdx) => (
                                <a key={tIdx} href={tut.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-xs text-slate-200 transition group"
                                >
                                  <div>
                                    <span className="font-semibold group-hover:text-indigo-300">{tut.title}</span>
                                    <span className="block text-[10px] text-emerald-400">{tut.platform} • {tut.format} ({tut.duration})</span>
                                  </div>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.cheatsheet?.tips?.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Terminal className="w-3 h-3 text-cyan-400" /> Essential Cheatsheet:
                            </span>
                            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-slate-300 space-y-1">
                              {item.cheatsheet.tips.map((tip, tipIdx) => (
                                <div key={tipIdx}>{tip}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.interviewQuestions?.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-indigo-400" /> Top Interview Questions:
                            </span>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {item.interviewQuestions.map((q, qIdx) => (
                                <li key={qIdx} className="flex items-start gap-1.5">
                                  <span className="text-indigo-400 font-bold">Q:</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* No plan yet prompt */}
            {!displayedPlan && (
              <div className="text-center py-10 text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Click "Generate Personalized Study Plan" above to create your roadmap.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Layer 2 Factuality Checker (always visible below) ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Layer 2 Governance System: Resume Hallucination & Factuality Checker
            </h3>
            <p className="text-xs text-slate-400">
              Checks whether candidate claims are supported by the uploaded resume.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyClaim} className="flex gap-3">
          <input
            type="text"
            value={claimText}
            onChange={(e) => setClaimText(e.target.value)}
            placeholder="Test a candidate claim or AI summary assertion..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
          />
          <button
            type="submit"
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow disabled:opacity-50 transition"
          >
            {isVerifying ? 'Verifying Claim...' : 'Verify Factuality'}
          </button>
        </form>

        {verificationResult && (
          <div className={`p-4 rounded-xl border ${
            verificationResult.isVerified
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          } text-xs flex justify-between items-center`}>
            <div>
              <p className="font-bold">{verificationResult.status} ({verificationResult.factualityScore}% Match Score)</p>
              <p className="mt-1">{verificationResult.note}</p>
            </div>
            <span className="font-bold text-sm px-3 py-1 rounded bg-slate-900 border border-slate-800">
              {verificationResult.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}