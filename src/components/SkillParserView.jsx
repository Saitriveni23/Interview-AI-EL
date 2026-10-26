import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  FileSearch,
  ShieldCheck
} from 'lucide-react';

export default function SkillParserView({
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

  // Study-plan preferences
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(10);
  const [studyWeeks, setStudyWeeks] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState('');

  // Clear previously generated plans when a new resume is processed.
  useEffect(() => {
    setGeneratedPlan(null);
    setStudyWeeks('');
    setPlanError('');
  }, [studyPlan]);

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
          weeklyStudyHours
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

  if (!candidateProfile || !deltaAnalysis) return null;

  return (
    <div className="space-y-6">

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
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono"
                    >
                      {skill}
                    </span>
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

{/* ================= WEEKLY ROADMAP ================= */}

          {/* ================= WEEKLY ROADMAP ================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(displayedPlan?.recommendedModules || []).map((module, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    {module.week}
                  </span>

                  <span className="text-xs text-slate-400">
                    {module.estimatedHours} hrs/week
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">
                  {module.topic}
                </h4>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(module.focusAreas || []).map((area, areaIndex) => (
                    <li
                      key={areaIndex}
                      className="flex items-start gap-2"
                    >
                      <span className="text-indigo-400 mt-0.5">
                        •
                      </span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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