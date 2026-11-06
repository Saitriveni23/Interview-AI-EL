import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  ShieldAlert,
  Building2,
  Briefcase,
  GraduationCap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Table,
  Cpu,
  Wifi,
  WifiOff,
  Globe
} from 'lucide-react';
import {
  TOP_COMPANIES,
  POPULAR_ROLES,
  EXPERIENCE_LEVELS,
  getPresetJobDescription
} from '../data/companyRolePresets.js';

const SAMPLE_SENSITIVE_RESUME = `JOHNATHAN DOE
Email: john.doe.privacy@example.com | Phone: +1 (555) 019-2834
Address: 742 Evergreen Terrace, Springfield, OR 97477
LinkedIn: https://linkedin.com/in/johnathan-doe-tech
Gender: Male (He/Him) | DOB: 14/05/1995 (Age: 29) | Native Place: Springfield, Oregon | Citizenship: US Citizen
Marital Status: Single | Religion: Non-denominational | Photo attached: Yes (Fair complexion, professional headshot)

SUMMARY
Experienced Full Stack Engineer (He/Him) with 5+ years of software development expertise. Born in Oregon, Johnathan specializes in building high-scale React web applications, Node.js backend microservices, PostgreSQL databases, Docker containers, and REST APIs.

PROFESSIONAL EXPERIENCE
Senior Software Developer | TechCorp Inc. (Springfield)
2021 - Present
- Led a team of 4 frontend engineers building React and TypeScript applications.
- Optimized PostgreSQL database query response times by 35%.
- Integrated Docker and CI/CD pipelines for automated cloud deployments.

Software Engineer | Innovate Software Ltd.
2019 - 2021
- Developed scalable Express.js and Node.js API endpoints.
- Designed responsive interfaces using Tailwind CSS and HTML5.

EDUCATION & CERTIFICATIONS
B.S. in Computer Science | Oregon State University (Graduated 2019)
Certifications: AWS Certified Developer (2022)`;

