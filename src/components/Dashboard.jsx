import React from 'react';
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
  BookOpen
} from 'lucide-react';

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

