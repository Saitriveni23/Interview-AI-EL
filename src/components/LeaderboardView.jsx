import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Star,
  Users,
  Search,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Elena R. (Candidate_8E19)', role: 'Distributed Systems Lead', company: 'Google', score: 96, streak: 14, sessions: 28, badge: 'Staff Ready' },
  { rank: 2, name: 'Marcus K. (Candidate_3F44)', role: 'Senior Backend Engineer', company: 'Stripe', score: 94, streak: 12, sessions: 24, badge: 'Offer Ready' },
  { rank: 3, name: 'Devon L. (Candidate_7A22)', role: 'Full Stack Architect', company: 'Meta', score: 92, streak: 9, sessions: 19, badge: 'Offer Ready' },
  { rank: 4, name: 'Triveni Reddy', isCurrentUser: true, role: 'Full Stack Developer', company: 'Google', score: 88, streak: 7, sessions: 12, badge: 'Competitive' },
  { rank: 5, name: 'Siddharth M. (Candidate_1C88)', role: 'ML Platform Engineer', company: 'Anthropic', score: 87, streak: 6, sessions: 15, badge: 'Competitive' },
  { rank: 6, name: 'Chloe T. (Candidate_5D31)', role: 'Frontend Engineer', company: 'Netflix', score: 85, streak: 5, sessions: 11, badge: 'Competitive' },
  { rank: 7, name: 'Amir H. (Candidate_9B10)', role: 'DevOps / Cloud Architect', company: 'Amazon', score: 83, streak: 4, sessions: 10, badge: 'Competitive' },
  { rank: 8, name: 'Sofia V. (Candidate_2G77)', role: 'System Design Specialist', company: 'Uber', score: 81, streak: 3, sessions: 8, badge: 'Developing' },
  { rank: 9, name: 'Kenji S. (Candidate_6K42)', role: 'Software Engineer II', company: 'Apple', score: 79, streak: 4, sessions: 7, badge: 'Developing' },
  { rank: 10, name: 'Aisha N. (Candidate_4M18)', role: 'Data Engineer', company: 'Snowflake', score: 78, streak: 2, sessions: 6, badge: 'Developing' },
];

const ACHIEVEMENTS = [
  { id: 'ironclad', name: 'Resume Ironclad', desc: 'Successfully defended 5+ resume claims during cross-examination', icon: '🛡️', unlocked: true },
  { id: 'star_master', name: 'STAR Method Ace', desc: 'Completed 10 behavioral questions with full STAR structure', icon: '⭐', unlocked: true },
  { id: 'streak_7', name: '7-Day Hot Streak', desc: 'Practiced interviews 7 consecutive days', icon: '🔥', unlocked: true },
  { id: 'scale_arch', name: 'Scale Architect', desc: 'Solved Staff-tier distributed systems challenge', icon: '🏗️', unlocked: false },
  { id: 'voice_virtuoso', name: 'Voice Virtuoso', desc: 'Completed a full voice mock interview with < 2 filler words', icon: '🎙️', unlocked: false },
  { id: 'code_runner', name: 'Code Sandbox Ace', desc: 'Passed all algorithmic unit test cases in under 3 minutes', icon: '💻', unlocked: true },
];

export default function LeaderboardView({ currentUser, sessions = [] }) {
  const [filterPeriod, setFilterPeriod] = useState('all_time');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = MOCK_LEADERBOARD.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Trophy className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Interview Readiness Leaderboard</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Benchmark your interview performance against global candidates preparing for top tech roles.
            </p>
          </div>

          {/* Time filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['all_time', 'this_week'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                  filterPeriod === p
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Your Global Rank</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">#4</span>
              <span className="text-xs text-emerald-400 flex items-center font-semibold">
                <ChevronUp className="w-3.5 h-3.5" /> Top 5%
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Readiness Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-indigo-400 font-mono">88%</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Competitive
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Active Streak</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-orange-400 font-mono flex items-center gap-1">
                <Flame className="w-5 h-5 fill-orange-500 text-orange-400 animate-pulse" />
                7 Days
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Sessions Logged</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-purple-400 font-mono">
                {sessions.length > 0 ? sessions.length : 12}
              </span>
              <span className="text-xs text-slate-400">Completed</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Leaderboard Table + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard Table (2 cols on large screen) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Candidates</h3>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter candidate or role..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition w-44"
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Target Role</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredUsers.map((user) => {
                    const isUser = user.isCurrentUser;
                    return (
                      <tr
                        key={user.rank}
                        className={`transition ${
                          isUser
                            ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {user.rank === 1 ? (
                            <span className="text-amber-400">🥇 #1</span>
                          ) : user.rank === 2 ? (
                            <span className="text-slate-300">🥈 #2</span>
                          ) : user.rank === 3 ? (
                            <span className="text-amber-600">🥉 #3</span>
                          ) : (
                            <span className="text-slate-400">#{user.rank}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {user.name[0]}
                            </span>
                            <div>
                              <span className={`font-semibold block ${isUser ? 'text-indigo-300 font-bold' : 'text-slate-200'}`}>
                                {user.name} {isUser && '(You)'}
                              </span>
                              <span className="text-[10px] text-slate-500">{user.sessions} practice sessions</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 font-medium block">{user.role}</span>
                          <span className="text-[10px] text-slate-500 font-mono">@{user.company}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-400">
                          {user.score}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-orange-400 text-xs">
                            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-400" />
                            {user.streak}d
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Achievements Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Badges & Achievements
              </h3>
              <span className="text-xs text-purple-400 font-semibold font-mono">
                {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length}
              </span>
            </div>

            <div className="space-y-3">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border transition ${
                    ach.unlocked
                      ? 'bg-slate-950/70 border-slate-800 text-slate-200'
                      : 'bg-slate-950/20 border-slate-800/40 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl shrink-0">{ach.icon}</span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{ach.name}</span>
                        {ach.unlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-600 font-semibold uppercase">Locked</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{ach.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
