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
  CheckCircle2
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

    onParse(formData);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Heading & Fast Sample Loader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Interview Preparation & Target Role Gap Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Specify your target company and role, upload your resume, and generate an unbiased gap analysis & study roadmap.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 transition whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Load Sample (Google SDE)</span>
        </button>
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
                  : 'View or Customize Target Job Description & Tech Stack'}
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
    </div>
  );
}
