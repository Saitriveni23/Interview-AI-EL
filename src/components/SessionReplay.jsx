import React, { useState, useMemo } from 'react';
import {
  X, Search, Download, ChevronDown, ChevronUp,
  Filter, Star, CheckCircle, AlertTriangle, Info
} from 'lucide-react';

// ── Demo data generator ────────────────────────────────────────
function demoSession() {
  const questions = [
    { text: 'Explain the virtual DOM in React and why it matters.', category: 'Technical' },
    { text: 'Tell me about a time you led a team through a difficult project.', category: 'Behavioral' },
    { text: 'Design a URL shortening service like bit.ly.', category: 'Technical' },
    { text: 'What is your greatest weakness and how do you address it?', category: 'HR' },
    { text: 'Explain the difference between SQL and NoSQL databases.', category: 'Technical' },
    { text: 'How do you handle conflict with a coworker?', category: 'Behavioral' },
    { text: 'Describe the event loop in Node.js.', category: 'Technical' },
  ];
  const answers = [
    'The virtual DOM is an in-memory representation of the real DOM. React diffs old and new vDOM trees and only applies minimal changes to the real DOM, improving performance.',
    'In a migration project, I coordinated cross-functional teams by setting daily check-ins and clear milestones. We delivered two weeks early.',
    'I would use a base62 encoding of an auto-incremented ID stored in a distributed key-value store like Redis, with a CDN layer for caching popular URLs.',
    'I tend to over-engineer solutions. I now set time-boxed spikes and validate with stakeholders before diving deep.',
    'SQL uses structured schemas and ACID transactions, ideal for relational data. NoSQL offers schema flexibility and horizontal scaling for unstructured or high-velocity data.',
    'I request a private meeting, listen actively, find common ground on the shared goal, and escalate only if necessary.',
    'Node.js runs JS on a single thread with a non-blocking event loop. Async I/O operations are offloaded to libuv, and callbacks are queued in the event loop for execution.',
  ];
  const scores = [82, 74, 91, 68, 85, 77, 88];
  const rubrics = [
    { accuracy: 90, clarity: 85, depth: 75 },
    { accuracy: 70, clarity: 80, depth: 72 },
    { accuracy: 95, clarity: 88, depth: 90 },
    { accuracy: 65, clarity: 72, depth: 68 },
    { accuracy: 88, clarity: 82, depth: 85 },
    { accuracy: 75, clarity: 80, depth: 76 },
    { accuracy: 90, clarity: 85, depth: 88 },
  ];
  return {
    date: new Date().toISOString(),
    targetRole: 'Senior Full Stack Engineer',
    company: 'Google',
    questions: questions.map(q => q.text),
    categories: questions.map(q => q.category),
    answers,
    scores,
    rubrics,
  };
}

// ── Score Badge ───────────────────────────────────────────────
function ScoreBadge({ score }) {
  const cls =
    score >= 85 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
    score >= 70 ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
    score >= 55 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {score}%
    </span>
  );
}

