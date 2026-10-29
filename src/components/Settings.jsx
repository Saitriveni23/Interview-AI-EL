import React, { useState } from 'react';
import { Moon, Bell, Trash2, Shield, Info, Key } from 'lucide-react';

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
        value ? 'bg-indigo-600' : 'bg-slate-700'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleClearData = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 4000);
      return;
    }
    localStorage.removeItem('interview-ai-session');
    localStorage.removeItem('interview-ai-sessions');
    localStorage.removeItem('interview-ai-completed-tasks');
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your Interview AI preferences and data</p>
        </div>

        {/* Appearance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Appearance</h3>

          <div className="flex items-center justify-between py-3.5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-slate-400">Use dark theme throughout the app</p>
              </div>
            </div>
            <Toggle value={darkMode} onChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Notifications</p>
                <p className="text-xs text-slate-400">Session reminders and progress updates</p>
              </div>
            </div>
            <Toggle value={notifications} onChange={setNotifications} />
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Configuration</h3>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mt-0.5">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Gemini API Key</p>
              <p className="text-xs text-slate-400 mt-0.5 mb-3">
                Set <code className="text-indigo-300 bg-slate-800 px-1 rounded">GEMINI_API_KEY</code> in your
                backend <code className="text-indigo-300 bg-slate-800 px-1 rounded">.env</code> file to
                enable AI-powered study plans, question generation, and evaluation.
              </p>
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-300">
                # /interview-ai/.env<br />
                GEMINI_API_KEY=your_key_here<br />
                PORT=5001
              </div>
              <p className="text-[11px] text-emerald-400 mt-2">
                ✓ Fallback mode is active — all features work without an API key.
              </p>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Data & Privacy</h3>

          <div className="flex items-center justify-between py-3.5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Auto-Save Sessions</p>
                <p className="text-xs text-slate-400">Save analysis results to local storage</p>
              </div>
            </div>
            <Toggle value={autoSave} onChange={setAutoSave} />
          </div>

          <div className="py-3.5">
            <button
              type="button"
              onClick={handleClearData}
              className={`flex items-center gap-3 text-left w-full transition ${
                clearConfirm ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {clearConfirm ? '⚠ Click again to confirm — this cannot be undone' : 'Clear All Saved Data'}
                </p>
                <p className="text-xs text-slate-500">Delete all sessions, progress, and cached results</p>
              </div>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About</h3>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg mt-0.5">
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Interview AI v1.0</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                AI-powered interview preparation platform built with React, Node.js, and Google Gemini.
                Features Layer 1 Privacy Protection (bias redaction) and Layer 2 Resume Consistency
                Governance (hallucination checking).
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