export default function ResumeUploader({ onParse, isLoading }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');

  // Target Interview Details
  const [companySelect, setCompanySelect] = useState('Google');
  const [customCompany, setCustomCompany] = useState('');
  const [roleSelect, setRoleSelect] = useState('Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (3-5 yrs)');
  const [showCustomJD, setShowCustomJD] = useState(false);

  // LinkedIn Recruitment Import States
  const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
  const [linkedInRawText, setLinkedInRawText] = useState('');
  const [parsedJobTable, setParsedJobTable] = useState(null);

  // Study Plan Engine Preference: 'gemini' (Dynamic AI) vs 'fixed' (Curated Syllabus)
  const [studyPlanMode, setStudyPlanMode] = useState('gemini');

  // Network Offline Detection Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveCompany =
    companySelect === 'Custom Company'
      ? customCompany.trim() || 'Target Company'
      : companySelect;

  const effectiveRole =
    roleSelect === 'Custom Role'
      ? customRole.trim() || 'Software Engineer'
      : roleSelect;

  const [jobDescription, setJobDescription] = useState(() =>
    getPresetJobDescription('Google', 'Full Stack Developer', 'Mid-Level (3-5 yrs)')
  );

  // Sync Job Description when company, role, or seniority changes
  useEffect(() => {
    setJobDescription(
      getPresetJobDescription(effectiveCompany, effectiveRole, experienceLevel)
    );
  }, [companySelect, customCompany, roleSelect, customRole, experienceLevel]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    setActiveTab('text');
    setResumeText(SAMPLE_SENSITIVE_RESUME);
    setCompanySelect('Google');
    setCustomCompany('');
    setRoleSelect('Full Stack Developer');
    setCustomRole('');
    setExperienceLevel('Mid-Level (3-5 yrs)');
    setJobDescription(
      getPresetJobDescription('Google', 'Full Stack Developer', 'Mid-Level (3-5 yrs)')
    );
  };

  const handleApplyLinkedInJob = (job) => {
    setParsedJobTable(job);
    setCompanySelect('Custom Company');
    setCustomCompany(job.company);
    setRoleSelect('Custom Role');
    setCustomRole(job.title);
    setExperienceLevel(job.experienceLevel || 'Mid-Level');
    setJobDescription(
      `${job.title} at ${job.company}\nLocation: ${job.location}\nRequired Skills: ${job.requiredSkills.join(', ')}\n\nResponsibilities:\n${job.responsibilities.map(r => `• ${r}`).join('\n')}\n\nFull Recruitment Description:\n${job.rawJobDescription}`
    );
    setLinkedInModalOpen(false);
  };

  const handleFetchLinkedInData = async () => {
    if (!linkedInRawText.trim()) {
      alert('Please paste the LinkedIn job recruitment text.');
      return;
    }

    try {
      const response = await fetch('/api/resume/parse-linkedin-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawJobText: linkedInRawText
        })
      });

      const data = await response.json();
      if (data.success && data.job) {
        handleApplyLinkedInJob(data.job);
      } else {
        throw new Error(data.error || 'Unable to parse LinkedIn job post');
      }
    } catch (err) {
      // In-browser client fallback parser if backend is offline!
      const lines = linkedInRawText.trim().split('\n').filter(Boolean);
      const title = lines[0] || 'Software Engineer';
      const company = lines[1] || 'Target Company';
      const fallbackJob = {
        title,
        company,
        location: 'Remote / Hybrid',
        experienceLevel: 'Mid-Level',
        requiredSkills: ['React', 'Node.js', 'REST API', 'JavaScript', 'SQL'],
        responsibilities: [
          `Build high-scale web products for ${company}.`,
          'Collaborate on REST API services and responsive user interfaces.',
          'Optimize query and frontend performance metrics.'
        ],
        rawJobDescription: linkedInRawText
      };
      handleApplyLinkedInJob(fallbackJob);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'upload' && !file) {
      alert('Please select a PDF resume file or switch to Text input tab.');
      return;
    }
    if (activeTab === 'text' && !resumeText.trim()) {
      alert('Please enter or paste resume text.');
      return;
    }

    const formData = new FormData();
    if (activeTab === 'upload' && file) {
      formData.append('resumeFile', file);
    } else {
      formData.append('resumeText', resumeText);
    }

    formData.append('targetCompany', effectiveCompany);
    formData.append('targetRole', effectiveRole);
    formData.append('experienceLevel', experienceLevel);
    formData.append('jobDescription', jobDescription);
    formData.append('studyPlanMode', studyPlanMode);

    onParse(formData);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Top Banner & Stepper matching Screen 2 */}
      <div className="border-b border-slate-800 pb-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Let's get started!</h2>
            <p className="text-sm text-slate-400 mt-1">
              Set your target role and upload your resume to begin your AI-powered analysis and personalized study plan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLinkedInModalOpen(true)}
              className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 transition whitespace-nowrap"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Import from LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="flex items-center space-x-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 transition whitespace-nowrap self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Load Sample (Google SDE)</span>
            </button>
          </div>
        </div>

        {/* 3-Step Indicator */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-xs font-semibold text-white">Target Setup</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-xs font-semibold text-slate-400">Resume Upload</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 border border-slate-800 text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-xs font-semibold text-slate-500">Review & Analyze</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= STEP 1: TARGET COMPANY & ROLE ================= */}
        <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              1. Target Company & Interview Role
            </h3>

            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
              ✨ Pre-tuned benchmark requirements
            </span>
          </div>

          {/* Display LinkedIn Table if Imported */}
          {parsedJobTable && (
            <div className="bg-blue-950/30 border border-blue-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-300">Imported LinkedIn Recruitment Table</span>
                </div>
                <button
                  type="button"
                  onClick={() => setParsedJobTable(null)}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Clear Table
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Job Role</th>
                      <th className="p-2 border-b border-slate-800">Company</th>
                      <th className="p-2 border-b border-slate-800">Location</th>
                      <th className="p-2 border-b border-slate-800">Experience</th>
                      <th className="p-2 border-b border-slate-800">Required Skills</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900/60 divide-y divide-slate-800">
                    <tr>
                      <td className="p-2 font-semibold text-white">{parsedJobTable.title}</td>
                      <td className="p-2 text-indigo-300">{parsedJobTable.company}</td>
                      <td className="p-2 text-slate-300">{parsedJobTable.location}</td>
                      <td className="p-2 text-slate-300">{parsedJobTable.experienceLevel}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {parsedJobTable.requiredSkills.map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Company Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Target Company
              </label>
              <select
                value={companySelect}
                onChange={(e) => setCompanySelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {TOP_COMPANIES.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>

              {companySelect === 'Custom Company' && (
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="Enter company name (e.g. Stripe, Spotify)..."
                  className="mt-2 w-full bg-slate-900 border border-indigo-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Target Role / Title
              </label>
              <select
                value={roleSelect}
                onChange={(e) => setRoleSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {POPULAR_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {roleSelect === 'Custom Role' && (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Enter role title (e.g. Distributed Systems Engineer)..."
                  className="mt-2 w-full bg-slate-900 border border-indigo-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              )}
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Seniority / Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle to view/edit auto-generated job description */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowCustomJD(!showCustomJD)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                {showCustomJD
                  ? 'Hide Job Requirements Editor'
                  : 'Customize Job Description (Optional)'}
              </span>
              {showCustomJD ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </button>

            {showCustomJD && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>
                    Auto-populated requirements for {effectiveRole} at {effectiveCompany}:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setJobDescription(
                        getPresetJobDescription(effectiveCompany, effectiveRole, experienceLevel)
                      )
                    }
                    className="text-indigo-400 hover:underline"
                  >
                    Reset to Default Preset
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job requirements and tech stack here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}
          </div>
          {/* Study Plan Engine Selection & Offline Status */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Study Plan Mode:
              </span>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-950 border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setStudyPlanMode('gemini')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    studyPlanMode === 'gemini'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Dynamic (Gemini)
                </button>
                <button
                  type="button"
                  onClick={() => setStudyPlanMode('fixed')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    studyPlanMode === 'fixed'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fixed Structured (Offline Ready)
                </button>
              </div>
            </div>

            {/* Offline Detection Indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {isOnline ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  <span>Cloud Active</span>
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Mode (Local Engine Active)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= STEP 2: RESUME INPUT ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              2. Candidate Resume (PDF or Plain Text)
            </h3>

            {/* Tab Switcher */}
            <div className="flex space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-1 px-3 text-xs font-semibold rounded transition ${
                  activeTab === 'upload'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3 h-3 inline mr-1" />
                Upload PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`py-1 px-3 text-xs font-semibold rounded transition ${
                  activeTab === 'text'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3 h-3 inline mr-1" />
                Paste Text
              </button>
            </div>
          </div>

          {/* Upload / Text Area Input */}
          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-7 text-center bg-slate-950/40 transition">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-pdf-input"
              />
              <label htmlFor="resume-pdf-input" className="cursor-pointer space-y-2.5 block">
                <div className="w-12 h-12 rounded-full bg-indigo-600/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-indigo-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {file ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {file.name}
                      </span>
                    ) : (
                      'Click to select or drag & drop candidate PDF resume'
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Layer 1 Privacy Shield will automatically strip all PII and demographics
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div>
              <textarea
                rows={7}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate resume raw text here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>
              Target: <strong className="text-white">{effectiveRole}</strong> at <strong className="text-white">{effectiveCompany}</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Comparing Resume with {effectiveCompany} Bar...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compare & Generate Role Study Plan</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ================= LINKEDIN IMPORT MODAL ================= */}
      {linkedInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Job Recruitment from LinkedIn</h3>
                  <p className="text-xs text-slate-400">Parse LinkedIn job details, extract required skills, and populate the match table</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkedInModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Paste LinkedIn Job Recruitment Post / Text:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkedInRawText(
`Full Stack Engineer at Spotify
Location: New York, NY (Hybrid)
Experience: 3+ years of experience

About the role:
We are looking for a Full Stack Engineer to scale our creator ecosystem.
Key Requirements:
• 3+ years experience with React, TypeScript, and modern CSS
• Hands-on proficiency with Node.js, Express.js, and REST APIs
• Relational database experience with PostgreSQL or MongoDB
• Containerization experience with Docker and AWS cloud services
• Familiarity with Git, CI/CD, and agile engineering practices`
                      );
                    }}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Paste Example Post
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={linkedInRawText}
                  onChange={(e) => setLinkedInRawText(e.target.value)}
                  placeholder="Paste the complete job post, title, company, requirements, and responsibilities from LinkedIn..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLinkedInModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFetchLinkedInData}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Parse & Populate Job Table</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
