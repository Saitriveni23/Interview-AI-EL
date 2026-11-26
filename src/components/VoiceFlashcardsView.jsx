import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Mic,
  MicOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Flame,
  RotateCcw,
  Volume2
} from 'lucide-react';

const FLASHCARD_DRILLS = [
  {
    id: 1,
    topic: 'REST Architecture & Systems',
    prompt: 'Explain what idempotency means in RESTful APIs and which HTTP methods are idempotent.',
    keywords: ['put', 'delete', 'get', 'side-effect', 'same result', 'retry', 'post is not'],
    idealAnswerSummary: 'An operation is idempotent if applying it multiple times produces the identical server state as applying it once. GET, PUT, DELETE, and HEAD are idempotent; POST and PATCH are typically not.'
  },
  {
    id: 2,
    topic: 'Databases & Concurrency',
    prompt: 'Explain the difference between Optimistic and Pessimistic concurrency control and when to use each.',
    keywords: ['lock', 'version', 'contention', 'timestamp', 'deadlock', 'high read', 'transaction'],
    idealAnswerSummary: 'Pessimistic locking acquires database row/table locks before executing transactions, ideal for high-write collision workloads. Optimistic concurrency checks version numbers or timestamps at commit time without holding locks, ideal for high-read low-collision environments.'
  },
  {
    id: 3,
    topic: 'Distributed Systems',
    prompt: 'Explain the CAP Theorem and why distributed systems must choose between Consistency and Availability during network partitions.',
    keywords: ['consistency', 'availability', 'partition', 'network split', 'pacelc', 'eventual consistency'],
    idealAnswerSummary: 'In a distributed system, network partitions (P) are inevitable. When a partition occurs, the system must either refuse writes to guarantee strong consistency (CP) or accept writes to maintain availability at the cost of stale reads (AP).'
  },
  {
    id: 4,
    topic: 'JavaScript Internals',
    prompt: 'Explain how the Node.js event loop coordinates microtasks (Promises) and macrotasks (timers).',
    keywords: ['microtask', 'macrotask', 'call stack', 'libuv', 'process.nexttick', 'settimeout', 'queue'],
    idealAnswerSummary: 'The event loop processes microtasks (Promise reactions and process.nextTick) immediately after the current synchronous frame finishes, completely draining the microtask queue before moving to next-phase macrotasks (setTimeout, setImmediate, I/O).'
  },
  {
    id: 5,
    topic: 'Caching & Data Structures',
    prompt: 'Explain how an LRU Cache operates and how to achieve O(1) time complexity for get and put.',
    keywords: ['doubly linked list', 'hash map', 'o(1)', 'eviction', 'head', 'tail'],
    idealAnswerSummary: 'An LRU cache combines a Hash Map for O(1) key-to-node lookups and a Doubly Linked List for O(1) insertion, removal, and moving recently accessed items to the head.'
  }
];

export default function VoiceFlashcardsView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streakCount, setStreakCount] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const currentCard = FLASHCARD_DRILLS[currentIndex];

  const startDrill = () => {
    setIsActive(true);
    setTimeLeft(60);
    setTranscript('');
    setFeedback(null);

    // Timer countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopListening();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    startListening();
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome/Edge or type your response.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);

      rec.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setTranscript(text.trim());
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (_) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const finishDrill = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopListening();
    setIsActive(false);

    // Score based on keywords
    const lower = transcript.toLowerCase();
    const matched = currentCard.keywords.filter(k => lower.includes(k));
    const coverage = Math.round((matched.length / currentCard.keywords.length) * 100);

    const score = Math.min(100, Math.max(40, coverage + (transcript.length > 80 ? 25 : 10)));
    const passed = score >= 65;

    if (passed) setStreakCount(prev => prev + 1);

    setFeedback({
      score,
      passed,
      matched,
      missed: currentCard.keywords.filter(k => !lower.includes(k)),
      timeTaken: 60 - timeLeft
    });
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % FLASHCARD_DRILLS.length);
    setTimeLeft(60);
    setTranscript('');
    setFeedback(null);
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopListening();
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Zap className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">60-Second Rapid Voice Flashcards</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              High-speed oral recall drills. Explain fundamental systems and architecture concepts out loud in 60 seconds.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-500 animate-pulse" />
            <span className="text-white font-bold">{streakCount} Drill Streak</span>
          </div>
        </div>

        {/* Active Flashcard Arena */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Progress & Topic indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-semibold">
              Card {currentIndex + 1} of {FLASHCARD_DRILLS.length} · {currentCard.topic}
            </span>

            {/* Countdown timer badge */}
            <div className={`flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1 rounded-xl border ${
              timeLeft <= 10
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-slate-950 text-slate-200 border-slate-800'
            }`}>
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
            </div>
          </div>

          {/* Flashcard Prompt */}
          <div className="space-y-2 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              "{currentCard.prompt}"
            </h2>
            <p className="text-xs text-slate-400">
              Speak clearly into your microphone. Cover core definitions, practical trade-offs, and edge cases.
            </p>
          </div>

          {/* Controls & Recording */}
          {!isActive && !feedback && (
            <div className="flex justify-center py-4">
              <button
                onClick={startDrill}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2.5 text-sm"
              >
                <Mic className="w-4 h-4" />
                <span>Start 60s Voice Drill</span>
              </button>
            </div>
          )}

          {isActive && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 min-h-[100px] text-sm text-slate-200 font-sans leading-relaxed">
                {transcript ? (
                  transcript
                ) : (
                  <span className="text-slate-500 italic flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    Listening to your voice... Start speaking now.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  {transcript.split(/\s+/).filter(Boolean).length} words transcribed
                </span>
                <button
                  onClick={finishDrill}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Submit & Score Drill
                </button>
              </div>
            </div>
          )}

          {/* Feedback & Benchmark Review */}
          {feedback && (
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    Oral Fluency Score: <span className="font-mono text-emerald-400">{feedback.score}%</span>
                  </span>
                </div>
                <span className="text-xs text-slate-400">Finished in {feedback.timeTaken}s</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Keywords Covered ({feedback.matched.length}/{currentCard.keywords.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {feedback.matched.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      ✓ {k}
                    </span>
                  ))}
                  {feedback.missed.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                      ✗ {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-xs space-y-1">
                <span className="text-indigo-300 font-bold block">Ideal Benchmark Answer:</span>
                <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                  {currentCard.idealAnswerSummary}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={nextCard}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <span>Next Flashcard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
