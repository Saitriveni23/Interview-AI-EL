/**
 * Interview AI - Improved Skill Extraction Service
 *
 * Responsibilities:
 * 1. Extract technical skills from resumes.
 * 2. Identify the candidate's technical domain.
 * 3. Extract required skills from job descriptions.
 * 4. Compare candidate skills with job requirements.
 * 5. Identify matching and missing skills.
 * 6. Calculate skill-match percentage.
 */

// Canonical skill names and their alternative spellings
const SKILL_DEFINITIONS = {
  // Frontend Development
  "HTML": ["HTML", "HTML5"],
  "CSS": ["CSS", "CSS3"],
  "JavaScript": ["JavaScript", "JS"],
  "TypeScript": ["TypeScript", "TS"],
  "React": ["React", "React.js", "ReactJS"],
  "Angular": ["Angular", "AngularJS"],
  "Vue": ["Vue", "Vue.js", "VueJS"],
  "Next.js": ["Next.js", "NextJS"],
  "Tailwind CSS": ["Tailwind CSS", "TailwindCSS"],
  "Bootstrap": ["Bootstrap"],
  "Redux": ["Redux"],
  "Vite": ["Vite"],
  "Webpack": ["Webpack"],

  // Backend Development
  "Node.js": ["Node.js", "NodeJS"],
  "Express.js": ["Express", "Express.js", "ExpressJS"],
  "Python": ["Python", "Python3"],
  "Java": ["Java"],
  "C": ["C Programming", "C Language", "Programming in C"],
  "C++": ["C++", "CPP"],
  "C#": ["C#", "C Sharp"],
  "Go": ["Golang", "Go Language"],
  "Rust": ["Rust"],
  "PHP": ["PHP"],
  "Ruby": ["Ruby"],
  "Django": ["Django"],
  "Flask": ["Flask"],
  "FastAPI": ["FastAPI"],
  "Spring Boot": ["Spring Boot", "SpringBoot"],
  ".NET": [".NET", "Dot Net", "ASP.NET"],
  "REST API": ["REST API", "RESTful API", "REST APIs"],
  "GraphQL": ["GraphQL"],

  // Databases
  "SQL": ["SQL"],
  "MySQL": ["MySQL"],
  "PostgreSQL": ["PostgreSQL", "Postgres"],
  "MongoDB": ["MongoDB", "Mongo DB"],
  "Redis": ["Redis"],
  "SQLite": ["SQLite"],
  "Oracle Database": ["Oracle Database", "Oracle DB"],
  "Firebase": ["Firebase"],
  "Prisma": ["Prisma"],

  // Cloud and DevOps
  "AWS": ["AWS", "Amazon Web Services"],
  "Azure": ["Azure", "Microsoft Azure"],
  "GCP": ["GCP", "Google Cloud Platform"],
  "Docker": ["Docker"],
  "Kubernetes": ["Kubernetes", "K8s"],
  "Git": ["Git"],
  "GitHub": ["GitHub"],
  "GitLab": ["GitLab"],
  "Linux": ["Linux"],
  "CI/CD": ["CI/CD", "Continuous Integration", "Continuous Deployment"],
  "Jenkins": ["Jenkins"],
  "Terraform": ["Terraform"],
  "Ansible": ["Ansible"],

  // AI and Machine Learning
  "Machine Learning": ["Machine Learning"],
  "Deep Learning": ["Deep Learning"],
  "Artificial Intelligence": ["Artificial Intelligence"],
  "NLP": ["NLP", "Natural Language Processing"],
  "Computer Vision": ["Computer Vision"],
  "LLMs": ["LLM", "LLMs", "Large Language Models"],
  "Generative AI": ["Generative AI", "GenAI"],
  "TensorFlow": ["TensorFlow"],
  "PyTorch": ["PyTorch"],
  "Scikit-learn": ["Scikit-learn", "Scikit Learn", "sklearn"],
  "Pandas": ["Pandas"],
  "NumPy": ["NumPy"],
  "OpenCV": ["OpenCV"],
  "LangChain": ["LangChain"],
  "Hugging Face": ["Hugging Face", "HuggingFace"],

  // Cybersecurity
  "Cybersecurity": ["Cybersecurity", "Cyber Security"],
  "Network Security": ["Network Security"],
  "Ethical Hacking": ["Ethical Hacking"],
  "Penetration Testing": ["Penetration Testing", "Pen Testing", "Pentesting"],
  "SIEM": ["SIEM"],
  "SOC": ["Security Operations Center", "SOC Analyst", "SOC Operations"],
  "Incident Response": ["Incident Response"],
  "Threat Intelligence": ["Threat Intelligence"],
  "Vulnerability Assessment": ["Vulnerability Assessment"],
  "Wireshark": ["Wireshark"],
  "Nmap": ["Nmap"],
  "Burp Suite": ["Burp Suite"],
  "Splunk": ["Splunk"],
  "Cryptography": ["Cryptography"],
  "OWASP": ["OWASP"],

  // Data Science and Analytics
  "Data Science": ["Data Science"],
  "Data Analysis": ["Data Analysis", "Data Analytics"],
  "Data Engineering": ["Data Engineering"],
  "Power BI": ["Power BI", "PowerBI"],
  "Tableau": ["Tableau"],
  "Excel": ["Microsoft Excel", "MS Excel", "Excel"],
  "Apache Spark": ["Apache Spark", "PySpark"],
  "Hadoop": ["Hadoop"],
  "ETL": ["ETL", "Extract Transform Load"],

  // Mobile Development
  "Android": ["Android", "Android Development"],
  "iOS": ["iOS", "iOS Development"],
  "Flutter": ["Flutter"],
  "React Native": ["React Native"],
  "Kotlin": ["Kotlin"],
  "Swift": ["Swift"],
  "Dart": ["Dart"],

  // Core Computer Science
  "Data Structures": ["Data Structures", "DSA"],
  "Algorithms": ["Algorithms"],
  "Operating Systems": ["Operating Systems"],
  "Computer Networks": ["Computer Networks", "Computer Networking"],
  "DBMS": ["DBMS", "Database Management Systems"],
  "OOP": ["OOP", "Object Oriented Programming", "Object-Oriented Programming"],
  "System Design": ["System Design"],
  "Microservices": ["Microservices"],
  "Unit Testing": ["Unit Testing"],
  "Agile": ["Agile"],
  "Scrum": ["Scrum"]
};


