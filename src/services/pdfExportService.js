/**
 * PDF Export Service
 * Uses the browser's built-in print API for zero-dependency PDF export.
 */

/**
 * Generate a fully self-contained, print-optimised HTML string for a defense report.
 * @param {object} report - generateResumeDefenseReport output
 * @param {string} type   - 'defense' | 'session'
 * @returns {string}
 */
export function generateHTMLReport(report, type = 'defense') {
  const now = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const scoreColor =
    (report.overallCredibilityScore || report.overallScore || 0) >= 80
      ? '#16a34a'
      : (report.overallCredibilityScore || report.overallScore || 0) >= 60
      ? '#d97706'
      : '#dc2626';

  const claimRowsHTML = (report.claimBreakdown || [])
    .map((claim) => {
      const statusColor =
        claim.status === 'defended'
          ? '#16a34a'
          : claim.status === 'partially_defended'
          ? '#d97706'
          : '#dc2626';
      const statusLabel =
        claim.status === 'defended'
          ? '✅ Defended'
          : claim.status === 'partially_defended'
          ? '⚠️ Partial'
          : '❌ Vulnerable';

      return `
        <tr>
          <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; font-size:12px; color:#111827; max-width:280px;">"${escapeHtml(claim.claimText || '')}"</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; font-size:12px; color:#374151;">${escapeHtml(claim.category || '')}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; font-size:12px; font-weight:bold; color:${statusColor};">${statusLabel}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; font-size:12px; font-family:monospace; color:#1d4ed8;">${claim.score ?? '—'}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; font-size:11px; color:#6b7280; max-width:200px;">${escapeHtml(claim.coachingTip || '')}</td>
        </tr>`;
    })
    .join('');

  const recommendationsHTML = (report.recommendations || [])
    .map((r) => `<li style="margin-bottom:6px; color:#374151; font-size:13px;">${escapeHtml(r)}</li>`)
    .join('');

  const title = type === 'defense'
    ? 'Resume Defense Verification Report'
    : 'Interview Session Summary Report';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #111827;
      padding: 40px 48px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
    h2 { font-size: 15px; font-weight: 700; color: #374151; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
    .header-bar {
      background: #1e1b4b;
      border-radius: 12px;
      padding: 24px 28px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }
    .score-badge {
      font-size: 36px;
      font-weight: 900;
      color: ${scoreColor};
      font-family: monospace;
    }
    .meta { font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }
    .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 600; }
    .stat-value { font-size: 28px; font-weight: 900; font-family: monospace; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    .verdict-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: #f3f4f6;
      color: #374151;
      margin-top: 8px;
    }
    ul { padding-left: 18px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print {
      body { padding: 20px 24px; }
      .header-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .stat-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <h1 style="color:white;">${title}</h1>
      <div class="meta">Generated: ${now}</div>
      ${report.candidateName ? `<div class="meta" style="margin-top:4px;">Candidate: <strong style="color:#c7d2fe;">${escapeHtml(report.candidateName)}</strong></div>` : ''}
      ${report.targetRole ? `<div class="meta">Target Role: ${escapeHtml(report.targetRole)}</div>` : ''}
      ${report.targetCompany ? `<div class="meta">Company: ${escapeHtml(report.targetCompany)}</div>` : ''}
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Credibility Score</div>
      <div class="score-badge">${report.overallCredibilityScore ?? report.overallScore ?? '—'}%</div>
      <div class="verdict-pill">${escapeHtml(report.verdict || 'Report')}</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Claims Evaluated</div>
      <div class="stat-value">${report.totalClaimsEvaluated ?? 0}</div>
    </div>
    <div class="stat-card" style="border-color:#bbf7d0;">
      <div class="stat-label" style="color:#16a34a;">Defended</div>
      <div class="stat-value" style="color:#16a34a;">${report.defendedCount ?? 0}</div>
    </div>
    <div class="stat-card" style="border-color:#fecaca;">
      <div class="stat-label" style="color:#dc2626;">Vulnerable</div>
      <div class="stat-value" style="color:#dc2626;">${report.struggledCount ?? 0}</div>
    </div>
  </div>

  ${claimRowsHTML ? `
  <h2>Claim-by-Claim Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Claim</th>
        <th>Category</th>
        <th>Status</th>
        <th>Score</th>
        <th>Coaching Tip</th>
      </tr>
    </thead>
    <tbody>${claimRowsHTML}</tbody>
  </table>` : ''}

  ${recommendationsHTML ? `
  <h2>Recommendations</h2>
  <ul>${recommendationsHTML}</ul>` : ''}

  <div class="footer">Interview AI EL · Resume Defense Verification · ${now}</div>
</body>
</html>`;
}

/**
 * Export a defense report as a PDF via the browser print dialog.
 * @param {object} report         - generateResumeDefenseReport output
 * @param {string} candidateName  - optional candidate name
 */
export function exportDefenseReportPDF(report, candidateName = '') {
  const enrichedReport = { ...report, candidateName };
  const html = generateHTMLReport(enrichedReport, 'defense');
  _printHTML(html, 'Resume_Defense_Report');
}

/**
 * Export a session summary PDF via the browser print dialog.
 * @param {object} session    - interview session object
 * @param {object} evaluation - evaluation results
 */
export function exportSessionSummaryPDF(session, evaluation) {
  const report = {
    candidateName: session?.candidateName || evaluation?.candidateName || '',
    targetRole: session?.targetRole || evaluation?.targetRole || '',
    targetCompany: session?.company || evaluation?.targetCompany || '',
    overallCredibilityScore: evaluation?.overallScore ?? evaluation?.overallCredibilityScore ?? null,
    overallScore: evaluation?.overallScore ?? null,
    verdict: evaluation?.verdict || 'Session Complete',
    totalClaimsEvaluated: evaluation?.totalClaimsEvaluated ?? 0,
    defendedCount: evaluation?.defendedCount ?? 0,
    struggledCount: evaluation?.struggledCount ?? 0,
    partiallyDefendedCount: evaluation?.partiallyDefendedCount ?? 0,
    claimBreakdown: evaluation?.claimBreakdown || session?.questions?.map((q, i) => ({
      claimText: q.question || q.text || `Question ${i + 1}`,
      category: q.category || 'General',
      status: q.status || 'pending',
      score: q.score ?? null,
      coachingTip: q.coachingTip || q.feedback || ''
    })) || [],
    recommendations: evaluation?.recommendations || []
  };

  const html = generateHTMLReport(report, 'session');
  _printHTML(html, 'Interview_Session_Summary');
}

// ── Internal helper ──────────────────────────────────────────────────────────

function _printHTML(htmlString, filename = 'Report') {
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow pop-ups to export PDF. Then try again.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(htmlString);
    printWindow.document.close();

    // Wait for resources then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Don't auto-close so the user can interact with print dialog
      }, 300);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
    }, 1200);
  } catch (err) {
    console.error('[PDFExport] Failed to open print window:', err);
    alert('PDF export failed. Please check browser permissions for pop-ups.');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
