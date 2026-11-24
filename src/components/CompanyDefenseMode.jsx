import React, { useState } from 'react';
import {
  Building2,
  Zap,
  Users,
  Globe,
  ChevronRight,
  Sparkles,
  BarChart2,
  Cpu,
  Layers,
  Star,
  CheckCircle
} from 'lucide-react';

// ── Company configuration ────────────────────────────────────────────────────
const COMPANY_CONFIG = {
  Google: {
    label: 'Google',
    accent: '#4285f4',
    accentBg: 'rgba(66,133,244,0.08)',
    accentBorder: 'rgba(66,133,244,0.25)',
    emoji: '🔵',
    icon: <Globe className="w-4 h-4" />,
    tagline: 'Deep Technical Accuracy · Algorithm Excellence · Scale',
    style: 'Deep technical depth, algorithmic correctness, and mathematical rigour. Expect "Why not X instead?" and "Prove the complexity." Interviewers want to see that you deeply understand the internals, not just the surface API.',
    questionStyle: [
      'Prove the time/space complexity of your approach.',
      'Why did you choose this algorithm over a simpler brute-force?',
      'How does this scale to 1 billion records?',
      'What would break this design and how would you detect it?',
      'Walk me through your most algorithmic solution ever shipped.'
    ],
    generateFromClaim: (claim) => [
      `From your claim "${claim}" — what is the asymptotic complexity of the core algorithm, and can you derive it rigorously?`,
      `Google reviewers ask: for the ${claim} system, what distributed consistency model did you use and why (CAP theorem tradeoffs)?`,
      `Describe the exact data structure that made "${claim}" efficient at scale — why not a simpler alternative?`,
      `What failure scenario would bring down "${claim}", and how would your on-call engineer detect it in production?`
    ]
  },
  Amazon: {
    label: 'Amazon',
    accent: '#ff9900',
    accentBg: 'rgba(255,153,0,0.08)',
    accentBorder: 'rgba(255,153,0,0.25)',
    emoji: '🟡',
    icon: <BarChart2 className="w-4 h-4" />,
    tagline: 'STAR Format · Leadership Principles · Metric-Heavy',
    style: 'Amazon is STAR-method and Leadership Principles (LP) focused. Every answer must be tied to a measurable outcome and an LP (Ownership, Dive Deep, Bias for Action, etc.). Numbers, impact, and customer obsession are mandatory.',
    questionStyle: [
      'Give me a STAR example for Ownership on this project.',
      'What was the exact customer impact — in numbers?',
      'Tell me about a time you dived deep when others stopped at surface level.',
      'What would you do differently to Bias for Action on this initiative?',
      'How does this deliverable tie back to customer obsession?'
    ],
    generateFromClaim: (claim) => [
      `STAR format required — tell me about a time you showed Ownership related to "${claim}": exact situation, your actions, measurable result.`,
      `Amazon LP "Dive Deep": what was the root cause you discovered for the core problem in "${claim}" that your team missed?`,
      `Give me the exact metric: what was the customer impact (in numbers) of "${claim}"? How was it measured?`,
      `"Bias for Action" check: how did you make a key decision for "${claim}" with incomplete data, and what was the outcome?`
    ]
  },
  Microsoft: {
    label: 'Microsoft',
    accent: '#00a4ef',
    accentBg: 'rgba(0,164,239,0.08)',
    accentBorder: 'rgba(0,164,239,0.25)',
    emoji: '🔷',
    icon: <Layers className="w-4 h-4" />,
    tagline: 'Collaborative Problem-Solving · System Design · Growth Mindset',
    style: 'Microsoft values collaborative, empathetic problem-solving and growth mindset. System design questions are broad and holistic. Expect "How would you work with another team?" and "What did you learn from failure?"',
    questionStyle: [
      'Walk me through your system design decision-making process.',
      'How did you collaborate across teams to deliver this?',
      'What did you learn from a failure on this project?',
      'How would you mentor a junior engineer to replicate your approach?',
      'How did you handle technical debt while moving fast?'
    ],
    generateFromClaim: (claim) => [
      `System design walkthrough for "${claim}": draw the full architecture — services, data stores, APIs, caches, and failure boundaries.`,
      `Microsoft values growth mindset: what failed during "${claim}" and what did you change as a result?`,
      `Cross-team collaboration: for "${claim}", how did you align stakeholders from different orgs or domains?`,
      `Technical debt question: what shortcuts were taken in "${claim}" and what's your plan to pay them back?`
    ]
  },
  Meta: {
    label: 'Meta',
    accent: '#1877f2',
    accentBg: 'rgba(24,119,242,0.08)',
    accentBorder: 'rgba(24,119,242,0.25)',
    emoji: '🔵',
    icon: <Users className="w-4 h-4" />,
    tagline: 'Billions of Users · Speed of Iteration · Data-Driven',
    style: 'Meta pushes scale (billions of users) and velocity. Expect "How does this run at Meta scale?" and "What would you ship in 2 weeks?" Data-driven decisions, A/B testing culture, and product-engineering alignment are key.',
    questionStyle: [
      'How would this scale to serve 3 billion users simultaneously?',
      'What would you ship as an MVP in two weeks?',
      'How would you A/B test this feature and what metric defines success?',
      'What is the latency target and how do you enforce it at this scale?',
      'How does this feature align with engagement metrics?'
    ],
    generateFromClaim: (claim) => [
      `Meta scale question: how would you redesign "${claim}" to serve 3 billion concurrent users globally? What fundamentally changes?`,
      `Ship velocity: what is the minimum viable version of "${claim}" you could ship in 2 weeks? What would you cut?`,
      `A/B testing culture: for "${claim}", how would you measure success — what is the primary metric and guardrail metric?`,
      `Data-driven: what data did you use to make the core product decision in "${claim}" and what would change your mind?`
    ]
  },
  Apple: {
    label: 'Apple',
    accent: '#888888',
    accentBg: 'rgba(136,136,136,0.08)',
    accentBorder: 'rgba(136,136,136,0.25)',
    emoji: '⚫',
    icon: <Star className="w-4 h-4" />,
    tagline: 'Detail & Craft · User Experience · Engineering Excellence',
    style: 'Apple is obsessive about craft, design quality, and user experience even in backend engineering. Interviewers ask about edge cases, accessibility, privacy, and polish. "What would the user see when this fails?" is common.',
    questionStyle: [
      'What happens to the user experience when this feature partially fails?',
      'Walk me through the edge cases you handled.',
      'How did you approach accessibility in this component?',
      'What privacy or data handling considerations did you make?',
      'How did you ensure the experience felt native and polished?'
    ],
    generateFromClaim: (claim) => [
      `Apple craft question: for "${claim}", what is the user experience when it partially fails — what does the user see and feel?`,
      `Edge case deep-dive for "${claim}": list the top 5 edge cases you handled and explain how each one was tested.`,
      `Privacy-first engineering: for "${claim}", what user data is handled, how is it stored, and how is it protected?`,
      `Polish and detail: what was the most subtle UX or quality improvement you made to "${claim}" that most engineers would have shipped without?`
    ]
  },
  Netflix: {
    label: 'Netflix',
    accent: '#e50914',
    accentBg: 'rgba(229,9,20,0.08)',
    accentBorder: 'rgba(229,9,20,0.25)',
    emoji: '🔴',
    icon: <Zap className="w-4 h-4" />,
    tagline: 'Freedom & Responsibility · Chaos Engineering · High Performance',
    style: 'Netflix values senior engineers who own their decisions end-to-end, embrace chaos engineering, and have strong judgement. Expect questions about resilience, context-not-control leadership, and global streaming scale.',
    questionStyle: [
      'How did you ensure resilience when a dependency went down?',
      'What would happen to your service during a Chaos Monkey event?',
      'Describe a time you made a high-stakes technical call autonomously.',
      'How did you handle global latency requirements across regions?',
      'What is your process for on-call incident response?'
    ],
    generateFromClaim: (claim) => [
      `Netflix chaos engineering: for "${claim}", what happens when a downstream dependency randomly fails mid-request? How do you degrade gracefully?`,
      `Resilience question: how did you ensure "${claim}" had no single point of failure, and how did you test it?`,
      `Freedom & Responsibility: what is the most autonomous, high-stakes technical decision you made building "${claim}", and what data informed it?`,
      `Global scale: for "${claim}", how did you handle latency requirements across multiple geographic regions and CDN layers?`
    ]
  },
  Startup: {
    label: 'Startup',
    accent: '#7c3aed',
    accentBg: 'rgba(124,58,237,0.08)',
    accentBorder: 'rgba(124,58,237,0.25)',
    emoji: '🚀',
    icon: <Cpu className="w-4 h-4" />,
    tagline: 'Full-Stack Ownership · Move Fast · Generalist Depth',
    style: 'Startup interviews test breadth, ownership, and adaptability. You may be asked to wear multiple hats — backend, infra, and product thinking. Speed of shipping and pragmatic tradeoffs matter more than perfect architecture.',
    questionStyle: [
      'What would you build in your first 30 days?',
      'Tell me about a time you owned a feature end-to-end, solo.',
      'How did you balance technical debt vs. speed of shipping?',
      'Describe your approach to on-call and incident response without an SRE team.',
      'What is the cheapest, fastest solution you would ship first?'
    ],
    generateFromClaim: (claim) => [
      `Startup ownership: for "${claim}", what parts did you build end-to-end solo, and what did you have to learn on the fly?`,
      `Pragmatic tradeoffs: in "${claim}", what technical debt did you intentionally take on to ship faster, and what is the repayment plan?`,
      `Full-stack depth: for "${claim}", can you trace the complete request lifecycle from user action to database and back?`,
      `Generalist test: if your team lost its designer tomorrow, how would you maintain the UX quality of "${claim}" while also shipping features?`
    ]
  }
};

