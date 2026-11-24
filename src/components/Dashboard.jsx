import React, { useState } from 'react';
import {
  FileText,
  Award,
  TrendingUp,
  Plus,
  ChevronRight,
  BarChart2,
  Calendar,
  Crosshair,
  CheckCircle,
  PlayCircle,
  BookOpen,
  X
} from 'lucide-react';

// ── Skill Heatmap ─────────────────────────────────────────────
const HEATMAP_TOPICS = [
  'React', 'Node.js', 'System Design', 'Algorithms',
  'SQL', 'TypeScript', 'AWS', 'Docker',
  'Caching', 'Databases', 'APIs', 'Testing'
];

function proficiencyColor(pct) {
  if (pct < 40)  return { bg: 'bg-red-500/70',    border: 'border-red-500/40',    label: 'Needs Work' };
  if (pct < 60)  return { bg: 'bg-orange-500/70',  border: 'border-orange-500/40', label: 'Developing' };
  if (pct < 75)  return { bg: 'bg-yellow-500/70',  border: 'border-yellow-500/40', label: 'Fair' };
  if (pct < 90)  return { bg: 'bg-green-500/70',   border: 'border-green-500/40',  label: 'Good' };
  return             { bg: 'bg-emerald-500/70', border: 'border-emerald-500/40', label: 'Expert' };
}

