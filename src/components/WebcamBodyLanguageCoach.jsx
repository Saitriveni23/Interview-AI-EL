import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Eye,
  Sun,
  Maximize2,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { analyzeVideoFrame } from '../services/videoAnalysisService.js';

export default function WebcamBodyLanguageCoach({ onMetricsUpdate }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [metrics, setMetrics] = useState({
    eyeContactScore: 84,
    framingScore: 88,
    lightingScore: 78,
    composureScore: 85,
    tips: ['Looking confident! Maintain consistent gaze toward the camera lens.']
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        setCameraActive(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setCameraActive(true);
      setHasPermission(true);

      // Analyze frames every 600ms for lightweight CPU performance
      intervalRef.current = setInterval(() => {
        if (canvasRef.current && videoRef.current) {
          const res = analyzeVideoFrame(canvasRef.current, videoRef.current);
          setMetrics(res);
          if (onMetricsUpdate) onMetricsUpdate(res);
        }
      }, 600);
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      setHasPermission(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Eye className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Video & Body Language Coach
            </h3>
            <span className="text-[10px] text-slate-500">Live eye contact, framing & composure analysis</span>
          </div>
        </div>

        <button
          onClick={cameraActive ? stopCamera : startCamera}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            cameraActive
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
          }`}
        >
          {cameraActive ? (
            <>
              <VideoOff className="w-3.5 h-3.5" />
              <span>Turn Off Camera</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5" />
              <span>Enable Video Coach</span>
            </>
          )}
        </button>
      </div>

      {/* Main Video Box & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Video stream viewport */}
        <div className="md:col-span-7 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-300">Camera is paused</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Turn on your camera to get real-time feedback on your eye contact, face centering, and posture during answers.
              </p>
            </div>
          )}

          {/* Hidden canvas for pixel analysis */}
          <canvas ref={canvasRef} width={240} height={180} className="hidden" />

          {/* Live HUD overlay on video */}
          {cameraActive && (
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Vision HUD
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 border border-slate-700">
                Eye Contact: {metrics.eyeContactScore}%
              </span>
            </div>
          )}
        </div>

        {/* Real-time telemetry cards */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Eye Contact score */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Eye className="w-3 h-3 text-indigo-400" /> Eye Contact
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-mono font-bold ${
                  metrics.eyeContactScore >= 75 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {metrics.eyeContactScore}%
                </span>
                <span className="text-[10px] text-slate-400">
                  {metrics.eyeContactScore >= 75 ? 'Optimal' : 'Low'}
                </span>
              </div>
            </div>

            {/* Composure score */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> Composure
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold text-purple-400">
                  {metrics.composureScore}%
                </span>
                <span className="text-[10px] text-slate-400">Calm</span>
              </div>
            </div>

            {/* Framing status */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-emerald-400" /> Framing
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold text-emerald-400">
                  {metrics.framingScore}%
                </span>
                <span className="text-[10px] text-slate-400">Centered</span>
              </div>
            </div>

            {/* Lighting status */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> Lighting
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-mono font-bold text-amber-400">
                  {metrics.lightingScore}%
                </span>
                <span className="text-[10px] text-slate-400">Good</span>
              </div>
            </div>
          </div>

          {/* Live Coaching Tip Banner */}
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs space-y-1">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Real-time Vision Advice:
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {metrics.tips[0] || 'Keep head centered and gaze level with the top third of the frame.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