const COMPANY_KEYS = Object.keys(COMPANY_CONFIG);

// ── Component ────────────────────────────────────────────────────────────────
export default function CompanyDefenseMode({ resumeClaims = [], onStartDefense }) {
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);

  const company = COMPANY_CONFIG[selectedCompany];

  const handlePrepare = async () => {
    if (!resumeClaims.length && !company) return;
    setGenerating(true);

    // Slight delay to show loading state
    await new Promise((r) => setTimeout(r, 400));

    // Generate company-specific questions from resume claims
    const questions = [];

    // Add generic style questions first
    questions.push(...company.questionStyle.map((q) => ({ type: 'style', text: q })));

    // Add claim-specific questions
    for (const claim of resumeClaims.slice(0, 3)) {
      const claimQuestions = company.generateFromClaim(claim);
      for (const q of claimQuestions) {
        questions.push({ type: 'claim', text: q, claim });
      }
    }

    setGeneratedQuestions(questions);
    setGenerating(false);

    if (onStartDefense) {
      onStartDefense(selectedCompany, questions);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-slate-300" />
        <h3 className="text-sm font-bold text-white">Company Defense Mode</h3>
        <span className="text-[10px] text-slate-500 ml-auto">Tailored prep per interviewer style</span>
      </div>

      {/* Company selector */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Select Target Company
        </label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {COMPANY_KEYS.map((key) => {
            const cfg = COMPANY_CONFIG[key];
            const isActive = selectedCompany === key;
            return (
              <button
                key={key}
                onClick={() => { setSelectedCompany(key); setGeneratedQuestions(null); }}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-[10px] font-bold transition ${
                  isActive
                    ? 'border-current text-white shadow-lg'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 bg-slate-900/50'
                }`}
                style={isActive ? {
                  borderColor: cfg.accent,
                  background: cfg.accentBg,
                  color: cfg.accent
                } : {}}
              >
                <span className="text-base">{cfg.emoji}</span>
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Company details card */}
      <div
        className="rounded-xl border p-4 space-y-3"
        style={{ background: company.accentBg, borderColor: company.accentBorder }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: company.accent }}>{company.icon}</span>
          <span className="text-sm font-bold text-white">{company.label} Interview Style</span>
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: company.accent, borderColor: company.accentBorder, background: company.accentBg }}
          >
            {company.tagline.split('·')[0].trim()}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{company.style}</p>

        <div className="pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Common Question Themes:</span>
          <ul className="mt-2 space-y-1.5">
            {company.questionStyle.slice(0, 3).map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: company.accent }} />
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={handlePrepare}
          disabled={generating || (!resumeClaims.length && !company)}
          className="w-full mt-2 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          style={{ background: company.accent }}
        >
          {generating ? (
            <><span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-3.5 h-3.5" /> Prepare for {company.label} Interview</>
          )}
        </button>
      </div>

      {/* Generated questions */}
      {generatedQuestions && generatedQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              {generatedQuestions.length} {company.label}-Style Questions Generated
            </span>
          </div>

          {/* Style questions */}
          {generatedQuestions.filter((q) => q.type === 'style').length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                General {company.label} Style
              </span>
              {generatedQuestions
                .filter((q) => q.type === 'style')
                .map((q, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed"
                  >
                    <span
                      className="font-bold mr-2 text-[10px] font-mono"
                      style={{ color: company.accent }}
                    >
                      Q{i + 1}
                    </span>
                    {q.text}
                  </div>
                ))}
            </div>
          )}

          {/* Claim-specific questions */}
          {generatedQuestions.filter((q) => q.type === 'claim').length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Your Resume Claim · {company.label} Lens
              </span>
              {generatedQuestions
                .filter((q) => q.type === 'claim')
                .map((q, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-3 text-xs leading-relaxed"
                    style={{ background: company.accentBg, borderColor: company.accentBorder }}
                  >
                    <span
                      className="font-bold mr-2 text-[10px] font-mono"
                      style={{ color: company.accent }}
                    >
                      🎯
                    </span>
                    <span className="text-slate-200">{q.text}</span>
                  </div>
                ))}
            </div>
          )}

          <div className="text-center pt-1">
            <span className="text-[11px] text-slate-500">
              Use the Defense Arena above to practice answering these questions
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!generatedQuestions && !generating && (
        <div className="text-center py-2 text-slate-500 text-xs">
          {resumeClaims.length === 0
            ? 'Upload a resume first to generate claim-specific company questions.'
            : `Select a company and click "Prepare for ${company.label} Interview" to generate tailored questions.`}
        </div>
      )}
    </div>
  );
}