export class SkillExtractor {

  /**
   * Escape special characters in skill names.
   * Example: C++, C#, .NET
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }


  /**
   * Detect skills from any supplied text.
   *
   * Used for:
   * - Resume skill extraction
   * - Job description skill extraction
   */
  detectSkills(text) {
    if (!text || typeof text !== "string") {
      return [];
    }

    const detectedSkills = [];

    for (const [canonicalSkill, aliases] of Object.entries(SKILL_DEFINITIONS)) {

      const found = aliases.some(alias => {

        const escapedAlias = this.escapeRegExp(alias);

        // Prevent partial word matches.
        const regex = new RegExp(
          `(^|[^A-Za-z0-9])${escapedAlias}(?=$|[^A-Za-z0-9])`,
          "i"
        );

        return regex.test(text);
      });

      if (found) {
        detectedSkills.push(canonicalSkill);
      }
    }

    return detectedSkills;
  }


  /**
   * Extract explicitly stated years of experience.
   *
   * Returns null when no clear experience duration
   * is mentioned.
   */
  extractExperienceYears(text) {

    if (!text || typeof text !== "string") {
      return null;
    }

    const patterns = [
      /\b(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)\s+(?:of\s+)?(?:professional\s+|work\s+|industry\s+)?experience\b/i,

      /\bexperience\s*:\s*(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)\b/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);

      if (match) {
        return Number(match[1]);
      }
    }

