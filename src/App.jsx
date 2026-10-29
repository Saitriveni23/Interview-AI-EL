import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ResumeUploader from './components/ResumeUploader';
import RedactionViewer from './components/RedactionViewer';
import SkillParserView from './components/SkillParserView';
import InterviewPanel from './components/InterviewPanel';
import { ShieldAlert, Award, MessageSquare, BookOpen, Plus, ChevronRight } from 'lucide-react';

// ============================================================
// My Sessions Page (inline — small enough to keep here)
// ============================================================
function SessionsPage({ sessions, onNavigate }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Sessions</h1>
            <p className="text-slate-400 text-sm mt-1">
              {sessions.length} saved interview preparation session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-300 font-semibold">No sessions yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Upload your resume to start your first session
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="mt-5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Date', 'Target Role', 'Company', 'Status', 'Match Score', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{s.targetRole || '—'}</td>
                    <td className="px-6 py-4 text-slate-300">{s.company || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">
                      {s.score != null ? `${s.score}%` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onNavigate('upload')}
                        className="text-slate-500 hover:text-indigo-400 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Upload + Results Page
// ============================================================
function UploadPage({
  parseResult,
  isLoading,
  onParse,
  savedSession,
  onDismissSession,
  onRestoreSession,
  activeResultTab,
  setActiveResultTab
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Session restore banner */}
      {savedSession && !parseResult && (
        <div className="bg-indigo-950/70 border-b border-indigo-500/30 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-indigo-300 font-bold">🔖 Previous Session Found</span>
            <span className="text-slate-400 text-xs">
              {savedSession.targetInfo?.role || 'Resume'}
              {savedSession.targetInfo?.company ? ` @ ${savedSession.targetInfo.company}` : ''}
              {savedSession.savedAt
                ? ` • Saved ${new Date(savedSession.savedAt).toLocaleDateString()}`
                : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRestoreSession}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Resume Session
            </button>
            <button
              onClick={onDismissSession}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Upload form — always visible unless directly practicing interview standalone */}
        <ResumeUploader onParse={onParse} isLoading={isLoading} />

        {/* Standalone Interview Mode (when user navigated to interview before parsing a resume) */}
        {!parseResult && activeResultTab === 'interview' && (
          <div className="space-y-4">
            <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-indigo-300">Quick Practice Mode</span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Practicing with standard engineering benchmark questions. Upload your resume above anytime for personalized gap analysis!
                </p>
              </div>
            </div>
            <InterviewPanel
              targetInfo={{ company: 'Google', role: 'Full Stack Developer' }}
              candidateSkills={['JavaScript', 'React', 'Node.js', 'SQL']}
              redactedResumeText=""
            />
          </div>
        )}

        {/* Results section — shown after parsing */}
        {parseResult && (
          <div className="space-y-6">
            {/* Tab bar */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveResultTab('redaction')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeResultTab === 'redaction'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Layer 1: Bias Redaction & Privacy Shield</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950 text-indigo-300 text-[10px]">
                  {parseResult.stats?.totalRedactions ?? 0} Redacted
                </span>
              </button>

              <button
                onClick={() => setActiveResultTab('skills')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeResultTab === 'skills'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Skill Parsing, Delta & Layer 2 Governance</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 text-[10px]">
                  {parseResult.deltaAnalysis?.matchPercentage ?? 0}% Match
                </span>
              </button>

              <button
                onClick={() => setActiveResultTab('interview')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeResultTab === 'interview'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Adaptive AI Mock Interview</span>
              </button>
            </div>

            {/* Tab content */}
            {activeResultTab === 'redaction' && (
              <RedactionViewer result={parseResult} />
            )}

            {activeResultTab === 'skills' && (
              <SkillParserView
                targetInfo={parseResult.targetInfo}
                candidateProfile={parseResult.candidateProfile}
                deltaAnalysis={parseResult.deltaAnalysis}
                studyPlan={parseResult.studyPlan}
                redactedResumeText={parseResult.redactedText}
              />
            )}

            {activeResultTab === 'interview' && (
              <InterviewPanel
                targetInfo={parseResult.targetInfo}
                candidateSkills={parseResult.candidateProfile?.skills || []}
                redactedResumeText={parseResult.redactedText || ''}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeResultTab, setActiveResultTab] = useState('redaction');
  const [parseResult, setParseResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Persist sessions list in localStorage.
  const [sessions, setSessions] = useState(() => {
    try {
      const s = localStorage.getItem('interview-ai-sessions');
      return s ? JSON.parse(s) : [];
    } catch (_) { return []; }
  });

  // Previous session one-tap restore.
  const [savedSession, setSavedSession] = useState(() => {
    try {
      const s = localStorage.getItem('interview-ai-session');
      return s ? JSON.parse(s) : null;
    } catch (_) { return null; }
  });

  // ── Save a new session record ──
  const saveSessionRecord = (data) => {
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      targetRole: data.targetInfo?.role || data.deltaAnalysis?.targetRole || '',
      company: data.targetInfo?.company || data.deltaAnalysis?.targetCompany || '',
      status: 'Analyzed',
      score: data.deltaAnalysis?.matchPercentage ?? null,
      missingSkills: data.deltaAnalysis?.missingSkills || [],
      interviewDone: false
    };
    const updated = [record, ...sessions].slice(0, 20);
    setSessions(updated);
    try {
      localStorage.setItem('interview-ai-sessions', JSON.stringify(updated));
    } catch (_) {}
  };

  // ── Resume upload handler ──
  const handleParseResume = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/resume/parse-and-redact', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setParseResult(data);
        setActivePage('upload');
        saveSessionRecord(data);
      } else {
        alert('Parsing failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error executing resume redaction:', error);
      alert('Failed to connect to backend server: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Session restore / dismiss ──
  const handleDismissSession = () => {
    setSavedSession(null);
    localStorage.removeItem('interview-ai-session');
  };

  const handleRestoreSession = () => {
    if (!savedSession) return;
    setParseResult({
      success: true,
      targetInfo: savedSession.targetInfo || {},
      candidateProfile: savedSession.candidateProfile,
      deltaAnalysis: savedSession.deltaAnalysis,
      studyPlan: savedSession.studyPlan || null,
      redactedText: '',
      stats: { totalRedactions: 0 }
    });
    setSavedSession(null);
    setActivePage('upload');
  };

  // ── Sidebar navigation ──
  const handleNavigate = (page) => {
    if (page === 'interview') {
      setActiveResultTab('interview');
      setActivePage('upload');
    } else if (page === 'upload') {
      if (parseResult) {
        setActiveResultTab('skills');
      }
      setActivePage('upload');
    } else {
      setActivePage(page);
    }
  };

  // ── Page renderer ──
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            parseResult={parseResult}
            sessions={sessions}
          />
        );

      case 'sessions':
        return (
          <SessionsPage
            sessions={sessions}
            onNavigate={handleNavigate}
          />
        );

      case 'settings':
        return <Settings />;

      case 'upload':
      case 'interview':
      default:
        return (
          <UploadPage
            parseResult={parseResult}
            isLoading={isLoading}
            onParse={handleParseResume}
            savedSession={savedSession}
            onDismissSession={handleDismissSession}
            onRestoreSession={handleRestoreSession}
            activeResultTab={activeResultTab}
            setActiveResultTab={setActiveResultTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        parseResult={parseResult}
      />
      {renderPage()}
    </div>
  );
}
