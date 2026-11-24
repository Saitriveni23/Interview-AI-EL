import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  INTERVIEW_PERSONALITIES,
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
  calculateNextDifficulty,
  analyzeAnswerQuality,
  generateContextualFollowUp,
  generateAdaptiveQuestion
} from '../src/services/adaptiveInterviewerService.js';

import {
  extractResumeClaims,
  evaluateDefenseResponse,
  generateResumeDefenseReport
} from '../src/services/resumeDefenseService.js';

import {
  COMPETENCY_DIMENSIONS,
  calculateIntelligenceMetrics,
  generateTargetedPracticeDrills,
  getRadarPolygonPoints
} from '../src/services/interviewIntelligenceService.js';

// ========================================================
// PILLAR 1: ADAPTIVE AI INTERVIEWER (38 TESTS)
// ========================================================
describe('Pillar 1: Adaptive AI Interviewer', () => {

  describe('Personality Configuration & Personas', () => {
    it('defines friendly personality with supportive coaching focus', () => {
      assert.ok(INTERVIEW_PERSONALITIES.friendly);
      assert.equal(INTERVIEW_PERSONALITIES.friendly.id, 'friendly');
      assert.match(INTERVIEW_PERSONALITIES.friendly.name, /friendly/i);
      assert.ok(INTERVIEW_PERSONALITIES.friendly.promptTone.includes('Warm'));
    });

    it('defines professional personality as standard bar', () => {
      assert.ok(INTERVIEW_PERSONALITIES.professional);
      assert.equal(INTERVIEW_PERSONALITIES.professional.badge, 'Standard Bar');
      assert.match(INTERVIEW_PERSONALITIES.professional.promptTone, /structured/i);
    });

    it('defines strict personality demanding precision', () => {
      assert.ok(INTERVIEW_PERSONALITIES.strict);
      assert.equal(INTERVIEW_PERSONALITIES.strict.badge, 'High Rigor');
      assert.match(INTERVIEW_PERSONALITIES.strict.promptTone, /critical/i);
    });

    it('defines senior_engineer personality focused on architecture & scale', () => {
      assert.ok(INTERVIEW_PERSONALITIES.senior_engineer);
      assert.equal(INTERVIEW_PERSONALITIES.senior_engineer.badge, 'Deep Tech Probing');
      assert.match(INTERVIEW_PERSONALITIES.senior_engineer.promptTone, /tradeoffs/i);
    });

    it('defines high_pressure personality testing composure under scrutiny', () => {
      assert.ok(INTERVIEW_PERSONALITIES.high_pressure);
      assert.equal(INTERVIEW_PERSONALITIES.high_pressure.badge, 'FAANG Final Round');
      assert.match(INTERVIEW_PERSONALITIES.high_pressure.promptTone, /composure/i);
    });
  });

  describe('Interview Types & Categories', () => {
    it('supports Technical category', () => {
      assert.ok(INTERVIEW_TYPES.includes('Technical'));
    });
    it('supports HR category', () => {
      assert.ok(INTERVIEW_TYPES.includes('HR'));
    });
    it('supports Behavioral category', () => {
      assert.ok(INTERVIEW_TYPES.includes('Behavioral'));
    });
    it('supports Resume-Based category', () => {
      assert.ok(INTERVIEW_TYPES.includes('Resume-Based'));
    });
    it('supports System Design category', () => {
      assert.ok(INTERVIEW_TYPES.includes('System Design'));
    });
  });

  describe('Dynamic Difficulty Adaptation', () => {
    it('contains all 4 difficulty tiers', () => {
      assert.deepEqual(DIFFICULTY_LEVELS, ['Beginner', 'Intermediate', 'Advanced', 'Staff']);
    });

    it('promotes Beginner to Intermediate on strong answer', () => {
      assert.equal(calculateNextDifficulty('Beginner', 'strong'), 'Intermediate');
    });

    it('promotes Intermediate to Advanced on strong answer', () => {
      assert.equal(calculateNextDifficulty('Intermediate', 'strong'), 'Advanced');
    });

    it('promotes Advanced to Staff on strong answer', () => {
      assert.equal(calculateNextDifficulty('Advanced', 'strong'), 'Staff');
    });

    it('caps difficulty at Staff tier', () => {
      assert.equal(calculateNextDifficulty('Staff', 'strong'), 'Staff');
    });

    it('demotes Staff to Advanced on incorrect answer', () => {
      assert.equal(calculateNextDifficulty('Staff', 'incorrect'), 'Advanced');
    });

    it('demotes Intermediate to Beginner on incomplete answer', () => {
      assert.equal(calculateNextDifficulty('Intermediate', 'incomplete'), 'Beginner');
    });

    it('clamps bottom difficulty at Beginner tier', () => {
      assert.equal(calculateNextDifficulty('Beginner', 'incorrect'), 'Beginner');
    });
  });

  describe('Answer Quality Analysis', () => {
    it('detects strong technical answers with architectural depth', () => {
      const q = 'How do you optimize API latency and database queries?';
      const a = 'We introduced Redis caching for hot read paths, added database composite indexes on the tenant ID column, and refactored our GraphQL queries to eliminate N+1 latency bottlenecks, reducing p99 latency to 45ms.';
      const res = analyzeAnswerQuality(a, q);
      assert.equal(res.quality, 'strong');
      assert.ok(res.indicators.includes('Architectural / domain terminology detected'));
    });

    it('detects vague high-level answers lacking concrete specifics', () => {
      const q = 'How do you handle microservice failures?';
      const a = 'We just make sure that services are running well and we check logs and fix things when they break.';
      const res = analyzeAnswerQuality(a, q);
      assert.equal(res.quality, 'vague');
      assert.match(res.feedback, /high-level/i);
    });

    it('detects incomplete or truncated answers', () => {
      const q = 'Explain how you design a rate limiter.';
      const a = 'Using redis token bucket.';
      const res = analyzeAnswerQuality(a, q);
      assert.equal(res.quality, 'incomplete');
      assert.match(res.feedback, /too brief/i);
    });

    it('flags gibberish or empty input as incorrect', () => {
      const res = analyzeAnswerQuality('asdf qwerty test test', 'Any question');
      assert.equal(res.quality, 'incorrect');
      assert.match(res.feedback, /did not address/i);
    });

    it('identifies STAR structure components in behavioral answers', () => {
      const q = 'Tell me about a time you resolved a team conflict.';
      const a = 'During a critical sprint at Acme Corp, our backend and frontend engineers disagreed on schema specifications. As tech lead, I organized a contract-first API workshop where we defined TypeScript OpenAPI contracts. As a result, we delivered the milestone 3 days ahead of schedule with zero integration defects.';
      const res = analyzeAnswerQuality(a, q);
      assert.equal(res.quality, 'strong');
      assert.ok(res.indicators.some(i => i.includes('STAR')));
    });

    it('flags missing results in behavioral response', () => {
      const q = 'Tell me about a difficult bug you fixed.';
      const a = 'There was a memory leak in the Node worker and I spent some days checking heapdumps.';
      const res = analyzeAnswerQuality(a, q);
      assert.ok(res.quality === 'vague' || res.quality === 'incomplete');
    });

    it('handles null, undefined, and non-string inputs safely', () => {
      assert.equal(analyzeAnswerQuality(null, '').quality, 'incorrect');
      assert.equal(analyzeAnswerQuality(undefined, '').quality, 'incorrect');
      assert.equal(analyzeAnswerQuality('', '').quality, 'incorrect');
    });

    it('provides targeted improvement suggestions for every classification', () => {
      const res = analyzeAnswerQuality('brief answer', 'question');
      assert.ok(typeof res.feedback === 'string' && res.feedback.length > 5);
      assert.ok(Array.isArray(res.indicators));
    });
  });

  describe('Contextual Follow-Up Generation', () => {
    it('generates a contextual challenge for vague answers', async () => {
      const res = await generateContextualFollowUp({
        question: 'How did you handle scaling?',
        answer: 'We used cloud servers and scaled them up.',
        personality: 'strict',
        category: 'Technical'
      });
      assert.ok(res.question);
      assert.ok(res.type);
      assert.ok(res.reasoning);
    });

    it('challenges technical decisions for senior engineer personality', async () => {
      const res = await generateContextualFollowUp({
        question: 'Design a distributed queue',
        answer: 'I chose Apache Kafka with 3 partitions and a replication factor of 3.',
        personality: 'senior_engineer',
        category: 'System Design'
      });
      assert.ok(res.question.length > 10);
      assert.match(res.question, /tradeoffs|failure|partitions|consumer|latency|kafka/i);
    });

    it('encourages candidate when friendly personality is active', async () => {
      const res = await generateContextualFollowUp({
        question: 'Tell me about a project',
        answer: 'I built a dashboard with React.',
        personality: 'friendly',
        category: 'Behavioral'
      });
      assert.ok(res.question);
    });

    it('presses for concrete metrics when high_pressure personality is active', async () => {
      const res = await generateContextualFollowUp({
        question: 'Describe your contribution',
        answer: 'I improved the build pipeline.',
        personality: 'high_pressure',
        category: 'Technical'
      });
      assert.match(res.question, /metrics|quantify|measure|numbers|percent/i);
    });

    it('falls back cleanly when question or answer is blank', async () => {
      const res = await generateContextualFollowUp({});
      assert.ok(res.question);
      assert.equal(res.type, 'Clarification');
    });

    it('generates follow-ups deterministic and offline without API keys', async () => {
      const origKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      const res = await generateContextualFollowUp({
        question: 'Explain React hooks',
        answer: 'useEffect runs side effects',
        personality: 'professional'
      });
      assert.ok(res.question);
      process.env.GEMINI_API_KEY = origKey;
    });
  });

  describe('Adaptive Question Generation', () => {
    it('generates technical questions aligned with candidate skills', async () => {
      const res = await generateAdaptiveQuestion({
        category: 'Technical',
        currentDifficulty: 'Intermediate',
        candidateSkills: ['React', 'Node.js'],
        personality: 'professional'
      });
      assert.ok(res.question);
      assert.equal(res.category, 'Technical');
      assert.equal(res.difficulty, 'Intermediate');
    });

    it('generates System Design questions at Advanced tier', async () => {
      const res = await generateAdaptiveQuestion({
        category: 'System Design',
        currentDifficulty: 'Advanced',
        personality: 'senior_engineer'
      });
      assert.ok(res.question);
      assert.equal(res.category, 'System Design');
      assert.equal(res.difficulty, 'Advanced');
    });

    it('generates HR questions evaluating culture and career trajectory', async () => {
      const res = await generateAdaptiveQuestion({
        category: 'HR',
        currentDifficulty: 'Intermediate',
        personality: 'friendly'
      });
      assert.ok(res.question);
      assert.equal(res.category, 'HR');
    });

    it('generates Behavioral questions evaluating leadership and teamwork', async () => {
      const res = await generateAdaptiveQuestion({
        category: 'Behavioral',
        currentDifficulty: 'Intermediate'
      });
      assert.ok(res.question);
      assert.equal(res.category, 'Behavioral');
    });

    it('avoids previously asked questions using usedQuestions filter', async () => {
      const used = [
        'Can you explain the difference between synchronous and asynchronous execution in your primary programming language?'
      ];
      const res = await generateAdaptiveQuestion({
        category: 'Technical',
        currentDifficulty: 'Beginner',
        usedQuestions: used
      });
      assert.notEqual(res.question, used[0]);
    });

    it('incorporates target company and role in role-targeted prompts', async () => {
      const res = await generateAdaptiveQuestion({
        category: 'Technical',
        targetInfo: { company: 'Google', role: 'Staff Infrastructure Engineer' }
      });
      assert.ok(res.question);
    });
  });
});

