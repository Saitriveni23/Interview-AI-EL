import { SkillExtractor } from './skillExtractor.js';

const skillExtractor = new SkillExtractor();

/**
 * Parses raw LinkedIn Job posting text or simulated LinkedIn URL payload
 * into structured job details, requirements, and key competencies.
 */
export function parseLinkedInJob(rawText, sourceUrl = '') {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Please provide job recruitment text or LinkedIn job details.');
  }

  const cleanText = rawText.trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Heuristic Extraction of Job Title & Company
  let title = 'Software Engineer';
  let company = 'LinkedIn Recruitment Partner';
  let location = 'Remote / Hybrid';
  let experienceLevel = 'Mid-Level';

  // Check common LinkedIn patterns:
  // "Title at Company" or "Company hiring Title"
  const atMatch = lines[0]?.match(/^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[-–|]|\s*$)/i);
  const hiringMatch = lines[0]?.match(/^(.+?)\s+(?:is hiring|hiring for)\s+(.+?)(?:\s*[-–|]|\s*$)/i);

  if (atMatch) {
    title = atMatch[1].trim();
    company = atMatch[2].trim();
  } else if (hiringMatch) {
    company = hiringMatch[1].trim();
    title = hiringMatch[2].trim();
  } else if (lines.length >= 2) {
    // Top line often title, second line company
    if (lines[0].length < 60 && !lines[0].includes('http')) {
      title = lines[0];
    }
    if (lines[1].length < 50 && !lines[1].includes('http')) {
      company = lines[1];
    }
  }

  // Location heuristics
  const locMatch = cleanText.match(/\b(Location|Based in|Workplace):\s*([^\n\r]+)/i) ||
                   cleanText.match(/\b(Bengaluru|Bangalore|Hyderabad|Pune|Mumbai|Delhi|San Francisco|New York|London|Remote|Hybrid|On-site)\b/i);
  if (locMatch) {
    location = locMatch[2] ? locMatch[2].trim() : locMatch[0].trim();
  }

  // Experience level heuristics
  const expMatch = cleanText.match(/\b(\d+[\+]?\s*(?:-\s*\d+)?\s*(?:years|yrs)\s+(?:of\s+)?experience)\b/i);
  if (expMatch) {
    experienceLevel = expMatch[1];
  }

  // 2. Extract technical skills using our canonical SkillExtractor
  const requiredSkills = skillExtractor.detectSkills(cleanText);

  // 3. Extract key responsibilities bullet points
  const responsibilities = [];
  for (const line of lines) {
    if (/^[•\-\*]\s+/.test(line) || /^(Responsibilities|Requirements|What you'll do|Qualifications):/i.test(line)) {
      const cleaned = line.replace(/^[•\-\*]\s+/, '').trim();
      if (cleaned.length > 20 && cleaned.length < 250) {
        responsibilities.push(cleaned);
      }
    }
    if (responsibilities.length >= 6) break;
  }

  return {
    jobId: `li_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    company,
    location,
    experienceLevel,
    sourceUrl: sourceUrl || 'https://www.linkedin.com/jobs',
    rawJobDescription: cleanText,
    requiredSkills,
    responsibilities: responsibilities.length > 0 ? responsibilities : [
      `Design, build, and deploy production features aligned with ${company} standards.`,
      `Collaborate with cross-functional teams utilizing ${requiredSkills.slice(0, 3).join(', ') || 'modern web technologies'}.`,
      `Write maintainable, well-tested code and perform peer code reviews.`
    ],
    parsedAt: new Date().toISOString()
  };
}

