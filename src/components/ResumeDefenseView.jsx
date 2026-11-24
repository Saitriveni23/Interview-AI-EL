import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronRight,
  Flame,
  Award,
  Mic,
  MicOff,
  RotateCcw,
  GitBranch,
  Building2,
  FileDown
} from 'lucide-react';
import {
  extractResumeClaims,
  evaluateDefenseResponse,
  generateResumeDefenseReport
} from '../services/resumeDefenseService.js';
import GitHubVerifier from './GitHubVerifier.jsx';
import CompanyDefenseMode from './CompanyDefenseMode.jsx';
import { exportDefenseReportPDF } from '../services/pdfExportService.js';

export default function ResumeDefenseView({
  resumeText = '',
  redactedResumeText = '',
  targetInfo = {},
  onReportGenerated,
  onNavigateToIntelligence
}) {
  const resumeSource = resumeText || redactedResumeText || '';
  const [claims, setClaims] = useState(() => extractResumeClaims(resumeSource));
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState('');
  const [candidateDefense, setCandidateDefense] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [defenseHistory, setDefenseHistory] = useState([]);
  const [defenseReport, setDefenseReport] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('cross_exam'); // 'cross_exam' | 'github' | 'company'

  // Initialize selected claim
  useEffect(() => {
    if (claims.length > 0 && !selectedClaimId) {
      setSelectedClaimId(claims[0].id);
      setCurrentChallenge(claims[0].challenges[0] || 'Explain your direct technical ownership of this achievement.');
    }
  }, [claims, selectedClaimId]);

  // Update claim list if resume changes
  useEffect(() => {
    if (resumeSource) {
      const extracted = extractResumeClaims(resumeSource);
      setClaims(extracted);
      if (extracted.length > 0) {
        setSelectedClaimId(extracted[0].id);
        setCurrentChallenge(extracted[0].challenges[0]);
      }
    }
  }, [resumeSource]);

  const activeClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const handleSelectClaim = (claim) => {
    setSelectedClaimId(claim.id);
    setCurrentChallenge(claim.challenges[claim.currentChallengeIndex || 0] || claim.challenges[0]);
    setCandidateDefense('');
  };

  // Web Speech API Voice Dictation
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your response.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCandidateDefense(transcript.trim());
      };

      recognition.start();
    } catch (_) {
      setIsListening(false);
    }
  };

  const handleDefend = async (e) => {
    e?.preventDefault();
    if (!candidateDefense.trim() || !activeClaim) return;

    setIsEvaluating(true);
    try {
      const evaluation = await evaluateDefenseResponse({
        claim: activeClaim,
        challenge: currentChallenge,
        candidateResponse: candidateDefense,
        personality: 'strict'
      });

      const updatedClaim = {
        ...activeClaim,
        status: evaluation.status,
        evaluation
      };

      const updatedClaims = claims.map(c => c.id === activeClaim.id ? updatedClaim : c);
      setClaims(updatedClaims);

      const record = {
        claimId: activeClaim.id,
        claimText: activeClaim.rawText,
        challenge: currentChallenge,
        response: candidateDefense,
        evaluation,
        timestamp: new Date().toISOString()
      };

      const newHistory = [record, ...defenseHistory];
      setDefenseHistory(newHistory);

      // Auto update report
      const evaluatedClaims = updatedClaims.filter(c => c.evaluation);
      const rep = generateResumeDefenseReport(evaluatedClaims, targetInfo);
      setDefenseReport(rep);
      if (onReportGenerated) onReportGenerated(rep);

      // Advance to next challenge if available
      const nextIdx = (activeClaim.currentChallengeIndex || 0) + 1;
      if (nextIdx < activeClaim.challenges.length) {
        activeClaim.currentChallengeIndex = nextIdx;
        setCurrentChallenge(activeClaim.challenges[nextIdx]);
      }
      setCandidateDefense('');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExportPDF = () => {
    if (!defenseReport) {
      const currentRep = generateResumeDefenseReport(claims.filter(c => c.evaluation), targetInfo);
      exportDefenseReportPDF(currentRep, targetInfo?.candidateName || 'Candidate');
    } else {
      exportDefenseReportPDF(defenseReport, targetInfo?.candidateName || 'Candidate');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              Rigorous Cross-Examination
            </span>
            <span className="text-slate-500 text-xs">• Pillar 2 Defense Simulator</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Resume Defense & Claim Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real interviewers don't just read resumes—they interrogate numbers, metrics, and architecture claims. Test whether you can defend every bullet point under tough scrutiny.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {defenseReport && (
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex-shrink-0">
              <div className="text-center px-1">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Credibility</span>
                <span className={`text-xl font-black font-mono ${
                  defenseReport.overallCredibilityScore >= 80 ? 'text-emerald-400' : defenseReport.overallCredibilityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {defenseReport.overallCredibilityScore}%
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            title="Download PDF Defense Report"
          >
            <FileDown className="w-4 h-4 text-indigo-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* ── Sub-navigation Mode Switcher ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('cross_exam')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'cross_exam'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Cross-Examination ({claims.length} Claims)</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'github'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>GitHub Project Verifier</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'company'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company-Specific Defense</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'github' && (
        <GitHubVerifier
          resumeClaims={claims.map(c => c.rawText)}
          onVerified={() => {}}
        />
      )}

      {activeTab === 'company' && (
        <CompanyDefenseMode
          resumeClaims={claims.map(c => c.rawText)}
          onStartDefense={(comp, qs) => {
            setActiveTab('cross_exam');
          }}
        />
      )}

      {activeTab === 'cross_exam' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Extracted Resume Claims (4 cols) */}
          <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Extracted Resume Claims ({claims.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Select to Defend</span>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {claims.map((claim) => {
              const isSelected = claim.id === selectedClaimId;
              const status = claim.status;

              return (
                <div
                  key={claim.id}
                  onClick={() => handleSelectClaim(claim)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-xs space-y-2 relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {claim.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      claim.riskLevel === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {claim.riskLevel} Challenge Risk
                    </span>
                  </div>

                  <p className="text-slate-200 font-medium leading-relaxed">
                    "{claim.rawText}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-500">
                      {claim.challenges?.length || 2} Probe Challenges
                    </span>
                    {status === 'defended' && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Defended
                      </span>
                    )}
                    {status === 'partially_defended' && (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Partial
                      </span>
                    )}
                    {status === 'struggled' && (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Vulnerable
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="text-slate-500 italic">Not tested</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Defense Challenge & Response Arena (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeClaim ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">

              {/* Active Target Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Claim Under Interrogation:
                </span>
                <p className="text-sm font-semibold text-white">
                  "{activeClaim.rawText}"
                </p>
              </div>

              {/* Cross-Examination Challenge */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Interviewer Cross-Examination Challenge:
                </div>
                <p className="text-sm text-slate-100 font-medium leading-relaxed">
                  {currentChallenge}
                </p>
              </div>

              {/* Defense Input Form */}
              <form onSubmit={handleDefend} className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Defend your claim with concrete metrics, personal ownership & tools:</span>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded transition ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-300 animate-pulse border border-rose-500/40'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={candidateDefense}
                  onChange={(e) => setCandidateDefense(e.target.value)}
                  placeholder="e.g. In my role, the baseline query response time was 850ms. I personally authored the pull request adding a Redis write-through cache and compound indexes on PostgreSQL, which reduced latency to 90ms as measured by Datadog APM..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const next = (activeClaim.currentChallengeIndex || 0) + 1;
                      const nextCh = activeClaim.challenges[next % activeClaim.challenges.length];
                      setCurrentChallenge(nextCh);
                    }}
                    className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try Alternate Challenge</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isEvaluating || !candidateDefense.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating Defense...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Defense & Evaluate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Active Evaluation Result */}
              {activeClaim.evaluation && (
                <div className={`p-4 rounded-xl border space-y-3 text-xs ${
                  activeClaim.evaluation.status === 'defended'
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : activeClaim.evaluation.status === 'partially_defended'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold flex items-center gap-1.5 ${
                      activeClaim.evaluation.status === 'defended' ? 'text-emerald-400' : activeClaim.evaluation.status === 'partially_defended' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {activeClaim.evaluation.status === 'defended' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {activeClaim.evaluation.verdict}
                    </span>
                    <span className="font-mono font-bold text-slate-300">
                      Score: {activeClaim.evaluation.credibilityScore}/10
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    {activeClaim.evaluation.feedback}
                  </p>

                  {activeClaim.evaluation.coachingTip && (
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-indigo-300 flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Interview Coach Recommendation:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {activeClaim.evaluation.coachingTip}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
              Upload a resume to automatically extract claims and start the defense cross-examination.
            </div>
          )}

          {/* Defense Report Summary Card */}
          {defenseReport && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Resume Defense Verification Report
                </h4>
                <button
                  onClick={onNavigateToIntelligence}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                >
                  <span>View in Intelligence Radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Defended</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{defenseReport.defendedCount}</span>
                </div>
                <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Partial</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{defenseReport.partiallyDefendedCount}</span>
                </div>
                <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Vulnerable</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">{defenseReport.struggledCount}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                  Critical Recommendations:
                </span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {defenseReport.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