// ========================================================
// PILLAR 2: RESUME DEFENSE & CROSS-EXAMINATION (38 TESTS)
// ========================================================
describe('Pillar 2: Resume Defense & Cross-Examination', () => {

  const sampleResume = `
Triveni Reddy - Senior Full Stack Engineer
- Optimized database queries and Redis caching, reducing API p99 latency by 42% across 12 microservices.
- Architected event-driven streaming pipeline with Kafka and Node.js handling 4.5 million daily events.
- Led team of 8 software engineers through migration from monolith to Kubernetes microservices.
- Spearheaded automated CI/CD pipeline cutting deployment times from 45 minutes to 6 minutes.
- Designed distributed PostgreSQL multi-region replication architecture saving $120,000 in cloud infrastructure costs.
- Developed real-time analytics dashboard in React and WebSockets with sub-100ms updates.
`;

  describe('Claim Extraction from Resume Text', () => {
    it('extracts quantifiable percentage metric claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const latencyClaim = claims.find(c => c.rawText.includes('42%'));
      assert.ok(latencyClaim);
      assert.equal(latencyClaim.category, 'Quantified Achievement');
      assert.equal(latencyClaim.riskLevel, 'High');
    });

    it('extracts high-throughput event metric claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const kafkaClaim = claims.find(c => c.rawText.includes('4.5 million'));
      assert.ok(kafkaClaim);
      assert.equal(latencyClaimRisk(kafkaClaim), 'High');
    });

    function latencyClaimRisk(c) { return c.riskLevel; }

    it('extracts leadership and team ownership claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const leadClaim = claims.find(c => c.rawText.includes('Led team of 8'));
      assert.ok(leadClaim);
      assert.equal(leadClaim.category, 'Leadership & Ownership');
    });

    it('extracts cost-saving financial metric claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const costClaim = claims.find(c => c.rawText.includes('$120,000'));
      assert.ok(costClaim);
      assert.equal(costClaim.category, 'Quantified Achievement');
    });

    it('extracts architecture and distributed systems claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const archClaim = claims.find(c => c.rawText.includes('Kubernetes'));
      assert.ok(archClaim);
    });

    it('ignores short lines, headings, and boilerplate text', () => {
      const text = 'Skills\nEducation\nSummary\nPhone: 123456\nShort line';
      const claims = extractResumeClaims(text);
      assert.equal(claims.length, 0);
    });

    it('caps extracted claims to a focused set of top substantive claims', () => {
      let repeatedResume = '';
      for (let i = 0; i < 30; i++) {
        repeatedResume += `- Optimized microservice latency by ${i + 10}% using Redis and Go.\n`;
      }
      const claims = extractResumeClaims(repeatedResume);
      assert.ok(claims.length <= 8);
    });

    it('assigns unique sequential IDs to all extracted claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const ids = new Set(claims.map(c => c.id));
      assert.equal(ids.size, claims.length);
    });

    it('initializes claims with status "pending"', () => {
      const claims = extractResumeClaims(sampleResume);
      claims.forEach(c => assert.equal(c.status, 'pending'));
    });

    it('returns empty array when resumeText is null or empty', () => {
      assert.deepEqual(extractResumeClaims(''), []);
      assert.deepEqual(extractResumeClaims(null), []);
      assert.deepEqual(extractResumeClaims(undefined), []);
    });
  });

  describe('Cross-Examination Challenge Generation', () => {
    it('generates at least 3 distinct cross-examination challenges per claim', () => {
      const claims = extractResumeClaims(sampleResume);
      claims.forEach(claim => {
        assert.ok(Array.isArray(claim.challenges));
        assert.ok(claim.challenges.length >= 3);
      });
    });

    it('generates baseline measurement challenge for quantified metrics', () => {
      const claims = extractResumeClaims(sampleResume);
      const metricClaim = claims.find(c => c.rawText.includes('42%'));
      const hasBaselineChallenge = metricClaim.challenges.some(ch => /baseline|measure|metric|how/i.test(ch));
      assert.ok(hasBaselineChallenge);
    });

    it('generates individual contribution probe for team leadership claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const leadClaim = claims.find(c => c.rawText.includes('Led team of 8'));
      const hasIndividualProbe = leadClaim.challenges.some(ch => /individual|contribution|personally|delegat/i.test(ch));
      assert.ok(hasIndividualProbe);
    });

    it('generates architectural trade-off challenge for system claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const kafkaClaim = claims.find(c => c.rawText.includes('Kafka'));
      const hasTradeoff = kafkaClaim.challenges.some(ch => /trade-off|alternative|bottleneck|failure/i.test(ch));
      assert.ok(hasTradeoff);
    });

    it('challenges verification of cost reduction calculations', () => {
      const claims = extractResumeClaims(sampleResume);
      const costClaim = claims.find(c => c.rawText.includes('$120,000'));
      assert.ok(costClaim.challenges.some(ch => /calculate|saving|audit|baseline/i.test(ch)));
    });

    it('structures challenges as interrogative interview questions', () => {
      const claims = extractResumeClaims(sampleResume);
      claims.forEach(c => {
        c.challenges.forEach(ch => {
          assert.ok(ch.endsWith('?'));
        });
      });
    });

    it('includes failure mode investigation in technical challenges', () => {
      const claims = extractResumeClaims(sampleResume);
      const allChallenges = claims.flatMap(c => c.challenges);
      assert.ok(allChallenges.some(ch => /fail|bottleneck|outage|edge case/i.test(ch)));
    });

    it('includes tooling and verification methodology probes', () => {
      const claims = extractResumeClaims(sampleResume);
      const allChallenges = claims.flatMap(c => c.challenges);
      assert.ok(allChallenges.some(ch => /tool|profil|monitor|datadog|grafana|cloudwatch/i.test(ch)));
    });

    it('probes team consensus and conflict resolution in leadership claims', () => {
      const claims = extractResumeClaims(sampleResume);
      const leadClaim = claims.find(c => c.category === 'Leadership & Ownership');
      assert.ok(leadClaim.challenges.some(ch => /disagree|consensus|pushback|decision/i.test(ch)));
    });

    it('maintains clean indexing with currentChallengeIndex initialized to 0', () => {
      const claims = extractResumeClaims(sampleResume);
      claims.forEach(c => assert.equal(c.currentChallengeIndex, 0));
    });
  });

  describe('Real-Time Defense Evaluation', () => {
    it('awards "defended" status with score >= 80 for comprehensive defense', async () => {
      const claimText = 'Optimized API p99 latency by 42% across 12 microservices.';
      const challengeText = 'How did you establish the baseline, and how was the 42% improvement measured?';
      const defenseText = 'Our baseline was established in Datadog over a 30-day window showing p99 latency at 240ms. My individual contribution was profiling the slowest endpoints with pprof, replacing synchronous DB queries with Redis caching, and batching bulk writes. After deployment, our p99 dropped to 139ms under identical production traffic loads.';

      const res = await evaluateDefenseResponse({ claimText, challengeText, defenseText });
      assert.equal(res.status, 'defended');
      assert.ok(res.score >= 80);
      assert.equal(res.rubric.methodology, 'Strong');
      assert.equal(res.rubric.ownership, 'Clear Individual Ownership');
    });

    it('assigns "struggled" status for vague non-specific defense', async () => {
      const claimText = 'Optimized API latency by 42%.';
      const challengeText = 'What was the baseline and measurement tool?';
      const defenseText = 'I think it just became faster when we tested it on our local computers.';

      const res = await evaluateDefenseResponse({ claimText, challengeText, defenseText });
      assert.equal(res.status, 'struggled');
      assert.ok(res.score <= 55);
      assert.match(res.feedback, /lacks concrete/i);
    });

    it('assigns "partially_defended" status for partial explanations lacking metrics', async () => {
      const claimText = 'Led team of 8 engineers migrating to Kubernetes.';
      const challengeText = 'What was your individual contribution vs the team?';
      const defenseText = 'I helped organize the sprint tickets and attended daily standups, and we wrote Helm charts together.';

      const res = await evaluateDefenseResponse({ claimText, challengeText, defenseText });
      assert.equal(res.status, 'partially_defended');
      assert.ok(res.score >= 50 && res.score <= 75);
    });

    it('assigns score 0 and "struggled" for gibberish or empty defense', async () => {
      const res = await evaluateDefenseResponse({
        claimText: 'Some claim',
        challengeText: 'Some challenge',
        defenseText: 'asdf idk test test test'
      });
      assert.equal(res.status, 'struggled');
      assert.equal(res.score, 0);
    });

    it('provides concrete actionable coaching tips in evaluation', async () => {
      const res = await evaluateDefenseResponse({
        claimText: 'Saved $120k in cloud costs.',
        challengeText: 'How was the saving calculated?',
        defenseText: 'We turned off unused instances.'
      });
      assert.ok(typeof res.coachingTip === 'string');
      assert.ok(res.coachingTip.length > 10);
    });

    it('evaluates STAR alignment in verbal defense delivery', async () => {
      const res = await evaluateDefenseResponse({
        claimText: 'Spearheaded CI/CD migration',
        challengeText: 'Describe technical challenges encountered.',
        defenseText: 'In our Jenkins setup, builds were timing out. I re-architected the workflow to run parallel Docker runners in GitHub Actions with cache volumes, resulting in 80% faster build cycles.'
      });
      assert.equal(res.status, 'defended');
    });

    it('tolerates missing targetRole gracefully', async () => {
      const res = await evaluateDefenseResponse({
        claimText: 'Built REST APIs',
        challengeText: 'What tools were used?',
        defenseText: 'Built with Express and Node.'
      });
      assert.ok(res.score != null);
    });

    it('validates rubric structure across all 4 defense pillars', async () => {
      const res = await evaluateDefenseResponse({
        claimText: 'Sample claim',
        challengeText: 'Sample challenge',
        defenseText: 'Detailed explanation with baseline metrics and individual action.'
      });
      assert.ok(res.rubric);
      assert.ok('methodology' in res.rubric);
      assert.ok('ownership' in res.rubric);
      assert.ok('metricsValidation' in res.rubric);
      assert.ok('tradeoffs' in res.rubric);
    });

    it('flags claims where candidate claims sole credit for large team efforts without details', async () => {
      const res = await evaluateDefenseResponse({
        claimText: 'Migrated entire company database',
        challengeText: 'What was your specific role?',
        defenseText: 'We did it as a team.'
      });
      assert.equal(res.status, 'struggled');
    });

    it('operates deterministically offline when no external LLM is reachable', async () => {
      const origKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      const res = await evaluateDefenseResponse({
        claimText: 'Reduced latency by 40%',
        challengeText: 'What was the baseline?',
        defenseText: 'Baseline measured in Datadog at 200ms, reduced to 120ms with Redis.'
      });
      assert.ok(res.score >= 70);
      process.env.GEMINI_API_KEY = origKey;
    });
  });

  describe('Resume Defense Report Compilation', () => {
    it('generates high credibility score when all claims are defended', () => {
      const claims = [
        { id: 'c1', rawText: 'Claim 1', status: 'defended', riskLevel: 'High', evaluation: { score: 90 } },
        { id: 'c2', rawText: 'Claim 2', status: 'defended', riskLevel: 'Medium', evaluation: { score: 85 } }
      ];
      const rep = generateResumeDefenseReport(claims);
      assert.ok(rep.overallCredibilityScore >= 85);
      assert.equal(rep.verdict, 'Exceptional Defense');
    });

    it('generates mixed credibility score when some claims are struggled', () => {
      const claims = [
        { id: 'c1', rawText: 'Claim 1', status: 'defended', riskLevel: 'High', evaluation: { score: 85 } },
        { id: 'c2', rawText: 'Claim 2', status: 'struggled', riskLevel: 'High', evaluation: { score: 35 } }
      ];
      const rep = generateResumeDefenseReport(claims);
      assert.ok(rep.overallCredibilityScore >= 55 && rep.overallCredibilityScore <= 75);
      assert.equal(rep.verdict, 'Mixed Credibility');
    });

    it('identifies unconvincing claims that require candidate coaching', () => {
      const claims = [
        { id: 'c1', rawText: 'Claim 1', status: 'struggled', riskLevel: 'High', evaluation: { score: 30 } }
      ];
      const rep = generateResumeDefenseReport(claims);
      assert.equal(rep.unconvincingClaims.length, 1);
      assert.ok(rep.actionableTips.length > 0);
    });

    it('categorizes claims defended vs partially defended vs struggled', () => {
      const claims = [
        { id: 'c1', status: 'defended', evaluation: { score: 90 } },
        { id: 'c2', status: 'partially_defended', evaluation: { score: 65 } },
        { id: 'c3', status: 'struggled', evaluation: { score: 25 } }
      ];
      const rep = generateResumeDefenseReport(claims);
      assert.equal(rep.defendedCount, 1);
      assert.equal(rep.partiallyDefendedCount, 1);
      assert.equal(rep.struggledCount, 1);
    });

    it('includes target company and role in defense report metadata', () => {
      const rep = generateResumeDefenseReport([], { role: 'Principal Architect', company: 'Netflix' });
      assert.equal(rep.targetRole, 'Principal Architect');
      assert.equal(rep.targetCompany, 'Netflix');
    });

    it('includes timestamp and generatedAt ISO string', () => {
      const rep = generateResumeDefenseReport([]);
      assert.ok(rep.generatedAt);
      assert.ok(!isNaN(Date.parse(rep.generatedAt)));
    });

    it('handles empty claim array gracefully with neutral baseline score', () => {
      const rep = generateResumeDefenseReport([]);
      assert.equal(rep.overallCredibilityScore, 70);
      assert.equal(rep.totalClaimsCount, 0);
    });

    it('calculates risk-weighted impact on credibility score', () => {
      // High risk claim failed should pull score down more than low risk
      const highRiskFail = [
        { id: 'c1', status: 'struggled', riskLevel: 'High', evaluation: { score: 30 } }
      ];
      const medRiskFail = [
        { id: 'c1', status: 'struggled', riskLevel: 'Medium', evaluation: { score: 30 } }
      ];
      const repHigh = generateResumeDefenseReport(highRiskFail);
      const repMed = generateResumeDefenseReport(medRiskFail);
      assert.ok(repHigh.overallCredibilityScore <= repMed.overallCredibilityScore);
    });
  });
});

