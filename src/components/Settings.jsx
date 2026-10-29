import React, { useState } from 'react';
import { Moon, Bell, Trash2, Shield, Info, Sparkles, Check } from 'lucide-react';

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

export default function Settings({ darkMode = true, onToggleDarkMode }) {
  const [activeTab, setActiveTab] = useState('preferences'); // 'profile' | 'preferences' | 'account'
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('interview-ai-notifications');
      return saved ? JSON.parse(saved) : false;
    } catch (_) { return false; }
  });
  const [autoSave, setAutoSave] = useState(() => {
    try {
      const saved = localStorage.getItem('interview-ai-autosave');
      return saved ? JSON.parse(saved) : true;
    } catch (_) { return true; }
  });
  const [aiSuggestions, setAiSuggestions] = useState(() => {
    try {
      const saved = localStorage.getItem('interview-ai-suggestions');
      return saved ? JSON.parse(saved) : true;
    } catch (_) { return true; }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('interview-ai-notifications', JSON.stringify(notifications));
      localStorage.setItem('interview-ai-autosave', JSON.stringify(autoSave));
      localStorage.setItem('interview-ai-suggestions', JSON.stringify(aiSuggestions));
    } catch (_) {}
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearData = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 4000);
      return;
    }
    localStorage.removeItem('interview-ai-session');
    localStorage.removeItem('interview-ai-sessions');
    localStorage.removeItem('interview-ai-saved-reports');
    localStorage.removeItem('interview-ai-completed-tasks');
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">

        {/* Page Title & Navigation Tabs */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your Interview AI profile, defaults, and app preferences</p>
          </div>

          <div className="flex space-x-2 border-b border-slate-800 pb-2">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'preferences', label: 'Preferences' },
              { id: 'account', label: 'Account & Data' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
                TR
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Triveni Reddy</h3>
                <p className="text-xs text-slate-400">Software Engineering Candidate</p>
                <p className="text-xs text-indigo-400 mt-1">triveni030208@gmail.com</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  defaultValue="Triveni Reddy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  defaultValue="triveni030208@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Appearance & Interaction */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Appearance & Interaction</h3>

              <div className="flex items-center justify-between py-3.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <Moon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Dark Mode</p>
                    <p className="text-xs text-slate-400">Toggle dark or light theme throughout the application</p>
                  </div>
                </div>
                <Toggle value={darkMode} onChange={onToggleDarkMode || (() => {})} />
              </div>

              <div className="flex items-center justify-between py-3.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <Bell className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Notifications</p>
                    <p className="text-xs text-slate-400">Session reminders and study progress updates</p>
                  </div>
                </div>
                <Toggle value={notifications} onChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between py-3.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Enable AI Suggestions</p>
                    <p className="text-xs text-slate-400">Automate curriculum gap recommendations and follow-up drills</p>
                  </div>
                </div>
                <Toggle value={aiSuggestions} onChange={setAiSuggestions} />
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <Shield className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Auto-Save Sessions</p>
                    <p className="text-xs text-slate-400">Automatically save resume delta analyses and interview history</p>
                  </div>
                </div>
                <Toggle value={autoSave} onChange={setAutoSave} />
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  Preferences Saved!
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ACCOUNT & DATA TAB */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Data & Privacy */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Data & Privacy</h3>

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
                    <p className="text-xs text-slate-500">Delete all stored sessions, study roadmaps, and cached interview history</p>
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
                  <p className="text-sm font-medium text-white">Interview AI Platform</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    AI-driven interview preparation platform with Layer 1 Privacy Protection (demographic bias redaction) and Layer 2 Consistency Governance (hallucination checking).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
