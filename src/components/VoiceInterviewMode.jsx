import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, SkipForward, Send, Clock } from 'lucide-react';
import {
  analyzeTranscript,
  getConfidenceLevel,
  detectFillers,
  formatDuration,
} from '../services/voiceAnalysisService.js';

// ─── Circular progress SVG ring ───────────────────────────────────────────────
function CircularTimer({ timeLeft, totalTime, urgent }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const fraction = totalTime > 0 ? timeLeft / totalTime : 0;
  const offset = circumference * (1 - fraction);
  const strokeColor = urgent ? '#ef4444' : '#6366f1';

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="block">
      {/* Background track */}
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke="#1e293b"
        strokeWidth="8"
      />
      {/* Progress arc */}
      <circle
        cx="55"
        cy="55"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
      />
      {/* Time text */}
      <text
        x="55"
        y="51"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={urgent ? '#ef4444' : '#ffffff'}
        fontSize="16"
        fontWeight="bold"
        fontFamily="monospace"
      >
        {formatDuration(timeLeft)}
      </text>
      {urgent && (
        <text
          x="55"
          y="70"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ef4444"
          fontSize="9"
          fontFamily="sans-serif"
        >
          Wrap up!
        </text>
      )}
    </svg>
  );
}

// ─── Confidence badge ─────────────────────────────────────────────────────────
function ConfidenceBadge({ level }) {
  const config = {
    confident: { label: '✅ Confident', cls: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
    nervous:   { label: '😰 Nervous',   cls: 'bg-red-500/20 border-red-500/40 text-red-300' },
    rushed:    { label: '⚡ Rushed',    cls: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' },
  };
  const { label, cls } = config[level] || config.confident;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoiceInterviewMode({
  question,
  questionNumber,
  totalQuestions,
  timeLimit = 120,
  onAnswerSubmit,
  onSkip,
}) {
  // Recording / transcript state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Audio analysis state
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Speaking
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Derived metrics
  const fillerData = detectFillers(transcript);
  const fillerCount = fillerData.length;
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const elapsed = timeLimit - timeLeft;
  const speakingRate = elapsed > 0 ? parseFloat((wordCount / elapsed).toFixed(2)) : 0;
  const confidenceLevel = getConfidenceLevel(speakingRate, volume);
  const isUrgent = timeLeft <= 15 && timerActive;

  // ─── Reset everything when question changes ─────────────────────────────────
  useEffect(() => {
    stopRecording();
    setTranscript('');
    setInterimText('');
    setTimeLeft(timeLimit);
    setTimerActive(false);
    clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, timeLimit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Timer countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          handleStopListening();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive]);

  // ─── Web Audio API volume meter ─────────────────────────────────────────────
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setVolume(Math.min(1, avg / 128));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch (_) {
      // Audio analysis unavailable — keep default volume
    }
  };

  const stopAudioAnalysis = () => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  // ─── SpeechRecognition ──────────────────────────────────────────────────────
  const handleStopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    stopAudioAnalysis();
    setIsListening(false);
    setInterimText('');
  }, []);

  const handleStartListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTimerActive(true);
      startAudioAnalysis();
    };

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      if (final) setTranscript(prev => (prev + final).trimStart());
      setInterimText(interim);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setInterimText('');
      stopAudioAnalysis();
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      stopAudioAnalysis();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopRecording = useCallback(() => {
    handleStopListening();
    clearInterval(timerRef.current);
    setTimerActive(false);
  }, [handleStopListening]);

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      handleStartListening();
    }
  };

  // ─── TTS: speak question ─────────────────────────────────────────────────────
  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ─── Submit answer ───────────────────────────────────────────────────────────
  const handleSubmit = () => {
    stopRecording();
    window.speechSynthesis?.cancel();
    const duration = timeLimit - timeLeft;
    const analysis = analyzeTranscript(transcript, duration);
    onAnswerSubmit?.(transcript.trim(), {
      fillerCount: analysis.fillerCount,
      duration,
      confidenceLevel,
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-6 text-white">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
            🎙️ Voice Mode
          </span>
          <span className="text-xs text-slate-500">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSpeakQuestion}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
            isSpeaking
              ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          {isSpeaking ? 'Stop Reading' : '🔊 Hear Question'}
        </button>
      </div>

      {/* Question */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <p className="text-white font-medium leading-relaxed">{question}</p>
      </div>

      {/* Timer + Mic row */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Circular timer */}
        <div className={isUrgent ? 'animate-pulse' : ''}>
          <CircularTimer timeLeft={timeLeft} totalTime={timeLimit} urgent={isUrgent} />
        </div>

        {/* Central mic button */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isListening
                ? 'bg-red-600 border-4 border-red-400 animate-pulse shadow-red-500/40'
                : 'bg-indigo-600 hover:bg-indigo-500 border-4 border-indigo-400 shadow-indigo-500/30'
            }`}
            title={isListening ? 'Stop recording' : 'Start recording'}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          <span className="text-xs text-slate-400">
            {isListening ? (
              <span className="text-red-400 font-semibold animate-pulse">● Recording…</span>
            ) : (
              'Tap to record your answer'
            )}
          </span>
        </div>

        {/* Live metrics panel */}
        <div className="flex flex-col gap-2 items-end text-right min-w-[120px]">
          <ConfidenceBadge level={confidenceLevel} />
          <span className="text-xs text-slate-400">
            Words: <span className="text-white font-mono">{wordCount}</span>
          </span>
          <span className="text-xs text-slate-400">
            Rate:{' '}
            <span className="text-white font-mono">{speakingRate} w/s</span>
          </span>
          {/* Filler counter */}
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
              fillerCount > 3
                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Fillers:{' '}
            <span className={fillerCount > 3 ? 'text-yellow-200' : 'text-white'}>
              {fillerCount}
            </span>
            {fillerCount > 3 && ' ⚠️'}
          </span>
        </div>
      </div>

      {/* Volume bar */}
      {isListening && (
        <div className="space-y-1">
          <p className="text-[11px] text-slate-500">Microphone level</p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-100"
              style={{ width: `${Math.round(volume * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Live transcript */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-400">Live Transcript</label>
        <div className="min-h-[90px] p-4 rounded-xl bg-slate-950 border border-slate-700 text-sm leading-relaxed">
          <span className="text-white whitespace-pre-wrap">{transcript}</span>
          {interimText && (
            <span className="text-slate-500 italic"> {interimText}</span>
          )}
          {!transcript && !interimText && (
            <span className="text-slate-600 italic">Your spoken words will appear here…</span>
          )}
        </div>
      </div>

      {/* Filler word highlights */}
      {fillerCount > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-yellow-300 mb-1">
            Filler words detected ({fillerCount}):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set(fillerData.map(f => f.word))].map(w => (
              <span key={w} className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-200 text-xs font-mono border border-yellow-500/30">
                "{w}" ×{fillerData.filter(f => f.word === w).length}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onSkip}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
        >
          <SkipForward className="w-4 h-4" />
          Skip Question
        </button>

        <button
          type="button"
          disabled={!transcript.trim()}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
          Submit Answer
        </button>
      </div>
    </div>
  );
}
