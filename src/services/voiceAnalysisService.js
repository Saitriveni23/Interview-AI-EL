/**
 * voiceAnalysisService.js
 * Pure JS service for voice/transcript analysis — no React dependencies.
 */

// ─── Filler word list ────────────────────────────────────────────────────────
const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'you know', 'right', 'so', 'actually'];

/**
 * detectFillers(text)
 * Returns an array of { word, index, count } for every filler found.
 */
export function detectFillers(text) {
  if (!text || typeof text !== 'string') return [];

  const lower = text.toLowerCase();
  const result = [];
  const counts = {};

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    let match;
    while ((match = regex.exec(lower)) !== null) {
      counts[filler] = (counts[filler] || 0) + 1;
      result.push({ word: filler, index: match.index, count: counts[filler] });
    }
  }

  // Sort by position in text
  result.sort((a, b) => a.index - b.index);
  return result;
}

/**
 * analyzeTranscript(text)
 * Returns { fillerCount, fillerWords, wordCount, speakingRate, qualityScore }
 * speakingRate: words per second (requires durationSeconds > 0)
 */
export function analyzeTranscript(text, durationSeconds = 0) {
  if (!text || typeof text !== 'string') {
    return { fillerCount: 0, fillerWords: [], wordCount: 0, speakingRate: 0, qualityScore: 0 };
  }

  const fillers = detectFillers(text);
  const fillerCount = fillers.length;
  const fillerWords = [...new Set(fillers.map(f => f.word))];

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const speakingRate = durationSeconds > 0 ? parseFloat((wordCount / durationSeconds).toFixed(2)) : 0;

  // Quality: starts at 10, deduct for fillers and very short answers
  let qualityScore = 10;
  qualityScore -= Math.min(5, Math.floor(fillerCount / 2));
  if (wordCount < 20) qualityScore -= 2;
  if (wordCount < 10) qualityScore -= 2;
  qualityScore = Math.max(0, qualityScore);

  return { fillerCount, fillerWords, wordCount, speakingRate, qualityScore };
}

/**
 * getConfidenceLevel(speakingRate, volume)
 * volume: 0–1 (from analyser node)
 * Returns 'confident' | 'nervous' | 'rushed'
 *
 * Heuristics:
 *   - Slow (< 1.5 w/s) or quiet (< 0.2) → nervous
 *   - Very fast (> 3.5 w/s) → rushed
 *   - Otherwise → confident
 */
export function getConfidenceLevel(speakingRate, volume = 0.5) {
  const rate = typeof speakingRate === 'number' ? speakingRate : 0;
  const vol = typeof volume === 'number' ? volume : 0.5;

  if (rate < 1.5 || vol < 0.2) return 'nervous';
  if (rate > 3.5) return 'rushed';
  return 'confident';
}

/**
 * formatDuration(seconds)
 * Returns a human-readable string like '1m 30s' or '45s'.
 */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '0s';
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m > 0) return `${m}m ${rem}s`;
  return `${s}s`;
}