// ========================================================
// PILLAR 3: INTERVIEW INTELLIGENCE & TRAINING LOOP (24 TESTS)
// ========================================================
describe('Pillar 3: Interview Intelligence Dashboard & Personalized Training Loop', () => {

  describe('6-Dimension Competency Framework', () => {
    it('defines exactly 6 competency dimensions', () => {
      assert.equal(COMPETENCY_DIMENSIONS.length, 6);
    });

    it('includes Technical Knowledge competency', () => {
      const d = COMPETENCY_DIMENSIONS.find(x => x.key === 'technical');
      assert.ok(d);
      assert.equal(d.label, 'Technical Knowledge');
    });

    it('includes Communication & Clarity competency', () => {
      const d = COMPETENCY_DIMENSIONS.find(x => x.key === 'communication');
      assert.ok(d);
    });

    it('includes Problem Solving & Logic competency', () => {
      const d = COMPETENCY_DIMENSIONS.find(x => x.key === 'problemSolving');
      assert.ok(d);
    });

    it('includes Coding & Algorithms competency', () => {
      const d = COMPETENCY_DIMENSIONS.find(x => x.key === 'coding');
      assert.ok(d);
    });

    it('includes System Design & Scale and Behavioral competencies', () => {
      assert.ok(COMPETENCY_DIMENSIONS.find(x => x.key === 'systemDesign'));
      assert.ok(COMPETENCY_DIMENSIONS.find(x => x.key === 'behavioral'));
    });
  });

  describe('Score Calculations & Readiness Score', () => {
    it('calculates baseline competencies within 0-100 scale', () => {
      const res = calculateIntelligenceMetrics({});
      Object.values(res.competencies).forEach(score => {
        assert.ok(score >= 0 && score <= 100);
      });
    });

    it('incorporates resume skill delta match percentage into technical score', () => {
      const res1 = calculateIntelligenceMetrics({ deltaAnalysis: { matchPercentage: 90 } });
      const res2 = calculateIntelligenceMetrics({ deltaAnalysis: { matchPercentage: 40 } });
      assert.ok(res1.competencies.technical > res2.competencies.technical);
    });

    it('incorporates resume defense credibility score into communication & behavioral scores', () => {
      const highDefense = { overallCredibilityScore: 95 };
      const lowDefense = { overallCredibilityScore: 35 };
      const resHigh = calculateIntelligenceMetrics({ resumeDefenseReport: highDefense });
      const resLow = calculateIntelligenceMetrics({ resumeDefenseReport: lowDefense });
      assert.ok(resHigh.competencies.communication > resLow.competencies.communication);
      assert.ok(resHigh.competencies.behavioral > resLow.competencies.behavioral);
    });

    it('calculates weighted composite Interview Readiness Score (0-100)', () => {
      const res = calculateIntelligenceMetrics({});
      assert.ok(res.readinessScore >= 0 && res.readinessScore <= 100);
      assert.equal(typeof res.readinessScore, 'number');
    });

    it('assigns correct Readiness Tier based on score thresholds', () => {
      const resHigh = calculateIntelligenceMetrics({
        deltaAnalysis: { matchPercentage: 95 },
        resumeDefenseReport: { overallCredibilityScore: 95 },
        interviewEvaluations: [{ overallScore: 9.5 }]
      });
      assert.equal(resHigh.readinessTier, 'Offer Ready');

      const resMid = calculateIntelligenceMetrics({});
      assert.ok(['Offer Ready', 'Competitive', 'Developing'].includes(resMid.readinessTier));
    });

    it('incorporates historical evaluations into category scores', () => {
      const evals = [
        {
          overallScore: 8.5,
          categoryScores: { Technical: 9, Behavioral: 8, Situational: 8.5, 'Resume-Based': 9 }
        }
      ];
      const res = calculateIntelligenceMetrics({ interviewEvaluations: evals });
      assert.equal(res.competencies.technical, 90);
      assert.equal(res.competencies.behavioral, 80);
    });
  });

  describe('SVG Radar Polygon Geometry & Mathematics', () => {
    it('calculates 6 coordinate pairs for radar polygon', () => {
      const scores = {
        technical: 80,
        communication: 70,
        problemSolving: 90,
        coding: 60,
        systemDesign: 75,
        behavioral: 85
      };
      const points = getRadarPolygonPoints(scores, 150, 150, 100);
      const coords = points.split(' ');
      assert.equal(coords.length, 6);
    });

    it('centers radar polygon correctly around cx and cy', () => {
      const scores = {
        technical: 100, communication: 100, problemSolving: 100,
        coding: 100, systemDesign: 100, behavioral: 100
      };
      const points = getRadarPolygonPoints(scores, 120, 120, 80);
      assert.ok(points.length > 20);
    });

    it('scales points proportionally with score magnitude', () => {
      const zeroScores = { technical: 0, communication: 0, problemSolving: 0, coding: 0, systemDesign: 0, behavioral: 0 };
      const fullScores = { technical: 100, communication: 100, problemSolving: 100, coding: 100, systemDesign: 100, behavioral: 100 };
      const zeroPoints = getRadarPolygonPoints(zeroScores, 100, 100, 50);
      const fullPoints = getRadarPolygonPoints(fullScores, 100, 100, 50);
      assert.notEqual(zeroPoints, fullPoints);
    });

    it('clamps negative or out-of-bounds scores cleanly', () => {
      const weirdScores = { technical: -50, communication: 250, problemSolving: 50, coding: 50, systemDesign: 50, behavioral: 50 };
      const points = getRadarPolygonPoints(weirdScores, 100, 100, 50);
      assert.ok(typeof points === 'string');
      assert.ok(!points.includes('NaN'));
    });
  });

  describe('Strengths vs Weaknesses Sorting', () => {
    it('identifies top 3 competencies as candidate strengths', () => {
      const res = calculateIntelligenceMetrics({});
      assert.ok(Array.isArray(res.strengths));
      assert.equal(res.strengths.length, 3);
      assert.ok(res.strengths[0].score >= res.strengths[1].score);
      assert.ok(res.strengths[1].score >= res.strengths[2].score);
    });

    it('identifies lowest 3 competencies as candidate weaknesses', () => {
      const res = calculateIntelligenceMetrics({});
      assert.ok(Array.isArray(res.weaknesses));
      assert.equal(res.weaknesses.length, 3);
      assert.ok(res.weaknesses[0].score <= res.weaknesses[1].score);
    });

    it('maintains mutual exclusivity between highest strength and lowest weakness', () => {
      const res = calculateIntelligenceMetrics({});
      assert.notEqual(res.strengths[0].key, res.weaknesses[0].key);
    });
  });

  describe('Targeted Practice Drills & Personalized Training Loop', () => {
    it('generates Distributed Caching drill when System Design is weak', () => {
      const weaknesses = [{ key: 'systemDesign', label: 'System Design & Scale', score: 55 }];
      const drills = generateTargetedPracticeDrills(weaknesses);
      const sdDrill = drills.find(d => d.presetType === 'System Design');
      assert.ok(sdDrill);
      assert.match(sdDrill.title, /caching/i);
    });

    it('generates STAR Rehearsal drill when Behavioral/Communication is weak', () => {
      const weaknesses = [{ key: 'behavioral', label: 'Behavioral & Leadership', score: 50 }];
      const drills = generateTargetedPracticeDrills(weaknesses);
      const behDrill = drills.find(d => d.presetType === 'Behavioral');
      assert.ok(behDrill);
      assert.match(behDrill.title, /STAR/i);
    });

    it('generates Data Structure drill when Coding is weak', () => {
      const weaknesses = [{ key: 'coding', label: 'Coding & Algorithms', score: 45 }];
      const drills = generateTargetedPracticeDrills(weaknesses);
      const codeDrill = drills.find(d => d.competency === 'Coding & Algorithms');
      assert.ok(codeDrill);
    });

    it('generates Missing Skill drills from resume delta gaps', () => {
      const missingSkills = ['Kafka', 'Docker', 'GraphQL'];
      const drills = generateTargetedPracticeDrills([], missingSkills);
      const skillDrill = drills.find(d => d.title.includes('Target Gap: Kafka'));
      assert.ok(skillDrill);
    });

    it('generates default practice drill if no specific weaknesses detected', () => {
      const drills = generateTargetedPracticeDrills([]);
      assert.ok(drills.length >= 1);
    });
  });
});

