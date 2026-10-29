import React from 'react';
import {
  Home,
  FileText,
  PlayCircle,
  Settings,
  LogOut,
  Zap,
  Clock,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'sessions', label: 'My Sessions', icon: Clock },
  { id: 'upload', label: 'Resume Builder', icon: FileText },
  { id: 'interview', label: 'Interview Prep', icon: PlayCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, parseResult }) {
  return (
    <aside className="w-56 min-h-screen bg-slate-900 border-r border-slate-800/80 flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
            <Zap className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block leading-tight">Interview AI</span>
            <span className="text-[10px] text-slate-500">Powered by Gemini</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {/* Green dot when results are ready */}
              {id === 'upload' && parseResult && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              )}
              {id === 'interview' && parseResult && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Plan badge */}
      <div className="px-3 pb-3">
        <div className="bg-indigo-950/60 border border-indigo-500/20 rounded-xl p-3 text-center">
          <p className="text-[10px] text-indigo-300 font-semibold">AI Interview Assistant</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Adaptive preparation active</p>
        </div>
      </div>

      {/* User section */}
      <div className="px-3 py-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">You</p>
            <p className="text-[10px] text-slate-500">Candidate</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

