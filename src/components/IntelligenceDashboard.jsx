import React, { useMemo } from 'react';
import {
  Brain,
  Award,
  TrendingUp,
  Target,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  RefreshCw,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import {
  COMPETENCY_DIMENSIONS,
  calculateIntelligenceMetrics,
  getRadarPolygonPoints
} from '../services/interviewIntelligenceService.js';

export default function IntelligenceDashboard({
  sessions = [],
  parseResult,
  onStartTargetedPractice,
  onNavigate
}) {
  const metrics = useMemo(() => {
    return calculateIntelligenceMetrics({
      sessions,
      deltaAnalysis: parseResult?.deltaAnalysis,
      interviewEvaluations: parseResult?.evaluations || []
    });
  }, [sessions, parseResult]);

  // SVG Radar Dimensions
  const radarSize = 280;
  const center = radarSize / 2;
  const radius = 100;
  const polygonPoints = useMemo(() => {
    return getRadarPolygonPoints(metrics.competencies, center, center, radius);
  }, [metrics.competencies]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">

        {/* ── Top Header Banner ── */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  Pillar 3 Intelligence Core
                </span>
                <span className="text-slate-400 text-xs font-mono">• Continuous Training Loop</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Interview Intelligence & Readiness Radar
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
                Long-term evaluation across 6 core competencies. Identifies weaknesses, updates your readiness trajectory, and feeds back into targeted interview practice.
              </p>
            </div>

            {/* Readiness Gauge */}
            <div className="bg-slate-950/80 border border-indigo-500/40 rounded-2xl p-5 text-center flex-shrink-0 shadow-lg min-w-[170px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Interview Readiness
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black font-mono text-emerald-400">
                  {metrics.readinessScore}
                </span>
                <span className="text-slate-500 text-sm font-semibold">/100</span>
              </div>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                metrics.readinessTier === 'Offer Ready'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : metrics.readinessTier === 'Competitive'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {metrics.readinessTier}
              </span>
            </div>
          </div>
        </div>

        {/* ── Learning Cycle Infographic Banner ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Closed-Loop Continuous Preparation Cycle
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-500/30 text-indigo-300">
              1. Adaptive Mock Interview
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              2. Rubric Evaluation
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
              3. Weakness Identification
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
              4. Targeted Practice Drill
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-300">
              5. Re-Interview & Verification
            </span>
          </div>
        </div>

        {/* ── Spider Radar + Competency Breakdown Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Radar Chart (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between space-y-4">
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                6-Dimension Skill Radar
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Normalized</span>
            </div>

            {/* SVG Radar Spider Web */}
            <div className="relative flex items-center justify-center py-2">
              <svg width={radarSize} height={radarSize} className="overflow-visible">
                {/* Background Web Rings */}
                {[0.25, 0.5, 0.75, 1.0].map((ring) => (
                  <circle
                    key={ring}
                    cx={center}
                    cy={center}
                    r={radius * ring}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray={ring === 1.0 ? 'none' : '3,3'}
                  />
                ))}

                {/* Axis lines */}
                {COMPETENCY_DIMENSIONS.map((_, i) => {
                  const angle = (Math.PI * 2 / COMPETENCY_DIMENSIONS.length) * i - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Competency Filled Polygon */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(99, 102, 241, 0.25)"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  className="transition-all duration-700"
                />

                {/* Point Dots */}
                {polygonPoints.split(' ').map((pt, i) => {
                  const [px, py] = pt.split(',');
                  return (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r="4"
                      fill="#818cf8"
                      stroke="#1e1b4b"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 text-center italic">
              *Evaluated from mock interviews, resume claim defense, and skill delta analysis.
            </p>
          </div>

          {/* Competency Bars & Metrics (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Competency Breakdown & Performance
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Scale 0 - 100</span>
            </div>

            <div className="space-y-3.5">
              {COMPETENCY_DIMENSIONS.map((dim) => {
                const score = metrics.competencies[dim.key] || 60;
                return (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-200">{dim.label}</span>
                        <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">
                          {dim.description}
                        </span>
                      </div>
                      <span className={`font-mono font-bold ${
                        score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-indigo-400' : 'text-amber-400'
                      }`}>
                        {score}%
                      </span>
                    </div>

                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          score >= 80
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : score >= 65
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                            : 'bg-gradient-to-r from-amber-500 to-amber-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Strengths, Weaknesses, and Targeted Practice Loop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Strengths & Weaknesses Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              Diagnosed Strengths & High-Risk Areas
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Key Strengths:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {metrics.strengths.map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span>• {s.label}</span>
                      <strong className="text-emerald-400 font-mono">{s.score}%</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-1.5">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Identified Weaknesses (Focus Here):
                </span>
                <ul className="space-y-1 text-slate-300">
                  {metrics.weaknesses.map((w, i) => (
                    <li key={i} className="flex justify-between">
                      <span>• {w.label}</span>
                      <strong className="text-rose-400 font-mono">{w.score}%</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Targeted Practice Drills (Continuous Loop) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Targeted Practice Drills (Personalized)
              </h3>
              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                Actionable Next Steps
              </span>
            </div>

            <div className="space-y-2.5">
              {metrics.drills.map((drill) => (
                <div
                  key={drill.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{drill.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">• {drill.duration}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{drill.focus}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (onStartTargetedPractice) {
                        onStartTargetedPractice(drill);
                      } else if (onNavigate) {
                        onNavigate(drill.actionType === 'defense' ? 'defense' : 'interview');
                      }
                    }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition flex items-center gap-1 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
                  >
                    <span>Start Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Historical Performance Timeline ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Interview Performance Progression Over Time
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {metrics.timeline.length} Recorded Milestones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {metrics.timeline.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1"
              >
                <span className="text-[10px] text-slate-500 font-mono block">{entry.date}</span>
                <span className="text-xl font-bold font-mono text-indigo-400 block">{entry.score}%</span>
                <span className="text-[11px] text-slate-400 truncate block">{entry.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
