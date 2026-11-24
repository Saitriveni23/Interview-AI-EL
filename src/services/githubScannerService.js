/**
 * GitHub Public API Scanner Service
 * No auth needed for public repos.
 * Full offline/error fallback included.
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Scan a GitHub user's public repositories.
 * @param {string} username
 * @returns {Promise<{repos: Array, totalRepos: number, activeRepos: number} | {error: true, message: string, repos: []}>}
 */
export async function scanGitHubProfile(username) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { error: true, message: 'Invalid username provided', repos: [] };
  }

  const cleanUsername = username.trim();

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { error: true, message: `GitHub user "${cleanUsername}" not found`, repos: [] };
      }
      if (response.status === 403 || response.status === 429) {
        return { error: true, message: 'GitHub API rate limit exceeded. Please wait a moment.', repos: [] };
      }
      return { error: true, message: `GitHub API error: ${response.status}`, repos: [] };
    }

    const rawRepos = await response.json();

    if (!Array.isArray(rawRepos)) {
      return { error: true, message: 'Unexpected GitHub API response', repos: [] };
    }

    const repos = rawRepos.map((repo) => ({
      name: repo.name || '',
      description: repo.description || '',
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      lastCommit: repo.pushed_at || repo.updated_at || null,
      languages: repo.language ? [repo.language] : [],
      url: repo.html_url || `https://github.com/${cleanUsername}/${repo.name}`,
      isForked: repo.fork || false,
      topics: repo.topics || [],
      openIssues: repo.open_issues_count || 0,
      defaultBranch: repo.default_branch || 'main'
    }));

    // Active = pushed to in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const activeRepos = repos.filter((r) => {
      if (!r.lastCommit) return false;
      return new Date(r.lastCommit) > sixMonthsAgo;
    });

    return {
      repos,
      totalRepos: repos.length,
      activeRepos: activeRepos.length
    };
  } catch (err) {
    console.warn('[GitHubScanner] Network error:', err.message);
    return { error: true, message: 'GitHub unavailable — please check your connection', repos: [] };
  }
}

/**
 * Verify whether a resume project claim matches any of the user's GitHub repos.
 * @param {string} projectName
 * @param {string} username
 * @returns {Promise<{found: boolean, repo: object|null, hasRecentActivity: boolean, commitCount: number}>}
 */
export async function verifyProjectClaim(projectName, username) {
  if (!projectName || !username) {
    return { found: false, repo: null, hasRecentActivity: false, commitCount: 0 };
  }

  try {
    const { repos, error } = await scanGitHubProfile(username);
    if (error || !repos?.length) {
      return { found: false, repo: null, hasRecentActivity: false, commitCount: 0 };
    }

    // Normalize project name: lowercase, strip special chars
    const normalizeStr = (s) =>
      s.toLowerCase().replace(/[-_\s.]/g, '').replace(/[^a-z0-9]/g, '');

    const normalizedClaim = normalizeStr(projectName);

    // Try exact or fuzzy match
    const matched = repos.find((repo) => {
      const repoNorm = normalizeStr(repo.name);
      const descNorm = normalizeStr(repo.description || '');
      return (
        repoNorm === normalizedClaim ||
        repoNorm.includes(normalizedClaim) ||
        normalizedClaim.includes(repoNorm) ||
        (normalizedClaim.length > 4 && descNorm.includes(normalizedClaim))
      );
    });

    if (!matched) {
      return { found: false, repo: null, hasRecentActivity: false, commitCount: 0 };
    }

    // Check recent activity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const hasRecentActivity = matched.lastCommit
      ? new Date(matched.lastCommit) > sixMonthsAgo
      : false;

    // Try to fetch commit count (best-effort)
    let commitCount = 0;
    try {
      const commitResp = await fetch(
        `${GITHUB_API_BASE}/repos/${encodeURIComponent(username)}/${encodeURIComponent(matched.name)}/commits?per_page=1`,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      if (commitResp.ok) {
        const linkHeader = commitResp.headers.get('Link') || '';
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        commitCount = lastPageMatch ? parseInt(lastPageMatch[1], 10) : 1;
      }
    } catch (_) {
      commitCount = 0;
    }

    return { found: true, repo: matched, hasRecentActivity, commitCount };
  } catch (err) {
    console.warn('[GitHubScanner] verifyProjectClaim error:', err.message);
    return { found: false, repo: null, hasRecentActivity: false, commitCount: 0 };
  }
}

/**
 * Fetch language breakdown across all public repos for a user.
 * @param {string} username
 * @returns {Promise<{languages: Object, primaryLanguage: string} | {error: true, message: string}>}
 */
export async function getLanguageBreakdown(username) {
  if (!username) {
    return { error: true, message: 'No username provided', languages: {}, primaryLanguage: 'Unknown' };
  }

  try {
    const { repos, error, message } = await scanGitHubProfile(username);
    if (error) {
      return { error: true, message, languages: {}, primaryLanguage: 'Unknown' };
    }

    // Count language occurrences weighted by repo recency
    const languageCounts = {};
    for (const repo of repos) {
      if (repo.languages && repo.languages.length > 0) {
        for (const lang of repo.languages) {
          if (lang) {
            languageCounts[lang] = (languageCounts[lang] || 0) + 1;
          }
        }
      }
    }

    if (Object.keys(languageCounts).length === 0) {
      return { languages: {}, primaryLanguage: 'Unknown' };
    }

    // Convert to percentages
    const total = Object.values(languageCounts).reduce((a, b) => a + b, 0);
    const languages = {};
    for (const [lang, count] of Object.entries(languageCounts)) {
      languages[lang] = Math.round((count / total) * 100);
    }

    // Sort by percentage
    const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    const primaryLanguage = sorted[0]?.[0] || 'Unknown';

    return { languages: Object.fromEntries(sorted), primaryLanguage };
  } catch (err) {
    console.warn('[GitHubScanner] getLanguageBreakdown error:', err.message);
    return { error: true, message: 'GitHub unavailable', languages: {}, primaryLanguage: 'Unknown' };
  }
}