// ── Mini Bar Chart ─────────────────────────────────────────────
function ScoreTimeline({ scores }) {
  const max = 100;
  return (
    <div className="flex items-end gap-1 h-12">
      {scores.map((s, i) => {
        const h = Math.round((s / max) * 44);
        const color = s >= 85 ? '#10b981' : s >= 70 ? '#6366f1' : s >= 55 ? '#eab308' : '#ef4444';
        return (
          <div key={i} className="flex flex-col items-center gap-0.5 flex-1" title={`Q${i + 1}: ${s}%`}>
            <div
              className="w-full rounded-t-sm transition-all"
              style={{ height: `${h}px`, backgroundColor: color, minHeight: '4px' }}
            />
            <span className="text-[8px] text-slate-600">Q{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Rubric Bar ────────────────────────────────────────────────
function RubricBar({ label, value }) {
  const color = value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-indigo-500' : value >= 55 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-mono">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function SessionReplay({ session, onClose }) {
  const data = session && session.questions?.length ? session : demoSession();

  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');

  const categories = ['All', 'Technical', 'Behavioral', 'HR'];
  const scoreRanges = ['All', '90+', '70-89', '50-69', '<50'];

  const items = data.questions.map((q, i) => ({
    q,
    a: data.answers?.[i] || '—',
    score: data.scores?.[i] ?? 0,
    category: data.categories?.[i] || 'Technical',
    rubric: data.rubrics?.[i] || { accuracy: 70, clarity: 70, depth: 70 },
  }));

  const filtered = useMemo(() => items.filter(item => {
    const matchSearch = !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchScore = (() => {
      if (scoreFilter === 'All') return true;
      if (scoreFilter === '90+') return item.score >= 90;
      if (scoreFilter === '70-89') return item.score >= 70 && item.score < 90;
      if (scoreFilter === '50-69') return item.score >= 50 && item.score < 70;
      if (scoreFilter === '<50') return item.score < 50;
      return true;
    })();
    return matchSearch && matchCat && matchScore;
  }), [items, search, categoryFilter, scoreFilter]);

  // Export to Markdown
  const exportMarkdown = () => {
    const lines = [
      `# Session Replay — ${data.targetRole} @ ${data.company}`,
      `**Date:** ${new Date(data.date).toLocaleDateString()}`,
      '',
      '---',
      '',
    ];
    items.forEach((item, i) => {
      lines.push(`## Q${i + 1}: ${item.q}`);
      lines.push(`**Category:** ${item.category} | **Score:** ${item.score}%`);
      lines.push('');
      lines.push(`**Answer:**`);
      lines.push(item.a);
      lines.push('');
      lines.push(`**Rubric:** Accuracy ${item.rubric.accuracy}% | Clarity ${item.rubric.clarity}% | Depth ${item.rubric.depth}%`);
      lines.push('');
      lines.push('---');
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-replay-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const avgScore = Math.round(items.reduce((s, i) => s + i.score, 0) / (items.length || 1));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Session Replay</h1>
            <p className="text-slate-400 text-sm mt-1">
              {data.targetRole} @ {data.company} &mdash; {new Date(data.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportMarkdown}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export .md
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Questions', value: items.length, color: 'text-indigo-400' },
            { label: 'Avg Score', value: `${avgScore}%`, color: avgScore >= 75 ? 'text-emerald-400' : avgScore >= 55 ? 'text-yellow-400' : 'text-red-400' },
            { label: 'Top Score', value: `${Math.max(...items.map(i => i.score))}%`, color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Score Timeline Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 mb-3">Score per Question</p>
          <ScoreTimeline scores={items.map(i => i.score)} />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search questions or answers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  categoryFilter === c ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Score filter */}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-slate-500" />
            {scoreRanges.map(r => (
              <button
                key={r}
                onClick={() => setScoreFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                  scoreFilter === r ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Q&A Timeline */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">
              No questions match your filters.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isOpen = expanded === idx;
              return (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition">
                  {/* Row header — always visible */}
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-800/40 transition group"
                    onClick={() => setExpanded(isOpen ? null : idx)}
                  >
                    <span className="text-xs font-mono text-slate-600 w-6 flex-shrink-0">Q{idx + 1}</span>
                    <p className="flex-1 text-sm text-slate-200 font-medium line-clamp-1 group-hover:text-white transition">{item.q}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      item.category === 'Technical' ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' :
                      item.category === 'Behavioral' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      'bg-purple-500/15 text-purple-400 border-purple-500/30'
                    }`}>{item.category}</span>
                    <ScoreBadge score={item.score} />
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                  </button>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="border-t border-slate-800 px-5 py-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Question</p>
                        <p className="text-sm text-slate-300">{item.q}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Answer</p>
                        <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/50 rounded-xl p-3">{item.a}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rubric Breakdown</p>
                        <div className="grid grid-cols-1 gap-2">
                          <RubricBar label="Accuracy" value={item.rubric.accuracy} />
                          <RubricBar label="Clarity" value={item.rubric.clarity} />
                          <RubricBar label="Depth" value={item.rubric.depth} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