function SkillHeatmap({ onPractice }) {
  const [modalTopic, setModalTopic] = useState(null);
  // deterministic pseudo-proficiency per topic
  const topicPct = (t) => ((t.charCodeAt(0) * 7 + t.length * 13) % 71) + 20;
  const topicDays = (t) => ((t.charCodeAt(1) || 5) * 3) % 21 + 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-purple-400" />
        Skill Proficiency Heatmap
      </h3>
      <div className="grid grid-cols-6 gap-2">
        {HEATMAP_TOPICS.map((topic) => {
          const pct = topicPct(topic);
          const days = topicDays(topic);
          const { bg, border, label } = proficiencyColor(pct);
          return (
            <button
              key={topic}
              title={`${topic}: ${pct}% — ${label}\nLast tested: ${days} days ago`}
              onClick={() => setModalTopic({ topic, pct, days, label })}
              className={`relative group ${bg} border ${border} rounded-xl p-2 text-center transition hover:scale-105 hover:brightness-125`}
            >
              <p className="text-[9px] font-semibold text-white leading-tight truncate">{topic}</p>
              <p className="text-[8px] text-white/70 mt-0.5">{pct}%</p>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                Last tested: {days}d ago
              </span>
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px] text-slate-500 flex-wrap">
        {[['<40%','bg-red-500/70'],['40-60%','bg-orange-500/70'],['60-75%','bg-yellow-500/70'],['75-90%','bg-green-500/70'],['90%+','bg-emerald-500/70']].map(([l,c])=>(
          <span key={l} className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded ${c}`}/>{l}</span>
        ))}
      </div>

      {/* Practice Modal */}
      {modalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalTopic(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold text-lg">{modalTopic.topic}</h4>
              <button onClick={() => setModalTopic(null)} className="text-slate-500 hover:text-white transition"><X className="w-4 h-4"/></button>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${proficiencyColor(modalTopic.pct).bg} text-white`}>
              {modalTopic.label} — {modalTopic.pct}%
            </div>
            <p className="text-slate-400 text-sm mb-2">Last tested <span className="text-indigo-400 font-semibold">{modalTopic.days} days ago</span></p>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
              <div className={`h-full rounded-full ${proficiencyColor(modalTopic.pct).bg}`} style={{ width: `${modalTopic.pct}%` }} />
            </div>
            <button
              onClick={() => { setModalTopic(null); onPractice && onPractice(modalTopic.topic); }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition"
            >
              Start Focused Practice →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Readiness Gauge ───────────────────────────────────────────
function ReadinessGauge({ score = 72 }) {
  const clamp = Math.max(0, Math.min(100, score));
  // 180° semicircle: left end = 180°, right end = 0°
  const angle = 180 - (clamp / 100) * 180; // degrees from bottom-left
  const r = 70;
  const cx = 90;
  const cy = 90;
  const toRad = (deg) => (deg * Math.PI) / 180;
  // Arc from 180° to (180 - clamp*1.8)°
  const startX = cx + r * Math.cos(toRad(180));
  const startY = cy + r * Math.sin(toRad(180));
  const endAngleDeg = 180 - (clamp / 100) * 180;
  const endX = cx + r * Math.cos(toRad(endAngleDeg));
  const endY = cy + r * Math.sin(toRad(endAngleDeg));
  const largeArc = clamp > 50 ? 1 : 0;

  // Color interpolation red→green via orange/yellow
  const colorStop = clamp < 40 ? '#ef4444' : clamp < 65 ? '#f97316' : clamp < 80 ? '#eab308' : '#22c55e';

  const tier = clamp >= 90 ? 'Expert Ready' : clamp >= 75 ? 'Well Prepared' : clamp >= 55 ? 'Getting There' : clamp >= 35 ? 'Needs Practice' : 'Just Starting';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-400" />
        Interview Readiness Score
      </h3>
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round"
        />
        {/* Colored progress arc */}
        {clamp > 0 && (
          <path
            d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none" stroke={colorStop} strokeWidth="12" strokeLinecap="round"
          />
        )}
        {/* Score text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{clamp}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="8">{tier}</text>
      </svg>
      <div className="flex justify-between w-full mt-1 px-2 text-[9px] text-slate-600">
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}

// ── Week-over-Week Line Chart ──────────────────────────────────
function WeeklyProgressChart({ sessions }) {
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  // Build 7-point dataset from sessions or demo data
  const demo = [
    { label: 'Mon', overall: 48, comm: 55 },
    { label: 'Tue', overall: 54, comm: 58 },
    { label: 'Wed', overall: 61, comm: 63 },
    { label: 'Thu', overall: 59, comm: 70 },
    { label: 'Fri', overall: 68, comm: 72 },
    { label: 'Sat', overall: 73, comm: 75 },
    { label: 'Sun', overall: 78, comm: 80 },
  ];

  const chartData = sessions.length >= 2
    ? sessions.slice(-7).map((s, i) => ({
        label: DAYS[new Date(s.date).getDay()],
        overall: s.score ?? 50,
        comm: Math.round((s.score ?? 50) * 0.9 + 10),
      }))
    : demo;

  const W = 320, H = 120, PL = 28, PR = 8, PT = 10, PB = 24;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const n = chartData.length;
  const xPos = (i) => PL + (i / (n - 1)) * innerW;
  const yPos = (v) => PT + innerH - (v / 100) * innerH;

  const toPolyline = (key) =>
    chartData.map((d, i) => `${xPos(i)},${yPos(d[key])}`).join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Weekly Progress
        </h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-indigo-400"><span className="w-3 h-0.5 bg-indigo-400 rounded inline-block"/>Overall</span>
          <span className="flex items-center gap-1 text-purple-400"><span className="w-3 h-0.5 bg-purple-400 rounded inline-block"/>Communication</span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {/* Y-axis grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={PL} x2={W - PR} y1={yPos(v)} y2={yPos(v)} stroke="#1e293b" strokeWidth="1" />
            <text x={PL - 4} y={yPos(v) + 3} textAnchor="end" fill="#475569" fontSize="7">{v}</text>
          </g>
        ))}

        {/* Overall line (indigo) */}
        <polyline points={toPolyline('overall')} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Communication line (purple) */}
        <polyline points={toPolyline('comm')} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 2" />

        {/* Dots + tooltips */}
        {chartData.map((d, i) => (
          <g key={i}>
            <title>{`${d.label}: Overall ${d.overall}%, Comm ${d.comm}%`}</title>
            <circle cx={xPos(i)} cy={yPos(d.overall)} r="3.5" fill="#6366f1" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx={xPos(i)} cy={yPos(d.comm)} r="3.5" fill="#a855f7" stroke="#0f172a" strokeWidth="1.5" />
            {/* X-axis label */}
            <text x={xPos(i)} y={H - 4} textAnchor="middle" fill="#64748b" fontSize="7">{d.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const DEFAULT_SKILLS = ['System Design', 'Docker', 'AWS', 'TypeScript', 'React'];
const DEFAULT_LEVELS  = [28, 42, 35, 55, 65];

export default function Dashboard({ onNavigate, parseResult, sessions = [] }) {
  // Pull gap skills from parsed result or last session
  const gapSkills =
    parseResult?.deltaAnalysis?.missingSkills?.slice(0, 5) ||
    sessions[0]?.missingSkills?.slice(0, 5) ||
    DEFAULT_SKILLS;

  const skillLevels = gapSkills.map((_, i) => DEFAULT_LEVELS[i] || 20 + i * 10);

  const stats = [
    {
      label: 'Total Sessions',
      value: sessions.length || 0,
      icon: FileText,
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      label: 'Analyses Done',
      value: sessions.filter(s => s.status === 'Analyzed').length || 0,
      icon: BarChart2,
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'Interviews Done',
      value: sessions.filter(s => s.interviewDone).length || 0,
      icon: Award,
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
  ];

  const quickActions = [
    { step: '1', label: 'Upload Resume', desc: 'PDF or paste text', icon: FileText, page: 'upload', color: 'indigo' },
    { step: '2', label: 'AI Analysis', desc: 'Skill gap detection', icon: BarChart2, page: 'upload', color: 'emerald' },
    { step: '3', label: 'Practice Interview', desc: 'AI mock session', icon: PlayCircle, page: 'interview', color: 'amber' },
    { step: '4', label: 'Improve & Grow', desc: 'Curated study plan', icon: TrendingUp, page: 'upload', color: 'purple' },
  ];

  const actionColors = {
    indigo: { icon: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    purple: { icon: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8 space-y-6">

        {/* ── Hero Card ── */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-8 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
          {/* Decorative glow */}
          <div
            className="absolute right-0 top-0 w-80 h-80 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 70% 30%, white, transparent 60%)' }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-2">Welcome to</p>
              <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                Your AI-Powered<br />Interview Companion
              </h1>
              <p className="text-indigo-200 text-sm max-w-md leading-relaxed">
                Upload your resume, select a target role, get personalised gap analysis,
                curated study materials, and AI mock interviews.
              </p>
            </div>
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg text-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Start New Interview
            </button>
          </div>
        </div>

        {/* ── Analytics Row: Gauge + Weekly Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ReadinessGauge score={sessions.length > 0 ? (sessions[0].score ?? 72) : 72} />
          <div className="lg:col-span-2">
            <WeeklyProgressChart sessions={sessions} />
          </div>
        </div>

        {/* ── Skill Heatmap ── */}
        <SkillHeatmap onPractice={(topic) => onNavigate('interview')} />

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, textColor, bgColor, borderColor }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${bgColor} ${borderColor}`}>
                <Icon className={`w-5 h-5 ${textColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Top Skills + Recent Sessions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Skills to Improve */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Top Skills to Improve
              </h3>
              <button
                onClick={() => onNavigate('upload')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {gapSkills.map((skill, i) => {
                const pct = skillLevels[i];
                return (
                  <div key={skill}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">{skill}</span>
                      <span className="text-slate-500 font-mono">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Sessions table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Recent Sessions
              </h3>
              <button
                onClick={() => onNavigate('sessions')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
              >
                View All →
              </button>
            </div>

            {sessions.length > 0 ? (
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 text-left">
                      <th className="pb-3 font-semibold pr-4">Date</th>
                      <th className="pb-3 font-semibold pr-4">Target Role</th>
                      <th className="pb-3 font-semibold pr-4">Company</th>
                      <th className="pb-3 font-semibold pr-4">Status</th>
                      <th className="pb-3 font-semibold pr-4">Score</th>
                      <th className="pb-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 5).map((session, i) => (
                      <tr key={i} className="border-t border-slate-800/80">
                        <td className="py-3 text-slate-400 pr-4">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-slate-200 font-medium pr-4">
                          {session.targetRole || '—'}
                        </td>
                        <td className="py-3 text-slate-400 pr-4">
                          {session.company || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            {session.status || 'Analyzed'}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-indigo-400 font-bold pr-4">
                          {session.score != null ? `${session.score}%` : '—'}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => onNavigate('upload')}
                            className="text-slate-500 hover:text-indigo-400 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-slate-300 text-sm font-medium">No sessions yet</p>
                <p className="text-slate-500 text-xs mt-1">Upload your resume to get started</p>
                <button
                  onClick={() => onNavigate('upload')}
                  className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Start Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">How it works</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(({ step, label, desc, icon: Icon, page, color }) => {
              const c = actionColors[color];
              return (
                <button
                  key={step}
                  onClick={() => onNavigate(page)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 text-left transition group"
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">{label}</p>
                  <p className="text-xs text-slate-500 mt-1">{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

