import React, { useMemo } from 'react';

// ── Helpers ───────────────────────────────────────────────────
function getStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0;
  const days = [...new Set(
    sessions.map(s => new Date(s.date).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b - a);

  let streak = 0;
  let cur = new Date();
  cur.setHours(0, 0, 0, 0);

  for (const d of days) {
    const target = new Date(cur);
    target.setHours(0, 0, 0, 0);
    if (d.getTime() === target.getTime()) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getXP(sessions) {
  return (sessions?.length || 0) * 120 + 80;
}

function getLevel(xp) {
  if (xp >= 2000) return { label: 'Master', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' };
  if (xp >= 800)  return { label: 'Expert', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' };
  if (xp >= 300)  return { label: 'Intermediate', color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' };
  return               { label: 'Beginner', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' };
}

function getAchievements(sessions, streak) {
  const count = sessions?.length || 0;
  const hasScore = sessions?.some(s => s.score >= 95);
  return [
    { id: 'first', icon: '🎯', label: 'First Interview', earned: count >= 1, desc: 'Complete your first session' },
    { id: 'streak7', icon: '🔥', label: '7-Day Streak', earned: streak >= 7, desc: 'Practice 7 days in a row' },
    { id: 'perfect', icon: '⭐', label: 'Perfect Score', earned: hasScore, desc: 'Score 95%+ on a session' },
    { id: 'champ', icon: '🏆', label: 'Consistency Champion', earned: count >= 10, desc: 'Complete 10 sessions' },
  ];
}

// Build 7-day heatmap array (today going back 6 days)
function buildWeekHeatmap(sessions) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const count = sessions.filter(s => {
      const sd = new Date(s.date);
      sd.setHours(0, 0, 0, 0);
      return sd.getTime() === d.getTime();
    }).length;
    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    days.push({ date: d, count, label: labels[d.getDay()] });
  }
  return days;
}

// Daily practice message
const REMINDERS = [
  "🌟 Consistency beats perfection. Keep showing up!",
  "💡 Each practice session makes you sharper.",
  "🚀 You're building interview mastery one day at a time.",
  "🎯 Today's practice is tomorrow's confidence.",
  "⚡ Stay sharp — your next interview could be any day!",
];

// ── Component ─────────────────────────────────────────────────
export default function StreakTracker({ sessions = [], currentUser }) {
  const streak = useMemo(() => getStreak(sessions), [sessions]);
  const xp = useMemo(() => getXP(sessions), [sessions]);
  const level = useMemo(() => getLevel(xp), [xp]);
  const achievements = useMemo(() => getAchievements(sessions, streak), [sessions, streak]);
  const weekHeatmap = useMemo(() => buildWeekHeatmap(sessions), [sessions]);
  const reminder = REMINDERS[new Date().getDay() % REMINDERS.length];

  // XP to next level thresholds
  const thresholds = [0, 300, 800, 2000];
  const nextThreshold = thresholds.find(t => t > xp) || 2000;
  const prevThreshold = [...thresholds].reverse().find(t => t <= xp) || 0;
  const xpProgress = Math.min(100, Math.round(((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Practice Streak</h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${level.bg} ${level.color}`}>
          {level.label}
        </span>
      </div>

      {/* Streak badge */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 streak-flame">
            <span className="text-2xl select-none">🔥</span>
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-white leading-none">{streak}<span className="text-lg font-bold text-slate-400 ml-1">day{streak !== 1 ? 's' : ''}</span></p>
          <p className="text-xs text-slate-400 mt-0.5">current streak</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-indigo-400">{xp.toLocaleString()} XP</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Next: {nextThreshold.toLocaleString()} XP</p>
        </div>
      </div>

      {/* XP Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>{prevThreshold} XP</span>
          <span>{xpProgress}% to {level.label === 'Master' ? 'Max' : getLevel(nextThreshold + 1).label}</span>
          <span>{nextThreshold} XP</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* 7-day Heatmap */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Last 7 Days</p>
        <div className="flex gap-2">
          {weekHeatmap.map((day, i) => {
            const intensity =
              day.count === 0 ? 'bg-slate-800 border-slate-700' :
              day.count === 1 ? 'bg-indigo-700/70 border-indigo-600/50' :
              day.count >= 2  ? 'bg-indigo-500/80 border-indigo-400/50' :
                                'bg-indigo-400 border-indigo-300';
            const isToday = i === 6;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${day.label}: ${day.count} session${day.count !== 1 ? 's' : ''}`}>
                <div className={`w-full aspect-square rounded-lg border ${intensity} ${isToday ? 'ring-1 ring-indigo-400' : ''} transition`} />
                <span className={`text-[9px] ${isToday ? 'text-indigo-400 font-bold' : 'text-slate-600'}`}>{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Achievements</p>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map(a => (
            <div
              key={a.id}
              title={a.desc}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                a.earned
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                  : 'bg-slate-800/50 border-slate-800 text-slate-600 opacity-60'
              }`}
            >
              <span className="text-base">{a.icon}</span>
              <span className="text-[10px] font-semibold leading-tight">{a.label}</span>
              {a.earned && <span className="ml-auto text-emerald-400 text-[9px]">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Daily reminder */}
      <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl px-4 py-2.5">
        <p className="text-xs text-indigo-200">{reminder}</p>
      </div>

      {/* Flame CSS animation */}
      <style>{`
        @keyframes flameWobble {
          0%,100% { transform: scale(1) rotate(-3deg); }
          50%      { transform: scale(1.08) rotate(3deg); }
        }
        .streak-flame { animation: flameWobble 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