    return null;
  }


  /**
   * Extract candidate profile from redacted resume.
   */
  extract(redactedText) {

    const detectedSkills = this.detectSkills(redactedText);

    const experienceYears = this.extractExperienceYears(redactedText);

    return {
      skills: detectedSkills,

      estimatedExperienceYears: experienceYears,

      domainCategory: this.inferDomain(detectedSkills)
    };
  }


  /**
   * Compare candidate skills with job requirements.
   */
  calculateDelta(candidateSkills, jobDescription) {

    const safeCandidateSkills = Array.isArray(candidateSkills)
      ? candidateSkills
      : [];

    // No job description provided
    if (!jobDescription || !jobDescription.trim()) {

      return {
        requiredSkills: [],
        matchingSkills: [],
        missingSkills: [],
        matchPercentage: null,
        gapAnalysis: "Please provide a job description to calculate skill gaps."
      };
    }

    // Extract skills required by the job
    const requiredSkills = this.detectSkills(jobDescription);

    // No recognized technical requirements
    if (requiredSkills.length === 0) {

      return {
        requiredSkills: [],
        matchingSkills: [],
        missingSkills: [],
        matchPercentage: null,
        gapAnalysis:
          "No recognizable technical skills were found in the job description."
      };
    }

    // Convert candidate skills to lowercase for comparison
    const candidateSkillsLower = new Set(
      safeCandidateSkills.map(skill => skill.toLowerCase())
    );

    // Identify matching skills
    const matchingSkills = requiredSkills.filter(skill =>
      candidateSkillsLower.has(skill.toLowerCase())
    );

    // Identify missing skills
    const missingSkills = requiredSkills.filter(skill =>
      !candidateSkillsLower.has(skill.toLowerCase())
    );

    // Calculate match percentage
    const matchPercentage = Math.round(
      (matchingSkills.length / requiredSkills.length) * 100
    );

    // Generate gap analysis
    let gapAnalysis;

    if (missingSkills.length > 0) {

      gapAnalysis =
        `Candidate matches ${matchingSkills.length} out of ` +
        `${requiredSkills.length} identified technical requirements. ` +
        `Missing skills: ${missingSkills.join(", ")}.`;

    } else {

      gapAnalysis =
        "Candidate matches all identified technical skill requirements.";
    }

    return {
      requiredSkills,
      matchingSkills,
      missingSkills,
      matchPercentage,
      gapAnalysis
    };
  }


  /**
   * Identify candidate's primary technical domain.
   */
  inferDomain(skills) {

    if (!skills || skills.length === 0) {
      return "General Software Engineering";
    }

    const skillSet = new Set(skills);

    const domains = {

      "Frontend Engineering": [
        "HTML",
        "CSS",
        "JavaScript",
        "TypeScript",
        "React",
        "Angular",
        "Vue",
        "Next.js",
        "Tailwind CSS"
      ],

      "Backend Engineering": [
        "Node.js",
        "Express.js",
        "Django",
        "Flask",
        "FastAPI",
        "Spring Boot",
        "REST API",
        "GraphQL"
      ],

      "AI / Machine Learning": [
        "Machine Learning",
        "Deep Learning",
        "Artificial Intelligence",
        "NLP",
        "Computer Vision",
        "LLMs",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn"
      ],

      "Cybersecurity": [
        "Cybersecurity",
        "Network Security",
        "Ethical Hacking",
        "Penetration Testing",
        "SIEM",
        "Incident Response",
        "Threat Intelligence",
        "Wireshark",
        "Nmap"
      ],

      "Cloud / DevOps": [
        "AWS",
        "Azure",
        "GCP",
        "Docker",
        "Kubernetes",
        "Terraform",
        "Jenkins",
        "Ansible"
      ],

      "Data Science / Analytics": [
        "Data Science",
        "Data Analysis",
        "Data Engineering",
        "Pandas",
        "NumPy",
        "Power BI",
        "Tableau",
        "Apache Spark"
      ],

      "Mobile Development": [
        "Android",
        "iOS",
        "Flutter",
        "React Native",
        "Kotlin",
        "Swift",
        "Dart"
      ]
    };

    let bestDomain = "General Software Engineering";
    let highestScore = 0;

    for (const [domain, domainSkills] of Object.entries(domains)) {

      const score = domainSkills.filter(skill =>
        skillSet.has(skill)
      ).length;

      if (score > highestScore) {
        highestScore = score;
        bestDomain = domain;
      }
    }

    return bestDomain;
  }
}