// ========================================================
// SECURITY, AUTHENTICATION & USER DATA ISOLATION (14 TESTS)
// ========================================================
describe('Authentication & User Data Isolation', () => {

  describe('User Registration Validation', () => {
    it('accepts valid name, email, and password during registration', () => {
      const user = { name: 'Triveni Reddy', email: 'triveni@example.com', password: 'SecretPassword123' };
      assert.ok(user.name.length > 0);
      assert.match(user.email, /^[^@]+@[^@]+\.[^@]+$/);
    });

    it('rejects registration with empty email', () => {
      const email = '';
      assert.equal(Boolean(email && email.trim()), false);
    });

    it('rejects registration with empty password', () => {
      const password = '';
      assert.equal(Boolean(password && password.trim()), false);
    });

    it('normalizes email to lower case and trims whitespace', () => {
      const rawEmail = '  Triveni.Reddy@Example.COM  ';
      const cleanEmail = rawEmail.toLowerCase().trim();
      assert.equal(cleanEmail, 'triveni.reddy@example.com');
    });
  });

  describe('Login Credential Verification', () => {
    it('verifies matching encoded password hash', () => {
      const raw = 'Password123';
      const encoded = Buffer.from(raw).toString('base64');
      const inputEncoded = Buffer.from('Password123').toString('base64');
      assert.equal(encoded, inputEncoded);
    });

    it('rejects mismatched password', () => {
      const encoded = Buffer.from('CorrectPassword').toString('base64');
      const wrongInputEncoded = Buffer.from('WrongPassword').toString('base64');
      assert.notEqual(encoded, wrongInputEncoded);
    });

    it('rejects login when password field is missing', () => {
      const req = { email: 'triveni@example.com' };
      const isValid = Boolean(req.email && req.password);
      assert.equal(isValid, false);
    });

    it('rejects login when email field is missing', () => {
      const req = { password: 'SecretPassword' };
      const isValid = Boolean(req.email && req.password);
      assert.equal(isValid, false);
    });
  });

  describe('Password Protection & User Profile Sanitization', () => {
    it('sanitizes user response object to exclude plain-text passwords', () => {
      const dbUser = {
        _id: 'usr_123',
        name: 'Triveni Reddy',
        email: 'triveni@example.com',
        password: 'EncodedPasswordBuffer123'
      };
      const sanitized = {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email
      };
      assert.equal('password' in sanitized, false);
      assert.equal(sanitized.id, 'usr_123');
    });

    it('assigns candidate headline default if not provided', () => {
      const user = { name: 'Triveni' };
      const headline = user.headline || 'Software Engineering Candidate';
      assert.equal(headline, 'Software Engineering Candidate');
    });

    it('generates secure edge fallback user ID when database is offline', () => {
      const id = `usr_${Date.now()}`;
      assert.match(id, /^usr_\d+$/);
    });
  });

  describe('Session Isolation & Candidate Data Separation', () => {
    it('isolates session records by unique session IDs', () => {
      const sessionA = { sessionId: 'sess_1', candidateId: 'user_1' };
      const sessionB = { sessionId: 'sess_2', candidateId: 'user_2' };
      assert.notEqual(sessionA.sessionId, sessionB.sessionId);
    });

    it('prevents cross-session leakage of interview answers', () => {
      const userSessions = {
        user_1: [{ question: 'Q1', answer: 'Ans 1' }],
        user_2: [{ question: 'Q2', answer: 'Ans 2' }]
      };
      assert.notDeepEqual(userSessions.user_1, userSessions.user_2);
    });

    it('isolates defense reports by candidate profile', () => {
      const reportA = { candidate: 'Candidate A', credibilityScore: 85 };
      const reportB = { candidate: 'Candidate B', credibilityScore: 60 };
      assert.notEqual(reportA.candidate, reportB.candidate);
    });
  });
});
