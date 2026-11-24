/**
 * Interview AI — AnswerEvaluationCard Component
 *
 * Displays a full LLM evaluation result for a single interview answer.
 * Shows: grade badge, circular score ring, rubric bars, strengths,
 * improvements, hallucination warning, and action buttons.
 *
 * Props:
 *   evaluation  {object}   - Result from evaluateAnswerWithLLM / /api/resume/evaluate-answer-llm
 *   onRetry     {function} - Called when user clicks "Retry"
 *   onNext      {function} - Called when user clicks "Next Question"
 */

// ------------------------------------
// GRADE CONFIGURATION
// ------------------------------------

const GRADE_CONFIG = {
  A: {
    label: 'Excellent',
    ring: 'stroke-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glow: 'shadow-emerald-500/20'
  },
  B: {
    label: 'Good',
    ring: 'stroke-green-400',
    badge: 'bg-green-500/20 text-green-300 border-green-500/40',
    glow: 'shadow-green-500/20'
  },
  C: {
    label: 'Average',
    ring: 'stroke-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    glow: 'shadow-yellow-500/20'
  },
  D: {
    label: 'Below Average',
    ring: 'stroke-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    glow: 'shadow-orange-500/20'
  },
  F: {
    label: 'Needs Work',
    ring: 'stroke-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40',
    glow: 'shadow-red-500/20'
  }
};

// ------------------------------------
// CIRCULAR SCORE RING (SVG)
// ------------------------------------

function ScoreRing({ score = 0, grade = 'F' }) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.F;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Derive plain color for SVG stroke from Tailwind class name
  const strokeColorMap = {
    A: '#34d399',  // emerald-400
    B: '#4ade80',  // green-400
    C: '#facc15',  // yellow-400
    D: '#fb923c',  // orange-400
    F: '#f87171'   // red-400
  };
  const strokeColor = strokeColorMap[grade] || '#f87171';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="112" height="112" className="-rotate-90">
        {/* Track */}
        <circle
          cx="56" cy="56" r={radius}
          strokeWidth="8"
          stroke="#334155"
          fill="none"
        />
        {/* Progress */}
        <circle
          cx="56" cy="56" r={radius}
          strokeWidth="8"
          stroke={strokeColor}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white leading-none">{score}</span>
        <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ------------------------------------
// RUBRIC PROGRESS BAR
// ------------------------------------

function RubricBar({ label, value = 0 }) {
  const color =
    value >= 80 ? 'bg-emerald-500' :
    value >= 65 ? 'bg-green-500' :
    value >= 50 ? 'bg-yellow-500' :
    value >= 35 ? 'bg-orange-500' :
    'bg-red-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-300 capitalize">{label}</span>
        <span className="text-xs font-mono text-slate-400">{value}/100</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------

export default function AnswerEvaluationCard({ evaluation, onRetry, onNext }) {
  if (!evaluation) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center text-slate-400">
        No evaluation data available.
      </div>
    );
  }

  const {
    score = 0,
    grade = 'F',
    feedback = '',
    strengths = [],
    improvements = [],
    detectedIssues = [],
    rubric = {},
    hasHallucination = false,
    hallucinationIssues = []
  } = evaluation;

  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.F;

  return (
    <div className={`bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl ${config.glow}`}>

      {/* ---- Header: Grade Badge + Score Ring ---- */}
      <div className="bg-slate-900/60 px-6 py-5 flex items-center gap-6 border-b border-slate-700">
        {/* Score Ring */}
        <ScoreRing score={score} grade={grade} />

        {/* Grade + Feedback */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${config.badge}`}
            >
              Grade {grade}
            </span>
            <span className="text-sm text-slate-400">{config.label}</span>
            {evaluation.source === 'gemini' && (
              <span className="text-xs text-cyan-400 font-mono">✦ AI-Scored</span>
            )}
            {evaluation.source === 'fallback' && (
              <span className="text-xs text-slate-500 font-mono">⚡ Keyword-Scored</span>
            )}
          </div>
          {feedback && (
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{feedback}</p>
          )}
        </div>
      </div>

      {/* ---- Hallucination Warning ---- */}
      {(hasHallucination || detectedIssues.length > 0) && (
        <div className="mx-5 mt-4 bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-base">⚠</span>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
              {hasHallucination ? 'Potential Hallucination Detected' : 'Issues Detected'}
            </span>
          </div>
          <ul className="space-y-0.5">
            {[...(hallucinationIssues || []), ...detectedIssues].map((issue, i) => (
              <li key={i} className="text-xs text-red-300">• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ---- Rubric Breakdown ---- */}
        {rubric && Object.keys(rubric).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Rubric Breakdown
            </h4>
            {Object.entries(rubric).map(([key, val]) => (
              <RubricBar key={key} label={key} value={val} />
            ))}
          </div>
        )}

        {/* ---- Strengths & Improvements ---- */}
        <div className="space-y-4">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-emerald-400 shrink-0">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {improvements.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Areas to Improve
              </h4>
              <ul className="space-y-1.5">
                {improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-orange-400 shrink-0">→</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ---- Action Buttons ---- */}
      <div className="px-5 pb-5 flex gap-3 justify-end border-t border-slate-700 pt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2 text-sm font-semibold rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            ↩ Retry
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}
