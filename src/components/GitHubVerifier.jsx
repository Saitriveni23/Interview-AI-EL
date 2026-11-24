import React, { useState, useCallback } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Star,
  GitFork,
  Clock,
  Code2,
  Loader2,
  RefreshCw
} from 'lucide-react';

function Github({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
import {
  scanGitHubProfile,
  verifyProjectClaim,
  getLanguageBreakdown
} from '../services/githubScannerService.js';

// ── Language colour palette (best-effort) ───────────────────────────────────
const LANG_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4f5d95',
  Swift: '#fa7343',
  Kotlin: '#a97bff',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dart: '#00b4ab',
  Scala: '#c22d40',
  'C#': '#178600',
  Vue: '#41b883',
  Other: '#8b949e'
};

// ── Donut chart (pure SVG) ──────────────────────────────────────────────────
function LanguageDonut({ languages }) {
  const entries = Object.entries(languages).slice(0, 7);
  if (!entries.length) return null;

  const total = entries.reduce((s, [, v]) => s + v, 0);
  const size = 110;
  const r = 42;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = entries.map(([lang, pct]) => {
    const frac = pct / total;
    const dash = frac * circumference;
    const gap = circumference - dash;
    const slice = { lang, pct, dash, gap, offset, color: LANG_COLORS[lang] || LANG_COLORS.Other };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        {slices.map((s) => (
          <circle
            key={s.lang}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="20"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={r - 10} fill="#0f172a" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
          {entries[0]?.[0]?.slice(0, 6)}
        </text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {slices.map((s) => (
          <div key={s.lang} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-slate-300 truncate">{s.lang}</span>
            <span className="text-slate-400 ml-auto font-mono">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Repo card ───────────────────────────────────────────────────────────────
function RepoCard({ repo, verificationStatus }) {
  const lastCommitDate = repo.lastCommit
    ? new Date(repo.lastCommit).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const statusConfig = {
    verified: { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />, label: '✅ Verified', cls: 'text-emerald-400' },
    inactive: { icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />, label: '⚠️ Inactive', cls: 'text-amber-400' },
    not_found: { icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />, label: '❌ Not Found', cls: 'text-rose-400' },
    unmatched: { icon: null, label: null, cls: '' }
  };

  const sc = statusConfig[verificationStatus] || statusConfig.unmatched;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition space-y-2 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-white truncate">{repo.name}</span>
          {sc.label && (
            <span className={`text-[10px] font-bold ${sc.cls}`}>{sc.label}</span>
          )}
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-indigo-400 transition flex-shrink-0"
          title="Open on GitHub"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {repo.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{repo.description}</p>
      )}

      <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
        {repo.languages?.length > 0 && (
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: LANG_COLORS[repo.languages[0]] || LANG_COLORS.Other }}
            />
            {repo.languages[0]}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {repo.stars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {repo.forks}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {lastCommitDate}
        </span>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function GitHubVerifier({ resumeClaims = [], onVerified }) {
  const [username, setUsername] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [langBreakdown, setLangBreakdown] = useState(null);
  const [claimVerifications, setClaimVerifications] = useState({});
  const [error, setError] = useState('');

  const handleScan = useCallback(async () => {
    if (!username.trim()) return;
    setScanning(true);
    setError('');
    setScanResult(null);
    setLangBreakdown(null);
    setClaimVerifications({});

    try {
      const [profileResult, langResult] = await Promise.all([
        scanGitHubProfile(username.trim()),
        getLanguageBreakdown(username.trim())
      ]);

      if (profileResult.error) {
        setError(profileResult.message || 'Failed to scan GitHub profile');
        setScanning(false);
        return;
      }

      setScanResult(profileResult);
      setLangBreakdown(langResult);

      // Verify each resume claim against repos
      if (resumeClaims.length > 0) {
        const verifyPromises = resumeClaims.map(async (claim, idx) => {
          const result = await verifyProjectClaim(claim, username.trim());
          return [idx, result];
        });

        const verifyResults = await Promise.all(verifyPromises);
        const verifyMap = {};
        const verifiedRepos = [];

        for (const [idx, result] of verifyResults) {
          verifyMap[idx] = result;
          if (result.found) {
            verifiedRepos.push({ claim: resumeClaims[idx], ...result });
          }
        }

        setClaimVerifications(verifyMap);

        if (onVerified) {
          onVerified({
            username: username.trim(),
            repos: profileResult.repos,
            claimVerifications: verifyMap,
            verifiedCount: verifiedRepos.length,
            totalClaims: resumeClaims.length,
            languages: langResult?.languages || {}
          });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred during scan.');
      console.error('[GitHubVerifier]', err);
    } finally {
      setScanning(false);
    }
  }, [username, resumeClaims, onVerified]);

  const verifiedCount = Object.values(claimVerifications).filter((v) => v.found && v.hasRecentActivity).length;
  const foundCount = Object.values(claimVerifications).filter((v) => v.found).length;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Github className="w-5 h-5 text-slate-300" />
        <h3 className="text-sm font-bold text-white">GitHub Profile Verifier</h3>
        <span className="text-[10px] text-slate-500 ml-auto">Public repos only · No auth needed</span>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !scanning && handleScan()}
            placeholder="Enter your GitHub username"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <button
          onClick={handleScan}
          disabled={scanning || !username.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 transition"
        >
          {scanning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
          ) : (
            <><Search className="w-4 h-4" /> Scan</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Resume claim verification summary */}
      {resumeClaims.length > 0 && Object.keys(claimVerifications).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Resume Project Verification</span>
            <span className="font-mono font-bold text-indigo-400">
              {foundCount} of {resumeClaims.length} claims found on GitHub
            </span>
          </div>

          <div className="space-y-2">
            {resumeClaims.map((claim, idx) => {
              const v = claimVerifications[idx];
              if (!v) return null;

              const isVerified = v.found && v.hasRecentActivity;
              const isInactive = v.found && !v.hasRecentActivity;
              const notFound = !v.found;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs border ${
                    isVerified
                      ? 'bg-emerald-950/20 border-emerald-500/20'
                      : isInactive
                      ? 'bg-amber-950/20 border-amber-500/20'
                      : 'bg-rose-950/10 border-rose-500/10'
                  }`}
                >
                  <span className="flex-shrink-0 mt-0.5">
                    {isVerified ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isInactive ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 truncate">"{claim}"</p>
                    {v.found && v.repo && (
                      <p className="text-slate-500 mt-0.5">
                        → <span className="text-indigo-400 font-mono">{v.repo.name}</span>
                        {v.commitCount > 0 && ` · ${v.commitCount} commits`}
                        {!v.hasRecentActivity && ' · Last active 6+ months ago'}
                      </p>
                    )}
                    {notFound && (
                      <p className="text-slate-500 mt-0.5">No matching public repo found</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary pill */}
          <div className="text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
              verifiedCount === resumeClaims.length
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : verifiedCount > 0
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {verifiedCount} of {resumeClaims.length} resume projects actively verified on GitHub
            </span>
          </div>
        </div>
      )}

      {/* Scan results */}
      {scanResult && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Public Repos</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{scanResult.totalRepos}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Active (6mo)</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{scanResult.activeRepos}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Top Language</div>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-1 truncate">
                {langBreakdown?.primaryLanguage || '—'}
              </div>
            </div>
          </div>

          {/* Language breakdown donut */}
          {langBreakdown && !langBreakdown.error && Object.keys(langBreakdown.languages).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Language Breakdown</div>
              <LanguageDonut languages={langBreakdown.languages} />
            </div>
          )}

          {/* Repo list */}
          {scanResult.repos.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Repositories ({scanResult.repos.length})
                </span>
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {scanResult.repos.map((repo) => {
                  // Determine verification status for this repo
                  let verificationStatus = 'unmatched';
                  for (const v of Object.values(claimVerifications)) {
                    if (v.found && v.repo?.name === repo.name) {
                      verificationStatus = v.hasRecentActivity ? 'verified' : 'inactive';
                      break;
                    }
                  }
                  return (
                    <RepoCard
                      key={repo.name}
                      repo={repo}
                      verificationStatus={verificationStatus}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty / hint state */}
      {!scanResult && !scanning && !error && (
        <div className="text-center py-6 text-slate-500 text-xs space-y-1">
          <Github className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Enter your GitHub username to verify resume project claims against your public repos.</p>
        </div>
      )}
    </div>
  );
}
