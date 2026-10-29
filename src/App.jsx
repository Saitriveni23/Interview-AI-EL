import React, { useState } from 'react';
import Header from './components/Header';
import ResumeUploader from './components/ResumeUploader';
import RedactionViewer from './components/RedactionViewer';
import SkillParserView from './components/SkillParserView';
import InterviewPanel from './components/InterviewPanel';
import { ShieldAlert, Award, BookOpen } from 'lucide-react';

export default function App() {
  const [parseResult, setParseResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('redaction');

  // Check localStorage for a previously saved session.
  const [savedSession, setSavedSession] = useState(() => {
    try {
      const saved = localStorage.getItem('interview-ai-session');
      return saved ? JSON.parse(saved) : null;
    } catch (_) { return null; }
  });

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
    setActiveTab('skills');
  };

  // ==========================================
  // 1. RESUME UPLOAD AND PROCESSING
  // ==========================================

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
        setActiveTab('redaction');
      } else {
        alert(
          'Parsing failed: ' +
          (data.error || 'Unknown error')
        );
      }

    } catch (error) {
      console.error(
        'Error executing resume redaction:',
        error
      );

      alert(
        'Failed to connect to backend server: ' +
        error.message
      );

    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. MAIN APPLICATION
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

      <Header />

      {/* Previous session restore banner — shown before a new resume is uploaded */}
      {savedSession && !parseResult && (
        <div className="bg-indigo-950/70 border-b border-indigo-500/30 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-indigo-300 font-bold">🔖 Previous Session Detected</span>
            <span className="text-slate-400 text-xs">
              {savedSession.targetInfo?.role || 'Resume'}{savedSession.targetInfo?.company ? ` @ ${savedSession.targetInfo.company}` : ''}
              {savedSession.savedAt ? ` • Saved ${new Date(savedSession.savedAt).toLocaleDateString()}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreSession}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Resume Session
            </button>
            <button
              onClick={handleDismissSession}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* STEP 1: RESUME UPLOAD */}

        <ResumeUploader
          onParse={handleParseResume}
          isLoading={isLoading}
        />

        {/* STEP 2: RESULTS DASHBOARD */}

        {parseResult && (

          <div className="space-y-6">

            {/* NAVIGATION TABS */}

            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">

              {/* LAYER 1 */}

              <button
                onClick={() => setActiveTab('redaction')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'redaction'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >

                <ShieldAlert className="w-4 h-4" />

                <span>
                  Layer 1: Bias Redaction & Privacy Shield
                </span>

                <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-950 text-indigo-300 text-[10px]">
                  {parseResult.stats?.totalRedactions ?? 0} Redacted
                </span>

              </button>

              {/* SKILL ANALYSIS */}

              <button
                onClick={() => setActiveTab('skills')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'skills'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >

                <Award className="w-4 h-4" />

                <span>
                  Skill Parsing, Delta & Layer 2 Governance
                </span>

                <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 text-[10px]">
                  {parseResult.deltaAnalysis?.matchPercentage ?? 0}% Match
                </span>

              </button>

              {/* AI INTERVIEW */}

              <button
                onClick={() => setActiveTab('interview')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'interview'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >

                <BookOpen className="w-4 h-4" />

                <span>
                  Adaptive AI Mock Interview
                </span>

              </button>

            </div>

            {/* ====================================== */}
            {/* TAB 1: RESUME REDACTION */}
            {/* ====================================== */}

            {activeTab === 'redaction' && (

              <RedactionViewer
                result={parseResult}
              />

            )}

            {/* ====================================== */}
            {/* TAB 2: SKILL ANALYSIS */}
            {/* ====================================== */}

            {activeTab === 'skills' && (

              <SkillParserView
                targetInfo={parseResult.targetInfo}
                candidateProfile={parseResult.candidateProfile}
                deltaAnalysis={parseResult.deltaAnalysis}
                studyPlan={parseResult.studyPlan}
                redactedResumeText={parseResult.redactedText}
              />

            )}

            {/* ====================================== */}
            {/* TAB 3: AI MOCK INTERVIEW */}
            {/* ====================================== */}

            {activeTab === 'interview' && (

              <InterviewPanel
                targetInfo={parseResult.targetInfo}
                candidateSkills={
                  parseResult.candidateProfile?.skills || []
                }

                redactedResumeText={
                  parseResult.redactedText || ''
                }
              />

            )}

          </div>

        )}

      </main>

      {/* FOOTER */}

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">

        Interview AI Assessment Engine •
        Layer 1 Privacy Protection &
        Layer 2 Resume Consistency Governance

      </footer>

    </div>
  );
}