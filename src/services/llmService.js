/**
 * Interview AI
 * LLM Service:
 * 1. Personalized Study Plan Generation
 * 2. Minimum Preparation Duration Calculation
 * 3. Layer 2 Resume Claim Verification
 */

import { GoogleGenAI } from '@google/genai';
import { getStudyMaterialForSkill, getStudyMaterialsForSkills } from '../data/studyMaterials.js';

export class LLMService {

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
  }

  /**
   * Estimate learning hours for different technical skills.
   *
   * These are approximate planning estimates.
   * They do not guarantee skill mastery.
   */
  getSkillLearningHours(skill) {

    const SKILL_HOURS = {
      Python: 35,
      JavaScript: 30,
      TypeScript: 25,
      React: 30,
      'Node.js': 30,
      'Express.js': 20,
      Django: 35,
      Prisma: 20,
      Docker: 20,
      AWS: 40,
      LLMs: 40,
      'Machine Learning': 60,
      'Deep Learning': 70,
      'System Design': 45,
      Cybersecurity: 50,
      SQL: 25
    };

    return SKILL_HOURS[skill] || 25;
  }

  /**
   * Estimate total learning effort from missing skills.
   */
  calculateLearningHours(missingSkills) {

    return missingSkills.reduce(
      (total, skill) => total + this.getSkillLearningHours(skill),
      0
    );
  }

  /**
   * Generate a personalized study plan.
   *
   * candidateProfile:
   * Candidate's extracted skills.
   *
   * deltaAnalysis:
   * Matching and missing job skills.
   *
   * preferredStudyWeeks:
   * Candidate's selected preparation duration.
   *
   * weeklyStudyHours:
   * Hours candidate can study per week.
   */
  async generateStudyPlan(
    candidateProfile,
    deltaAnalysis,
    preferredStudyWeeks = 4,
    weeklyStudyHours = 10,
    targetInfo = null
  ) {

    const existingSkills = candidateProfile.skills || [];
    const missingSkills = deltaAnalysis.missingSkills || [];
    const matchingSkills = deltaAnalysis.matchingSkills || [];

    const matchPercentage = deltaAnalysis.matchPercentage;

    const targetMatchScore =
      matchPercentage == null
        ? 'Not available - job description required'
        : `${matchPercentage}% current skill match`;

    // ------------------------------------
    // STEP 1: VALIDATE STUDY PREFERENCES
    // ------------------------------------

    const selectedHours = Number(weeklyStudyHours);

    const safeWeeklyHours =
      Number.isFinite(selectedHours) &&
      selectedHours >= 1 &&
      selectedHours <= 80
        ? selectedHours
        : 10;

    const selectedWeeks = Number(preferredStudyWeeks);

    const safePreferredWeeks =
      Number.isInteger(selectedWeeks) &&
      selectedWeeks >= 1 &&
      selectedWeeks <= 52
        ? selectedWeeks
        : 4;

    // ------------------------------------
    // STEP 2: ESTIMATE LEARNING EFFORT
    // ------------------------------------

    const estimatedLearningHours =
      this.calculateLearningHours(missingSkills);

    const minimumStudyWeeks =
      missingSkills.length === 0
        ? 1
        : Math.max(
            1,
            Math.ceil(
              estimatedLearningHours / safeWeeklyHours
            )
          );

    // ------------------------------------
    // STEP 3: DETERMINE FINAL DURATION
    // ------------------------------------

    const finalStudyWeeks = Math.max(
      safePreferredWeeks,
      minimumStudyWeeks
    );

    // Limit AI-generated roadmaps to 52 weeks.
    if (finalStudyWeeks > 52) {
      throw new Error(
        `Estimated minimum duration is ${minimumStudyWeeks} weeks. ` +
        `Please increase your weekly study hours to generate a plan ` +
        `within the supported 52-week limit.`
      );
    }

    const durationAdjusted =
      finalStudyWeeks > safePreferredWeeks;

    const domain =
      candidateProfile.domainCategory || 'Technical Skills';

    const targetCompany = (targetInfo?.company || deltaAnalysis?.targetCompany || '').trim();
    const targetRole = (targetInfo?.role || deltaAnalysis?.targetRole || domain || 'Software Engineering').trim();
    const experienceLevel = (targetInfo?.experienceLevel || deltaAnalysis?.experienceLevel || '').trim();

    const planTitle = targetCompany
      ? `Personalized Up-Skilling Roadmap: ${targetRole} @ ${targetCompany}`
      : `Personalized Technical Study Plan - ${targetRole}`;

    // Shared duration information.
    const durationInfo = {
      preferredStudyWeeks: safePreferredWeeks,
      weeklyStudyHours: safeWeeklyHours,
      minimumStudyWeeks,
      finalStudyWeeks,
      estimatedLearningHours,
      durationAdjusted,
      targetCompany,
      targetRole,
      experienceLevel
    };

    // ------------------------------------
    // STEP 4: CHECK JOB DESCRIPTION
    // ------------------------------------

    if (!deltaAnalysis.requiredSkills?.length) {
      return {
        title: planTitle,
        targetCompany,
        targetRole,
        experienceLevel,
        targetMatchScore,
        ...durationInfo,
        summary:
          'Provide a job description to generate a skill-gap study plan.',
        recommendedModules: []
      };
    }

    // ------------------------------------
    // STEP 5: NO MISSING SKILLS
    // ------------------------------------

    if (missingSkills.length === 0) {

      const modules = Array.from(
        { length: finalStudyWeeks },
        (_, index) => ({
          week: `Week ${index + 1}`,
          topic: `Technical Interview Preparation & System Design`,
          focusAreas: [
            `Review ${targetRole} architecture patterns.`,
            `Practice explaining projects matching ${targetCompany || 'target'} standards.`,
            'Solve technical interview questions.'
          ],
          estimatedHours: safeWeeklyHours,
          studyMaterial: getStudyMaterialForSkill('System Design')
        })
      );

      return {
        title: targetCompany
          ? `Interview Readiness Plan: ${targetRole} @ ${targetCompany}`
          : 'Technical Interview Preparation Plan',
        targetCompany,
        targetRole,
        experienceLevel,
        targetMatchScore,
        ...durationInfo,
        summary: targetCompany
          ? `All identified technical skills match the requirements for ${targetRole} at ${targetCompany}! Focus on system design and mock interviews.`
          : 'All identified technical skills match the job requirements. Focus on interview preparation.',
        skillMaterials: getStudyMaterialsForSkills(['System Design']),
        recommendedModules: modules
      };
    }

    // ------------------------------------
    // STEP 6: FALLBACK PLAN
    // ------------------------------------

    // ------------------------------------
// STEP 6: PROGRESSIVE FALLBACK PLAN
// ------------------------------------

// ------------------------------------
// STEP 6: PROGRESSIVE FALLBACK PLAN
// ------------------------------------

const fallbackPlan = () => {
  const SKILL_ROADMAPS = {
    Python: [
      {
        topic: 'Python Fundamentals',
        focusAreas: [
          'Learn variables, data types, conditions, loops, and functions.',
          'Practice lists, dictionaries, sets, and string operations.',
          'Build a command-line calculator or student marks manager.'
        ]
      },
      {
        topic: 'Intermediate Python',
        focusAreas: [
          'Learn object-oriented programming, classes, and inheritance.',
          'Practice exception handling, file operations, and modules.',
          'Build a file-based student record management application.'
        ]
      },
      {
        topic: 'Python Backend Development',
        focusAreas: [
          'Understand REST APIs, HTTP methods, and JSON responses.',
          'Create API endpoints using FastAPI.',
          'Build a small backend service with CRUD operations.'
        ]
      }
    ],

    Prisma: [
      {
        topic: 'Prisma ORM Fundamentals',
        focusAreas: [
          'Understand ORM concepts and relational database schemas.',
          'Create Prisma models and configure a database connection.',
          'Implement basic CRUD operations using Prisma Client.'
        ]
      },
      {
        topic: 'Advanced Prisma',
        focusAreas: [
          'Learn database relationships, migrations, and constraints.',
          'Practice filtering, sorting, pagination, and transactions.',
          'Build a Node.js API with Prisma and PostgreSQL.'
        ]
      }
    ],

    LLMs: [
      {
        topic: 'Large Language Model Fundamentals',
        focusAreas: [
          'Understand tokens, context windows, and model inference.',
          'Learn prompt engineering and structured JSON responses.',
          'Build a basic application that calls an LLM API.'
        ]
      },
      {
        topic: 'Building Applications with LLMs',
        focusAreas: [
          'Learn embeddings and semantic similarity.',
          'Understand Retrieval-Augmented Generation (RAG).',
          'Build a document question-answering prototype.'
        ]
      },
      {
        topic: 'Advanced LLM Integration',
        focusAreas: [
          'Study tool calling, output validation, and error handling.',
          'Learn prompt-injection risks and evaluation techniques.',
          'Build an LLM-powered application with logging and tests.'
        ]
      }
    ],

    'System Design': [
      {
        topic: 'System Design Fundamentals',
        focusAreas: [
          'Understand scalability, latency, throughput, and availability.',
          'Learn load balancing, caching, and database indexing.',
          'Draw the architecture of a basic web application.'
        ]
      },
      {
        topic: 'Distributed Systems',
        focusAreas: [
          'Understand horizontal scaling and database replication.',
          'Study message queues and asynchronous processing.',
          'Design a scalable notification service.'
        ]
      },
      {
        topic: 'Advanced System Design',
        focusAreas: [
          'Study microservices, fault tolerance, and API gateways.',
          'Compare consistency, availability, and partition tolerance.',
          'Design and document a scalable e-commerce platform.'
        ]
      }
    ]
  };

  // Convert each missing skill into learning stages.
  const learningStages = missingSkills.flatMap((skill) => {
    if (SKILL_ROADMAPS[skill]) {
      return SKILL_ROADMAPS[skill].map(stage => ({
        ...stage,
        skill
      }));
    }

    return [
      {
        skill,
        topic: `${skill} Fundamentals`,
        focusAreas: [
          `Identify the core concepts and terminology of ${skill}.`,
          `Complete introductory exercises using ${skill}.`,
          `Build a small working example demonstrating ${skill}.`
        ]
      },
      {
        skill,
        topic: `${skill} Practical Applications`,
        focusAreas: [
          `Explore intermediate features and common use cases of ${skill}.`,
          `Solve practical problems using ${skill}.`,
          `Build and test a mini-project involving ${skill}.`
        ]
      }
    ];
  });

  /*
   * Divide each stage into smaller learning units.
   *
   * Each focus area becomes a separate unit.
   * This prevents us from repeating entire stages
   * when the candidate selects more weeks.
   */
  const learningUnits = learningStages.flatMap(stage =>
    stage.focusAreas.map((activity, index) => ({
      skill: stage.skill,
      stageTopic: stage.topic,
      activity,
      activityIndex: index
    }))
  );

  /*
   * Create exactly the requested number of weeks.
   *
   * For shorter plans:
   * Multiple activities are grouped into one week.
   *
   * For longer plans:
   * Activities are spread out, followed by
   * additional practical work and revision.
   */
  const modules = Array.from(
    { length: finalStudyWeeks },
    (_, weekIndex) => {
      const totalUnits = learningUnits.length;

      const start = Math.floor(
        weekIndex * totalUnits / finalStudyWeeks
      );

      const end = Math.floor(
        (weekIndex + 1) * totalUnits / finalStudyWeeks
      );

      const selectedUnits = learningUnits.slice(start, end);

      // When a week has new learning activities.
      if (selectedUnits.length > 0) {
        const firstUnit = selectedUnits[0];

        const uniqueTopics = [
          ...new Set(selectedUnits.map(unit => unit.stageTopic))
        ];

        const topic = uniqueTopics.join(' + ');

        const focusAreas = selectedUnits.map(unit => unit.activity);

        // Add a distinct practical activity.
        const practicalActivity =
          `Apply this week's ${firstUnit.skill} concepts in a ` +
          `small practical exercise and document your results.`;

        const activities = [
          ...focusAreas.slice(0, 2),
          practicalActivity
        ];

        const material =
          getStudyMaterialForSkill(firstUnit.skill) ||
          getStudyMaterialForSkill(topic);

        return {
          week: `Week ${weekIndex + 1}`,
          topic,
          focusAreas: activities,
          estimatedHours: safeWeeklyHours,
          studyMaterial: material
        };
      }

      /*
       * If the duration is longer than the number
       * of available learning units, use additional
       * practice and revision activities.
       */
      const skillIndex =
        weekIndex % missingSkills.length;

      const skill = missingSkills[skillIndex];

      const practiceTypes = [
        {
          title: 'Practical Implementation',
          activities: [
            `Build a working application using ${skill}.`,
            `Test the application's main features.`,
            `Document the implementation and challenges.`
          ]
        },
        {
          title: 'Debugging and Improvement',
          activities: [
            `Review and debug an existing ${skill} project.`,
            `Improve performance, readability, and reliability.`,
            `Record the changes and explain your decisions.`
          ]
        },
        {
          title: 'Interview Preparation',
          activities: [
            `Review important ${skill} concepts.`,
            `Practice technical interview questions on ${skill}.`,
            `Explain a practical ${skill} project step by step.`
          ]
        },
        {
          title: 'Project Enhancement',
          activities: [
            `Extend an existing ${skill} project with a new feature.`,
            `Add appropriate tests and error handling.`,
            `Prepare a short technical demonstration.`
          ]
        }
      ];

      const practice =
        practiceTypes[
          Math.floor(weekIndex / missingSkills.length) %
          practiceTypes.length
        ];

      return {
        week: `Week ${weekIndex + 1}`,
        topic: `${skill} - ${practice.title}`,
        focusAreas: practice.activities,
        estimatedHours: safeWeeklyHours,
        studyMaterial: getStudyMaterialForSkill(skill)
      };
    }
  );

  const summary = targetCompany
    ? `Targeting ${targetRole} at ${targetCompany} (${experienceLevel || 'Engineering'}). This ${finalStudyWeeks}-week preparation plan bridges identified skill gaps: ${missingSkills.join(', ')}.`
    : `This ${finalStudyWeeks}-week preparation plan covers the identified skill gaps: ${missingSkills.join(', ')}.`;

  return {
    title: planTitle,
    targetCompany,
    targetRole,
    experienceLevel,
    targetMatchScore,
    ...durationInfo,
    isFallback: true,
    summary,
    skillMaterials: getStudyMaterialsForSkills(missingSkills),
    recommendedModules: modules
  };
};

  // Compute fallbackSummary here so it is accessible in both
  // the fallbackPlan closure above and the Gemini return path below.
  const fallbackSummary = targetCompany
    ? `Targeting ${targetRole} at ${targetCompany} (${experienceLevel || 'Engineering'}). This ${finalStudyWeeks}-week preparation plan bridges identified skill gaps: ${missingSkills.join(', ')}.`
    : `This ${finalStudyWeeks}-week preparation plan covers the identified skill gaps: ${missingSkills.join(', ')}.`;
    // ------------------------------------
    // STEP 7: CHECK GEMINI API KEY
    // ------------------------------------

    if (!this.apiKey) {
      console.warn(
        'GEMINI_API_KEY missing. Using fallback study plan.'
      );

      return fallbackPlan();
    }

    // ------------------------------------
    // STEP 8: GENERATE PLAN USING GEMINI
    // ------------------------------------

    try {

      const ai = new GoogleGenAI({
        apiKey: this.apiKey
      });

      const prompt = `
You are an expert technical career mentor.

Create a personalized technical up-skilling roadmap
for a job applicant.

CANDIDATE INFORMATION:

Existing Skills:
${JSON.stringify(existingSkills)}

Matching Job Skills:
${JSON.stringify(matchingSkills)}

Missing Skills:
${JSON.stringify(missingSkills)}

Technical Domain:
${domain}

STUDY PREFERENCES:

Available Study Hours Per Week:
${safeWeeklyHours}

Estimated Total Learning Hours:
${estimatedLearningHours}

Minimum Recommended Duration:
${minimumStudyWeeks} weeks

Final Preparation Duration:
${finalStudyWeeks} weeks

REQUIREMENTS:

1. Generate exactly ${finalStudyWeeks} weekly modules.

2. Cover every missing skill across the roadmap.

3. Difficult skills may require multiple weeks.

4. Related skills may be combined into one module.

5. Personalize the plan using existing candidate skills.

6. Start with foundational topics before advanced topics.

7. Include specific technical learning objectives.

8. Include practical exercises and hands-on assignments.

9. Include small projects where appropriate.

10. Make the roadmap progressive.

11. Do not invent candidate qualifications or experience.

12. Keep each week's learning activities realistic for
    ${safeWeeklyHours} available study hours.

13. Return only valid JSON.

REQUIRED JSON FORMAT:

{
  "summary": "Personalized explanation of the study plan",
  "recommendedModules": [
    {
      "week": "Week 1",
      "topic": "Specific technical topic",
      "focusAreas": [
        "Specific technical concept",
        "Hands-on learning activity",
        "Practical project or assignment"
      ],
      "estimatedHours": ${safeWeeklyHours}
    }
  ]
}

IMPORTANT:
The recommendedModules array must contain exactly
${finalStudyWeeks} modules.
`;

      let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    break; // Stop retrying after success.
  } catch (error) {
    const errorText = String(error.message || error);

    const isTemporaryError =
      error.status === 503 ||
      error.code === 503 ||
      errorText.includes('"code":503') ||
      errorText.includes('UNAVAILABLE');

    // Do not retry errors such as invalid API keys.
    if (!isTemporaryError || attempt === 3) {
      throw error;
    }

    const waitTime = attempt * 2000;

    console.warn(
      `Gemini temporarily unavailable. Retry ${attempt}/2 in ${waitTime / 1000} seconds...`
    );

    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

      const plan = JSON.parse(response.text);

      // ------------------------------------
      // STEP 9: VALIDATE GEMINI RESPONSE
      // ------------------------------------

      if (!Array.isArray(plan.recommendedModules)) {
        throw new Error(
          'Gemini did not return a valid modules array.'
        );
      }

      if (
        plan.recommendedModules.length !== finalStudyWeeks
      ) {
        throw new Error(
          `Expected ${finalStudyWeeks} modules, but Gemini returned ` +
          `${plan.recommendedModules.length}.`
        );
      }

      // ------------------------------------
      // STEP 10: FORMAT WEEKLY MODULES
      // ------------------------------------

      const modules = plan.recommendedModules.map(
        (module, index) => {

          if (
            !module ||
            typeof module.topic !== 'string' ||
            !module.topic.trim() ||
            !Array.isArray(module.focusAreas)
          ) {
            throw new Error(
              `Invalid study module for Week ${index + 1}.`
            );
          }

          const focusAreas = module.focusAreas
            .filter(
              area =>
                typeof area === 'string' &&
                area.trim()
            )
            .slice(0, 3);

          if (focusAreas.length === 0) {
            throw new Error(
              `Missing learning objectives for Week ${index + 1}.`
            );
          }

          const matchedMaterial =
            getStudyMaterialForSkill(module.topic) ||
            getStudyMaterialForSkill(
              missingSkills.find((s) =>
                module.topic.toLowerCase().includes(s.toLowerCase())
              )
            ) ||
            getStudyMaterialForSkill(missingSkills[index % missingSkills.length]);

          return {
            week: `Week ${index + 1}`,
            topic: module.topic,
            focusAreas,
            estimatedHours: safeWeeklyHours,
            studyMaterial: matchedMaterial
          };
        }
      );

      // ------------------------------------
      // STEP 11: RETURN PERSONALIZED PLAN
      // ------------------------------------

      console.log("✅ Gemini API successfully generated the personalized study plan!");
      return {
        title: planTitle,
        targetCompany,
        targetRole,
        experienceLevel,
        targetMatchScore,
        ...durationInfo,
        isFallback: false,
        summary:
          typeof plan.summary === 'string' &&
          plan.summary.trim()
            ? plan.summary
            : fallbackSummary,
        skillMaterials: getStudyMaterialsForSkills(missingSkills),
        recommendedModules: modules
      };

    } catch (error) {

      console.error(
        'Gemini study plan generation failed:',
        error.message
      );

      return fallbackPlan();
    }
  }

  /**
   * Layer 2 Governance System:
   * Resume Factuality Check
   *
   * Checks whether claim terms are supported
   * by the redacted resume.
   *
   * This is a heuristic consistency check,
   * not independent factual verification.
   */
  async verifyClaimAgainstResume(claim, redactedResumeText) {

    const claimLower = claim.toLowerCase();
    const resumeLower = redactedResumeText.toLowerCase();

    const stopWords = new Set([
      'candidate',
      'applicant',
      'person',
      'individual',
      'resume',
      'is',
      'was',
      'has',
      'have',
      'been',
      'with',
      'that',
      'this'
    ]);

    const claimTokens = claimLower
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(
        word =>
          word.length >= 3 &&
          !stopWords.has(word)
      );

    if (claimTokens.length === 0) {
      return {
        isVerified: true,
        factualityScore: 100,
        status: 'FACT_VERIFIED',
        note:
          'No substantive claim terms were provided for comparison.'
      };
    }

    const matches = claimTokens.filter(token => {

      if (resumeLower.includes(token)) {
        return true;
      }

      const rootStem = token.substring(
        0,
        Math.min(token.length - 2, 6)
      );

      if (
        rootStem.length >= 4 &&
        resumeLower.includes(rootStem)
      ) {
        return true;
      }

      return false;
    });

    const factualityScore = Math.round(
      (matches.length / claimTokens.length) * 100
    );

    const isVerified = factualityScore >= 50;

    return {
      isVerified,
      factualityScore,
      status: isVerified
        ? 'FACT_VERIFIED'
        : 'UNVERIFIED_CLAIM',
      note: isVerified
        ? `Claim terms (${matches.join(', ')}) found in resume text.`
        : `Potentially unsupported terms: ` +
          `${claimTokens.filter(token => !matches.includes(token)).join(', ')}.`
    };
  }
}