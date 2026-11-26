import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Server,
  Globe,
  Radio,
  Zap,
  ShieldCheck,
  AlertTriangle,
  PlayCircle,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const COMPONENT_TYPES = [
  { id: 'client', name: 'Web/Mobile Client', icon: Globe, category: 'Frontend', color: 'border-blue-500/50 bg-blue-950/40 text-blue-300' },
  { id: 'cdn', name: 'Global CDN', icon: Radio, category: 'Edge', color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300' },
  { id: 'lb', name: 'Load Balancer (ALB)', icon: Server, category: 'Network', color: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300' },
  { id: 'api_gw', name: 'API Gateway', icon: ShieldCheck, category: 'Gateway', color: 'border-purple-500/50 bg-purple-950/40 text-purple-300' },
  { id: 'service', name: 'Microservice Cluster', icon: Cpu, category: 'Compute', color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300' },
  { id: 'redis', name: 'Redis Cache Tier', icon: Zap, category: 'Cache', color: 'border-rose-500/50 bg-rose-950/40 text-rose-300' },
  { id: 'kafka', name: 'Kafka / Event Bus', icon: Layers, category: 'Messaging', color: 'border-amber-500/50 bg-amber-950/40 text-amber-300' },
  { id: 'postgres', name: 'PostgreSQL (Primary)', icon: Database, category: 'Database', color: 'border-teal-500/50 bg-teal-950/40 text-teal-300' },
  { id: 'replica', name: 'Read Replicas (x3)', icon: Database, category: 'Database', color: 'border-teal-400/30 bg-teal-950/20 text-teal-400' },
  { id: 'nosql', name: 'NoSQL / DynamoDB', icon: Database, category: 'Storage', color: 'border-orange-500/50 bg-orange-950/40 text-orange-300' },
];

const PRESETS = [
  {
    title: 'URL Shortener (TinyURL)',
    nodes: ['client', 'cdn', 'lb', 'api_gw', 'service', 'redis', 'postgres', 'replica'],
    description: 'High read-to-write ratio (100:1), distributed hashing & aggressive Redis caching'
  },
  {
    title: 'Real-Time Chat (WhatsApp)',
    nodes: ['client', 'lb', 'service', 'redis', 'kafka', 'nosql'],
    description: 'WebSocket gateway with Redis Pub/Sub, Kafka message persistence, and Cassandra/DynamoDB for chat history'
  },
  {
    title: 'Flash Sale E-Commerce',
    nodes: ['client', 'cdn', 'lb', 'api_gw', 'service', 'redis', 'kafka', 'postgres'],
    description: 'Heavy queue buffering (Kafka) to protect inventory database against 100k QPS traffic surges'
  }
];

export default function SystemDesignWhiteboard({ onSelectChallenge }) {
  const [activeNodes, setActiveNodes] = useState([
    'client', 'cdn', 'lb', 'api_gw', 'service', 'redis', 'postgres'
  ]);
  const [inspectionResult, setInspectionResult] = useState(null);
  const [candidateDefense, setCandidateDefense] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [defenseFeedback, setDefenseFeedback] = useState(null);

  const handleAddNode = (id) => {
    if (!activeNodes.includes(id)) {
      setActiveNodes([...activeNodes, id]);
    }
  };

  const handleRemoveNode = (id) => {
    setActiveNodes(activeNodes.filter(n => n !== id));
  };

  const handleLoadPreset = (preset) => {
    setActiveNodes(preset.nodes);
    setInspectionResult(null);
    setDefenseFeedback(null);
  };

  const inspectArchitecture = () => {
    const hasCache = activeNodes.includes('redis');
    const hasQueue = activeNodes.includes('kafka');
    const hasReplica = activeNodes.includes('replica');
    const hasDB = activeNodes.includes('postgres') || activeNodes.includes('nosql');
    const hasLB = activeNodes.includes('lb');

    const issues = [];
    const questions = [];

    if (!hasLB) {
      issues.push('Missing Load Balancer: Direct traffic to services creates a single point of failure.');
      questions.push('How will traffic be distributed evenly across instances if traffic triples?');
    }

    if (!hasCache) {
      issues.push('No in-memory caching tier: Repeated read queries will overwhelm the database.');
      questions.push('What strategy will you use to achieve sub-10ms response times for hot keys?');
    }

    if (hasDB && !hasReplica) {
      issues.push('Single database node with no read replicas: Read scalability bottleneck & failover risk.');
      questions.push('What happens to read availability if your primary database instance crashes?');
    }

    if (!hasQueue) {
      issues.push('Synchronous request pipeline: No queue decoupling for asynchronous write spikes.');
      questions.push('How do you prevent cascading service failures when downstream dependencies slow down?');
    }

    // Default good architectural questions
    if (questions.length < 3) {
      questions.push('How do you ensure cache and database consistency on rapid write updates?');
      questions.push('Explain your database partitioning / sharding key selection for 1 billion rows.');
      questions.push('What is your circuit breaker timeout and fallback strategy under high tail latency?');
    }

    const score = Math.max(50, 100 - (issues.length * 12));

    const result = {
      score,
      issues,
      questions,
      critique: issues.length === 0
        ? 'Well-architected, resilient distributed system with decoupled layers and redundant storage.'
        : `Identified ${issues.length} architectural vulnerabilities. Interviewer will probe these failure modes.`
    };

    setInspectionResult(result);
    setSelectedQuestion(questions[0]);
  };

  const handleEvaluateDefense = () => {
    if (!candidateDefense.trim() || !selectedQuestion) return;

    const lower = candidateDefense.toLowerCase();
    const hasCacheStrategy = lower.includes('cache-aside') || lower.includes('write-through') || lower.includes('ttl') || lower.includes('invalidation');
    const hasReplication = lower.includes('replica') || lower.includes('failover') || lower.includes('leader') || lower.includes('wal');
    const hasResilience = lower.includes('circuit') || lower.includes('exponential') || lower.includes('idempotent') || lower.includes('retry');

    let quality = 'Moderate';
    let feedback = 'Good explanation, but emphasize concrete numbers and operational trade-offs.';

    if (candidateDefense.length > 80 && (hasCacheStrategy || hasReplication || hasResilience)) {
      quality = 'Senior Engineer / Staff Level';
      feedback = 'Outstanding technical justification! Demonstrates clear mastery of failure modes and distributed systems trade-offs.';
    } else if (candidateDefense.length < 30) {
      quality = 'Vague / Needs Depth';
      feedback = 'Too brief. In an L5/L6 system design interview, explain the exact mechanism, data flow, and recovery time objective (RTO).';
    }

    setDefenseFeedback({ quality, feedback });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Layers className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Interactive System Design Whiteboard</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Assemble distributed system architecture components, inspect single points of failure, and defend technical choices with AI.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleLoadPreset(p)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Whiteboard Workspace Canvas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Active System Topology ({activeNodes.length} Components)
            </h3>
            <button
              onClick={() => setActiveNodes([])}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Canvas
            </button>
          </div>

          {/* Active Nodes Flow */}
          <div className="flex flex-wrap items-center gap-3 p-6 bg-slate-950 rounded-xl border border-slate-800/80 min-h-[140px]">
            {activeNodes.length === 0 ? (
              <span className="text-xs text-slate-500 italic mx-auto">
                No components added yet. Click components below to construct your architecture flow.
              </span>
            ) : (
              activeNodes.map((nodeId, idx) => {
                const comp = COMPONENT_TYPES.find(c => c.id === nodeId);
                if (!comp) return null;
                const Icon = comp.icon;
                return (
                  <React.Fragment key={nodeId}>
                    <div className={`p-3 rounded-xl border ${comp.color} flex items-center gap-2 relative group shadow-lg`}>
                      <Icon className="w-4 h-4" />
                      <div>
                        <span className="text-xs font-bold block">{comp.name}</span>
                        <span className="text-[10px] text-slate-400 block">{comp.category}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveNode(nodeId)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition ml-1"
                        title="Remove component"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {idx < activeNodes.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Component Palette Selector */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
              Component Palette (Click to Add):
            </span>
            <div className="flex flex-wrap gap-2">
              {COMPONENT_TYPES.map((comp) => {
                const isAdded = activeNodes.includes(comp.id);
                const Icon = comp.icon;
                return (
                  <button
                    key={comp.id}
                    onClick={() => handleAddNode(comp.id)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                      isAdded
                        ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{comp.name}</span>
                    <Plus className="w-3 h-3 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Inspection Trigger */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={inspectArchitecture}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Inspect Architecture with AI
            </button>
          </div>
        </div>

        {/* AI Architecture Critique & Cross-Examination Section */}
        {inspectionResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 font-mono text-lg">
                  {inspectionResult.score}%
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">System Design Resilience Score</h3>
                  <p className="text-xs text-slate-400">{inspectionResult.critique}</p>
                </div>
              </div>
            </div>

            {/* Potential Vulnerabilities */}
            {inspectionResult.issues.length > 0 && (
              <div className="p-4 bg-rose-950/30 border border-rose-500/20 rounded-xl space-y-2">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Identified Bottlenecks & Failure Modes:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {inspectionResult.issues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Senior Engineer Interrogation Questions */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Interviewer Technical Challenges:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {inspectionResult.questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedQuestion(q); setCandidateDefense(''); setDefenseFeedback(null); }}
                    className={`p-3 rounded-xl border text-left text-xs transition space-y-1 ${
                      selectedQuestion === q
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 block">Probe #{i + 1}</span>
                    <span className="font-semibold block">{q}</span>
                  </button>
                ))}
              </div>

              {/* Defense Input Form */}
              {selectedQuestion && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-semibold text-indigo-300 block">
                    Defend Architecture Decision: "{selectedQuestion}"
                  </span>
                  <textarea
                    value={candidateDefense}
                    onChange={(e) => setCandidateDefense(e.target.value)}
                    placeholder="Explain your mitigation strategy (e.g., Cache-aside pattern with 5min TTL, Kafka partition keys, Read-replica failover via pg_auto_failover)..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-sans"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Include concrete trade-offs and latency expectations.
                    </span>
                    <button
                      onClick={handleEvaluateDefense}
                      disabled={!candidateDefense.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition"
                    >
                      Evaluate Defense Response
                    </button>
                  </div>

                  {defenseFeedback && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1 mt-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">Bar Evaluation: {defenseFeedback.quality}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{defenseFeedback.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
