import React, { useState } from 'react';
import {
  Building2,
  Award,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Flame,
  Globe,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';

const FAANG_TRACKS = [
  {
    id: 'amazon',
    name: 'Amazon Bar Raiser',
    tagline: '16 Leadership Principles & Data-Driven Rigor',
    accent: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
    icon: '📦',
    description: 'Amazon interviews strictly test whether you raise the hiring bar against their 16 Leadership Principles. Expect deep probing into metrics, ownership, and disagreeing with leadership.',
    principles: [
      'Customer Obsession', 'Ownership', 'Invent & Simplify', 'Are Right, A Lot',
      'Learn & Be Curious', 'Hire & Develop Best', 'Insist on Highest Standards',
      'Think Big', 'Bias for Action', 'Frugality', 'Earn Trust', 'Dive Deep',
      'Have Backbone; Disagree & Commit', 'Deliver Results'
    ],
    questions: [
      {
        q: 'Tell me about a time you had to make a critical engineering decision with 60% of the information available. How did you balance speed vs risk?',
        lp: 'Bias for Action & Dive Deep'
      },
      {
        q: 'Describe a situation where a stakeholder pushed for a short-term workaround that compromised architecture. How did you handle it?',
        lp: 'Have Backbone; Disagree and Commit & Ownership'
      },
      {
        q: 'Give an example of an architectural failure or outage you directly owned. What was the post-mortem corrective action?',
        lp: 'Customer Obsession & Ownership'
      }
    ]
  },
  {
    id: 'google',
    name: 'Google "Googliness" & Planetary Scale',
    tagline: 'Intellectual Humility & Distributed Systems',
    accent: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
    icon: '🔵',
    description: 'Google looks for Googliness: thriving in ambiguity, intellectual humility, doing what is right for the user, and designing systems that scale seamlessly to 1 billion users.',
    principles: [
      'Navigating Ambiguity', 'Doing the Right Thing', 'Valuing Diversity & Feedback',
      'Intellectual Humility', 'Planetary Scalability', 'Algorithmic Excellence'
    ],
    questions: [
      {
        q: 'How would you architect a distributed global counter that handles 10 million increments per second with eventual consistency?',
        lp: 'Planetary Scalability & Algorithmic Excellence'
      },
      {
        q: 'Tell me about a time you discovered you were wrong about a major technical approach after debating with a colleague.',
        lp: 'Intellectual Humility & Doing the Right Thing'
      },
      {
        q: 'You are assigned a legacy system with zero documentation and flaky tests. What is your first 30-day gameplan?',
        lp: 'Navigating Ambiguity & High Standards'
      }
    ]
  },
  {
    id: 'meta',
    name: 'Meta Velocity & Impact',
    tagline: 'Move Fast & Live in the Future',
    accent: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-400',
    icon: '♾️',
    description: 'Meta values engineering speed, measurable product impact, building awesome things, and distributed real-time data pipelines.',
    principles: [
      'Move Fast', 'Focus on Long-Term Impact', 'Build Awesome Things',
      'Live in the Future', 'Be Direct & Respectful'
    ],
    questions: [
      {
        q: 'Tell me about a project where you shipped an MVP to production in days rather than months. How did you guarantee reliability?',
        lp: 'Move Fast & Focus on Impact'
      },
      {
        q: 'How would you design a real-time notification service delivering 500k push events per second to mobile devices?',
        lp: 'Live in the Future & High Scale'
      }
    ]
  }
];

export default function FAANGCompanyPacks({ onStartInterview }) {
  const [selectedTrack, setSelectedTrack] = useState(FAANG_TRACKS[0]);
  const [selectedQuestion, setSelectedQuestion] = useState(FAANG_TRACKS[0].questions[0]);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    setSelectedQuestion(track.questions[0]);
    setCandidateAnswer('');
    setEvaluation(null);
  };

  const handleEvaluate = () => {
    if (!candidateAnswer.trim()) return;

    const lower = candidateAnswer.toLowerCase();
    const hasMetric = /\b\d+[\d,.]*\s*(%|users|ms|seconds|dollars|\$|k|m)\b/i.test(lower);
    const hasOwnership = /\b(i led|i decided|i built|i analyzed|my responsibility|i proposed)\b/i.test(lower);
    const hasResult = /\b(result|outcome|improved|reduced|decreased|saved|delivered)\b/i.test(lower);

    let score = 75;
    const detectedLPs = [];

    if (hasOwnership) {
      score += 10;
      detectedLPs.push('Ownership');
    }
    if (hasMetric) {
      score += 10;
      detectedLPs.push('Dive Deep (Quantified Metrics)');
    }
    if (hasResult) {
      score += 5;
      detectedLPs.push('Deliver Results');
    }

    if (selectedTrack.id === 'amazon' && lower.includes('customer')) {
      detectedLPs.push('Customer Obsession');
    }
    if (selectedTrack.id === 'google' && (lower.includes('scale') || lower.includes('learned') || lower.includes('mistake'))) {
      detectedLPs.push('Intellectual Humility & Scale');
    }

    setEvaluation({
      score: Math.min(98, score),
      detectedLPs: detectedLPs.length > 0 ? detectedLPs : ['General Competency'],
      feedback: hasMetric
        ? 'Strong response with quantified impact. Interviewer will appreciate the concrete data.'
        : 'Good narrative structure, but Amazon & Google bar raisers demand quantifiable metrics (% improvement, latency reduction, scale).'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Building2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">FAANG & Bar Raiser Simulation Packs</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Practice specialized interview rubrics for Amazon (16 LPs), Google (Googliness & Scale), and Meta (Speed & Impact).
            </p>
          </div>
        </div>

        {/* Track Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FAANG_TRACKS.map((track) => {
            const isSelected = selectedTrack.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`p-5 rounded-2xl border transition cursor-pointer space-y-2.5 relative ${
                  isSelected
                    ? `${track.accent} ring-2 ring-indigo-500/40 shadow-xl`
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{track.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
                    {track.questions.length} Scenario Probes
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{track.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{track.tagline}</p>
              </div>
            );
          })}
        </div>

        {/* Active Track Workbench */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Core Evaluated Principles in {selectedTrack.name}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedTrack.principles.map((p, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Scenario Questions */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Select Bar Raiser Scenario:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedTrack.questions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedQuestion(item); setCandidateAnswer(''); setEvaluation(null); }}
                  className={`p-4 rounded-xl border text-left text-xs transition space-y-1.5 ${
                    selectedQuestion.q === item.q
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono inline-block">
                    Target: {item.lp}
                  </span>
                  <p className="font-medium leading-relaxed">{item.q}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Answer Arena */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Your STAR Method Response:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Aim for Situation → Task → Action → Result (with numbers)
              </span>
            </div>

            <textarea
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Structure your answer using STAR: At Company X, we faced a high-severity outage where P99 latency spiked to 2.4s (Situation). I was tasked with restoring SLA within 30 minutes (Task). I initiated a thread dump, discovered deadlocks in our connection pool, and deployed a connection queue throttle (Action). This reduced latency back to 140ms and prevented cascading failures across 4 downstream services (Result)..."
              rows={6}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none transition leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {candidateAnswer.length} characters entered
              </span>
              <button
                onClick={handleEvaluate}
                disabled={!candidateAnswer.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Score Against {selectedTrack.name} Rubric
              </button>
            </div>

            {/* Evaluation Display */}
            {evaluation && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 mt-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Bar Raiser Score: <span className="font-mono text-emerald-400 text-sm">{evaluation.score}%</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {evaluation.score >= 85 ? 'Passed Bar Raiser Standard' : 'Borderline / Needs Metric Rigor'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Demonstrated Leadership Principles / Values:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.detectedLPs.map((lp, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                        ✓ {lp}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-300">Feedback:</strong> {evaluation.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
