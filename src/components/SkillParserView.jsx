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
  Briefcase
} from 'lucide-react';
import { getStudyMaterialForSkill, getStudyMaterialsForSkills } from '../data/studyMaterials.js';

export default function SkillParserView({
  targetInfo,
  candidateProfile,
  deltaAnalysis,
  studyPlan,
  redactedResumeText
}) {
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

  return (
    <div className="space-y-6">

      {/* ================= TARGET ROLE & COMPANY BENCHMARK BANNER ================= */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Target Interview Evaluation
              </span>
              {effectiveLevel && (
                <span className="text-[10px] text-slate-400 font-mono">
                  • {effectiveLevel}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {effectiveRole} <span className="text-indigo-400 font-normal">at</span> {effectiveCompany}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate resume skills benchmarked against {effectiveCompany}'s technical hiring requirements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Role Fit Score</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {deltaAnalysis.matchPercentage != null ? `${deltaAnalysis.matchPercentage}%` : 'N/A'}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Skill Gaps</span>
            <span className="text-base font-bold text-amber-400 font-mono">
              {deltaAnalysis.missingSkills?.length || 0} Missing
            </span>
          </div>
        </div>
        </div>

        {/* Role Fit Progress Bar: current match → 95% target */}
        <div className="w-full pt-3 border-t border-indigo-500/20">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
            <span>Current Fit: <strong className="text-emerald-400">{deltaAnalysis.matchPercentage ?? 0}%</strong></span>
            <span>Hiring Target: <strong className="text-indigo-300">95%</strong></span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 relative overflow-hidden">
            {/* Target zone indicator */}
            <div className="absolute inset-y-0 left-0 bg-indigo-500/20 rounded-full" style={{ width: '95%' }} />
            {/* Actual score bar */}
            <div
              className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(deltaAnalysis.matchPercentage ?? 0, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            {deltaAnalysis.matchPercentage != null && deltaAnalysis.matchPercentage < 95
              ? `${95 - deltaAnalysis.matchPercentage}% gap remaining — your study plan will bridge this.`
              : 'You meet the target hiring threshold! Focus on depth and system design.'}
          </p>
        </div>
      </div>

      {/* ================= SKILL PROFILE ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Extracted Candidate Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Award className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Parsed Candidate Skills
                </h3>

                <p className="text-xs text-slate-400">
                  {candidateProfile.domainCategory}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(candidateProfile.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Est. Industry Experience:</span>

            <span className="font-bold text-white text-sm">
              {candidateProfile.estimatedExperienceYears != null
                ? `${candidateProfile.estimatedExperienceYears}+ Years`
                : 'Not specified'}
            </span>
          </div>
        </div>

        {/* ================= SKILL GAP ANALYSIS ================= */}

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-emerald-400" />
              Job Match & Skill Gap Delta Analysis
            </h3>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
              {deltaAnalysis.matchPercentage == null
                ? 'Match unavailable'
                : `${deltaAnalysis.matchPercentage}% Match Score`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

            {/* Matching Skills */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4" />
                Matching Requirements (
                {deltaAnalysis.matchingSkills?.length || 0})
              </span>

              <div className="flex flex-wrap gap-1.5">
                {(deltaAnalysis.matchingSkills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Identified Skill Gaps (
                {deltaAnalysis.missingSkills?.length || 0})
              </span>

              {(deltaAnalysis.missingSkills || []).length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {deltaAnalysis.missingSkills.map((skill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      title={`Click to view ${skill} study materials`}
                      onClick={() => {
                        setActiveStudyTab('library');
                        setTimeout(() => {
                          const id = `skill-card-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 80);
                      }}
                      className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono cursor-pointer hover:bg-amber-900/60 hover:border-amber-400/60 hover:text-amber-200 transition"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">
                  No missing technical requirements detected!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= STUDY PLAN ================= */}

      {studyPlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">

          {/* Heading */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Personalized Up-Skilling & Preparation Study Plan
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                {displayedPlan?.summary}
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-300">
              {displayedPlan?.targetMatchScore}
            </span>
          </div>

          {/* ================= DURATION SELECTOR ================= */}

          <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-5 space-y-5">

            <h4 className="text-base font-bold text-indigo-300">
              Customize Your Preparation Duration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Weekly Study Hours */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Available Study Hours Per Week
                </label>

                <select
                  value={weeklyStudyHours}
                  onChange={(e) => {
                    setWeeklyStudyHours(Number(e.target.value));
                    setStudyWeeks('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white"
                >
                  {[5, 10, 15, 20, 25, 30].map((hours) => (
                    <option key={hours} value={hours}>
                      {hours} Hours / Week
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Preparation Duration
                </label>

                <select
                  value={selectedStudyWeeks}
                  onChange={(e) => setStudyWeeks(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white"
                >
                  {Array.from(
                    { length: Math.max(0, 52 - minimumStudyWeeks + 1) },
                    (_, index) => {
                      const weeks = minimumStudyWeeks + index;

                      return (
                        <option key={weeks} value={weeks}>
                          {weeks} Weeks
                        </option>
                      );
                    }
                  )}
                </select>
              </div>
            </div>

            {/* Minimum Duration Information */}
            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-4 text-xs space-y-2">

              <p className="text-slate-300">
                Estimated Learning Effort:
                <strong className="text-white ml-2">
                  {estimatedLearningHours} Hours
                </strong>
              </p>

              <p className="text-emerald-400 font-semibold">
                Minimum Recommended Duration: {minimumStudyWeeks} Weeks
              </p>

              <p className="text-slate-400">
                The minimum duration is estimated using your missing
                skills and the number of hours you can study each week.
                You can select a longer duration if you prefer.
              </p>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition"
            >
              {isGeneratingPlan
                ? 'Generating Study Plan...'
                : 'Generate Personalized Study Plan'}
            </button>

            {planError && (
              <p className="text-sm text-red-400">
                {planError}
              </p>
            )}
          </div>

          {/* Gemini Availability Warning */}
{displayedPlan?.isFallback && (
  <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4">
    <p className="text-amber-300 text-sm font-semibold">
      ⚠️ AI Study Plan Temporarily Unavailable
    </p>

    <p className="text-amber-200/80 text-xs mt-2">
      Gemini could not generate a personalized roadmap right now.
      A basic study plan has been provided instead.
      Please try generating the plan again later.
    </p>
  </div>
)}

          {/* ================= VIEW SWITCHER & ACTION BAR ================= */}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
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
                <span>Weekly Roadmap View</span>
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
                <span>Curated Material Hub ({displayedSkillMaterials.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportSyllabus}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800"
              title="Export Markdown Study Guide"
            >
              {copiedSyllabus ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Roadmap Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export Study Guide (.md)</span>
                </>
              )}
            </button>
          </div>

          {/* ================= CONTENT TABS ================= */}

          {activeStudyTab === 'roadmap' ? (
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
                  <div
                    key={idx}
                    className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between transition hover:border-slate-700"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                          {module.week}
                        </span>

                        <span className="text-xs text-slate-400 font-mono">
                          {module.estimatedHours} hrs/week
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white">
                          {module.topic}
                        </h4>
                        {material?.overview && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {material.overview}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Weekly Focus Objectives:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {(module.focusAreas || []).map((area, areaIndex) => (
                            <li key={areaIndex} className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Collapsible Study Material & Lab practice */}
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
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-indigo-400" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="space-y-3 pt-1 text-xs">
                            {/* Documentation & Free Tutorials */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-indigo-400" />
                                Verified Documentation & Courses:
                              </span>
                              <div className="grid grid-cols-1 gap-1.5">
                                {(material.documentation || []).map((doc, dIdx) => (
                                  <a
                                    key={dIdx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/70 transition group text-slate-300"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-slate-200 group-hover:text-indigo-300">
                                        {doc.title}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {doc.type} — {doc.description}
                                      </span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                                  </a>
                                ))}
                                {(material.tutorials || []).map((tut, tIdx) => (
                                  <a
                                    key={tIdx}
                                    href={tut.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/70 transition group text-slate-300"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-slate-200 group-hover:text-indigo-300">
                                        {tut.title}
                                      </span>
                                      <span className="text-[10px] text-emerald-400">
                                        {tut.platform} • {tut.format} ({tut.duration})
                                      </span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                                  </a>
                                ))}
                              </div>
                            </div>

                            {/* Cheatsheet Tips */}
                            {material.cheatsheet?.tips?.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Terminal className="w-3 h-3 text-cyan-400" />
                                  Essential Commands & Patterns:
                                </span>
                                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] space-y-1 text-slate-300">
                                  {material.cheatsheet.tips.slice(0, 3).map((tip, tipIdx) => (
                                    <div key={tipIdx} className="leading-relaxed">
                                      {tip}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Interactive Hands-On Lab Tasks */}
                            {material.handsOnLab?.tasks?.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Code className="w-3 h-3 text-amber-400" />
                                  Hands-On Practice Checklist:
                                </span>
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                                  <p className="text-[11px] font-semibold text-amber-300 mb-1">
                                    {material.handsOnLab.title}
                                  </p>
                                  {material.handsOnLab.tasks.map((task, taskIdx) => {
                                    const taskId = `${module.week}-task-${taskIdx}`;
                                    const isDone = !!completedTasks[taskId];
                                    return (
                                      <button
                                        key={taskIdx}
                                        type="button"
                                        onClick={() => toggleTask(taskId)}
                                        className="w-full flex items-start gap-2 text-left text-[11px] p-1 rounded hover:bg-slate-800/50 transition group"
                                      >
                                        {isDone ? (
                                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                          <Square className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span
                                          className={
                                            isDone
                                              ? 'line-through text-slate-500'
                                              : 'text-slate-300 group-hover:text-white'
                                          }
                                        >
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
          ) : (
            /* ================= CURATED RESOURCE LIBRARY TAB ================= */
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
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.category}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 border border-indigo-500/30 text-indigo-300">
                      Curated Resource Guide
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.overview}
                  </p>

                  {/* Documentation links */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Official Documentation:
                    </span>
                    <div className="space-y-1.5">
                      {(item.documentation || []).map((doc, dIdx) => (
                        <a
                          key={dIdx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-xs text-slate-200 transition group"
                        >
                          <div>
                            <span className="font-semibold group-hover:text-indigo-300">
                              {doc.title}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {doc.description}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Tutorials */}
                  {item.tutorials?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Recommended Free Tutorials & Roadmaps:
                      </span>
                      <div className="space-y-1.5">
                        {item.tutorials.map((tut, tIdx) => (
                          <a
                            key={tIdx}
                            href={tut.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-xs text-slate-200 transition group"
                          >
                            <div>
                              <span className="font-semibold group-hover:text-indigo-300">
                                {tut.title}
                              </span>
                              <span className="block text-[10px] text-emerald-400">
                                {tut.platform} • {tut.format} ({tut.duration})
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cheatsheet */}
                  {item.cheatsheet?.tips?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-cyan-400" />
                        Essential Cheatsheet:
                      </span>
                      <div className="bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-slate-300 space-y-1">
                        {item.cheatsheet.tips.map((tip, tipIdx) => (
                          <div key={tipIdx}>{tip}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview questions */}
                  {item.interviewQuestions?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-indigo-400" />
                        Top Interview Questions:
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
        </div>
      )}

      {/* ================= LAYER 2 VERIFICATION ================= */}

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
              Checks whether candidate claims are supported by the
              uploaded resume. This is not independent proof of factual accuracy.
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
            {isVerifying
              ? 'Verifying Claim...'
              : 'Verify Factuality'}
          </button>
        </form>

        {verificationResult && (
          <div
            className={`p-4 rounded-xl border ${
              verificationResult.isVerified
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            } text-xs flex justify-between items-center`}
          >
            <div>
              <p className="font-bold">
                {verificationResult.status} (
                {verificationResult.factualityScore}% Match Score)
              </p>

              <p className="mt-1">
                {verificationResult.note}
              </p>
            </div>

            <span className="font-bold text-sm px-3 py-1 rounded bg-slate-900 border border-slate-800">
              {verificationResult.isVerified
                ? 'VERIFIED'
                : 'UNVERIFIED'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}