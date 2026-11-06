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
// Aliases are intentionally broad to capture LinkedIn-style abstract language.
export const SKILL_DEFINITIONS = {
  // Frontend Development
  "HTML": ["HTML", "HTML5", "markup", "web markup"],
  "CSS": ["CSS", "CSS3", "stylesheet", "stylesheets", "styling"],
  "JavaScript": ["JavaScript", "JS", "ECMAScript", "ES6", "ES2015", "vanilla JS", "vanilla JavaScript"],
  "TypeScript": ["TypeScript", "TS", "typed JavaScript"],
  "React": ["React", "React.js", "ReactJS", "React framework", "React components", "React hooks"],
  "Angular": ["Angular", "AngularJS", "Angular framework"],
  "Vue": ["Vue", "Vue.js", "VueJS", "Vue framework"],
  "Next.js": ["Next.js", "NextJS", "Next js", "server-side rendering", "SSR framework"],
  "Tailwind CSS": ["Tailwind CSS", "TailwindCSS", "Tailwind"],
  "Bootstrap": ["Bootstrap"],
  "Redux": ["Redux", "state management", "Redux Toolkit"],
  "Vite": ["Vite"],
  "Webpack": ["Webpack", "bundler", "module bundler"],

  // Backend Development
  "Node.js": ["Node.js", "NodeJS", "Node js", "Node", "server-side JavaScript", "server-side JS"],
  "Express.js": ["Express", "Express.js", "ExpressJS", "Express js", "Express framework"],
  "Python": ["Python", "Python3", "Py"],
  "Java": ["Java", "Core Java", "Java SE", "Java EE"],
  "C": ["C Programming", "C Language", "Programming in C"],
  "C++": ["C++", "CPP"],
  "C#": ["C#", "C Sharp", "dotnet C#"],
  "Go": ["Golang", "Go Language", "Go programming"],
  "Rust": ["Rust", "Rust language"],
  "PHP": ["PHP"],
  "Ruby": ["Ruby", "Ruby on Rails", "Rails"],
  "Django": ["Django", "Django REST"],
  "Flask": ["Flask"],
  "FastAPI": ["FastAPI"],
  "Spring Boot": ["Spring Boot", "SpringBoot", "Spring", "Spring framework"],
  ".NET": [".NET", "Dot Net", "ASP.NET", "dotnet", "C# .NET"],
  "REST API": ["REST API", "RESTful API", "REST APIs", "REST", "RESTful", "RESTful Web Services",
               "REST Services", "API development", "web APIs", "API design", "API integration",
               "HTTP APIs", "web services", "backend APIs", "API endpoints", "JSON API"],
  "GraphQL": ["GraphQL", "Graph QL"],

  // Databases
  "SQL": ["SQL", "relational database", "relational databases", "relational DB", "RDBMS",
          "database queries", "SQL queries", "structured query language"],
  "MySQL": ["MySQL"],
  "PostgreSQL": ["PostgreSQL", "Postgres", "Postgres DB"],
  "MongoDB": ["MongoDB", "Mongo DB", "NoSQL database", "document database", "document DB"],
  "Redis": ["Redis", "caching", "cache layer", "in-memory database"],
  "SQLite": ["SQLite"],
  "Oracle Database": ["Oracle Database", "Oracle DB", "Oracle"],
  "Firebase": ["Firebase", "Firestore", "Firebase Realtime Database"],
  "Prisma": ["Prisma", "Prisma ORM", "ORM"],

  // Cloud and DevOps
  "AWS": ["AWS", "Amazon Web Services", "Amazon cloud", "cloud infrastructure", "S3", "EC2", "Lambda"],
  "Azure": ["Azure", "Microsoft Azure", "Azure cloud"],
  "GCP": ["GCP", "Google Cloud Platform", "Google Cloud"],
  "Docker": ["Docker", "containerization", "containers", "container orchestration"],
  "Kubernetes": ["Kubernetes", "K8s", "container orchestration"],
  "Git": ["Git", "version control", "source control", "version control system",
          "VCS", "source code management", "SCM"],
  "GitHub": ["GitHub", "GitHub Actions", "GitHub CI"],
  "GitLab": ["GitLab", "GitLab CI"],
  "Linux": ["Linux", "Unix", "Linux server", "shell scripting", "bash", "bash scripting", "shell scripts"],
  "CI/CD": ["CI/CD", "Continuous Integration", "Continuous Deployment", "Continuous Delivery",
             "DevOps pipeline", "deployment pipeline", "build pipeline", "automated deployment"],
  "Jenkins": ["Jenkins", "Jenkins CI", "Jenkins pipeline"],
  "Terraform": ["Terraform", "infrastructure as code", "IaC"],
  "Ansible": ["Ansible", "configuration management"],

  // AI and Machine Learning
  "Machine Learning": ["Machine Learning", "ML", "ML models", "predictive modeling",
                       "supervised learning", "unsupervised learning"],
  "Deep Learning": ["Deep Learning", "neural networks", "neural network"],
  "Artificial Intelligence": ["Artificial Intelligence", "AI", "AI systems"],
  "NLP": ["NLP", "Natural Language Processing", "text processing", "text analysis"],
  "Computer Vision": ["Computer Vision", "image recognition", "image processing"],
  "LLMs": ["LLM", "LLMs", "Large Language Models", "language models", "GPT", "foundation models"],
  "Generative AI": ["Generative AI", "GenAI", "AI generation", "AI-generated"],
  "TensorFlow": ["TensorFlow", "TF"],
  "PyTorch": ["PyTorch"],
  "Scikit-learn": ["Scikit-learn", "Scikit Learn", "sklearn"],
  "Pandas": ["Pandas", "data manipulation", "dataframes"],
  "NumPy": ["NumPy", "numerical computing"],
  "OpenCV": ["OpenCV"],
  "LangChain": ["LangChain"],
  "Hugging Face": ["Hugging Face", "HuggingFace", "transformers"],

  // Cybersecurity
  "Cybersecurity": ["Cybersecurity", "Cyber Security", "information security", "InfoSec",
                    "application security", "AppSec", "security engineering"],
  "Network Security": ["Network Security", "network protection", "firewall"],
  "Ethical Hacking": ["Ethical Hacking", "white hat", "red team"],
  "Penetration Testing": ["Penetration Testing", "Pen Testing", "Pentesting", "security testing"],
  "SIEM": ["SIEM", "security monitoring"],
  "SOC": ["Security Operations Center", "SOC Analyst", "SOC Operations"],
  "Incident Response": ["Incident Response", "IR", "security incidents"],
  "Threat Intelligence": ["Threat Intelligence", "threat analysis"],
  "Vulnerability Assessment": ["Vulnerability Assessment", "vulnerability scanning"],
  "Wireshark": ["Wireshark"],
  "Nmap": ["Nmap"],
  "Burp Suite": ["Burp Suite", "Burp"],
  "Splunk": ["Splunk"],
  "Cryptography": ["Cryptography", "encryption", "PKI"],
  "OWASP": ["OWASP", "OWASP Top 10"],

  // Data Science and Analytics
  "Data Science": ["Data Science", "data scientist"],
  "Data Analysis": ["Data Analysis", "Data Analytics", "data insights", "data reporting"],
  "Data Engineering": ["Data Engineering", "data pipelines", "data pipeline", "ETL pipelines"],
  "Power BI": ["Power BI", "PowerBI"],
  "Tableau": ["Tableau"],
  "Excel": ["Microsoft Excel", "MS Excel", "Excel", "spreadsheets"],
  "Apache Spark": ["Apache Spark", "PySpark", "Spark"],
  "Hadoop": ["Hadoop", "MapReduce", "HDFS"],
  "ETL": ["ETL", "Extract Transform Load", "data transformation"],

  // Mobile Development
  "Android": ["Android", "Android Development", "Android SDK"],
  "iOS": ["iOS", "iOS Development", "iPhone", "iPad development"],
  "Flutter": ["Flutter", "Flutter framework"],
  "React Native": ["React Native"],
  "Kotlin": ["Kotlin"],
  "Swift": ["Swift", "SwiftUI"],
  "Dart": ["Dart"],

  // Core Computer Science
  "Data Structures": ["Data Structures", "DSA", "algorithms and data structures"],
  "Algorithms": ["Algorithms", "algorithmic thinking", "problem solving", "computational thinking"],
  "Operating Systems": ["Operating Systems", "OS"],
  "Computer Networks": ["Computer Networks", "Computer Networking", "networking protocols", "TCP/IP"],
  "DBMS": ["DBMS", "Database Management Systems", "database management"],
  "OOP": ["OOP", "Object Oriented Programming", "Object-Oriented Programming",
          "object-oriented design", "OOD", "SOLID principles", "design patterns"],
  "System Design": ["System Design", "distributed systems", "scalable systems",
                    "high availability", "system architecture", "software architecture"],
  "Microservices": ["Microservices", "microservice architecture", "service-oriented architecture", "SOA"],
  "Unit Testing": ["Unit Testing", "automated testing", "test automation", "TDD",
                   "test-driven development", "Jest", "Mocha", "Pytest", "JUnit"],
  "Agile": ["Agile", "Agile methodology", "agile development", "sprint", "kanban", "Agile delivery"],
  "Scrum": ["Scrum", "Scrum master", "scrum methodology"],

  // Communication & Soft skills often mentioned alongside technical ones
  "Communication": ["strong communication", "excellent communication", "communication skills",
                    "stakeholder communication", "cross-functional collaboration",
                    "stakeholder management"],
  "Problem Solving": ["problem solving", "problem-solving", "analytical skills", "analytical thinking",
                      "critical thinking", "troubleshooting", "troubleshoot"],
  "Collaboration": ["collaboration", "teamwork", "team player", "cross-functional teams",
                    "collaborative environment"],

  // ── Enterprise / SAP / OpenText ──────────────────────────────────────────
  "SAP": ["SAP", "SAP system", "SAP platform"],
  "SAP ECC": ["SAP ECC", "ECC", "SAP R/3", "SAP R3"],
  "SAP S/4HANA": ["SAP S/4HANA", "S/4HANA", "S4HANA", "SAP S4 HANA", "SAP S4HANA"],
  "SAP ArchiveLink": ["SAP ArchiveLink", "ArchiveLink", "SAP archive link"],
  "SAP ILM": ["SAP ILM", "ILM", "Information Lifecycle Management"],
  "SAP HANA": ["SAP HANA", "HANA database", "HANA DB"],
  "OpenText": ["OpenText", "Open Text"],
  "OpenText Archive Center": ["OpenText Archive Center", "Archive Center", "OT Archive Center",
                               "OpenText archival", "archival center"],
  "OpenText Content Server": ["OpenText Content Server", "Content Server", "OT Content Server",
                               "OpenText CS", "OTCS"],
  "OpenText xECM": ["OpenText xECM", "xECM", "Extended ECM", "OpenText Extended ECM",
                     "OpenText ECM", "ECM platform"],
  "Documentum": ["Documentum", "OpenText Documentum", "EMC Documentum"],
  "SAP VIM": ["SAP VIM", "VIM", "Vendor Invoice Management"],

  // ── Database / Enterprise Storage ─────────────────────────────────────────
  "Oracle": ["Oracle", "Oracle DB", "Oracle Database", "Oracle RDBMS"],
  "SQL Server": ["SQL Server", "MS SQL", "Microsoft SQL Server", "MSSQL"],
  "SAP HANA DB": ["HANA", "SAP HANA"],

  // ── Enterprise Concepts ───────────────────────────────────────────────────
  "Records Management": ["records management", "records retention", "document retention",
                          "retention policies", "retention policy", "archival", "archiving",
                          "data archiving", "document archiving"],
  "Legal Hold": ["legal hold", "eDiscovery", "e-discovery", "litigation hold"],
  "Compliance": ["compliance", "regulatory compliance", "data compliance",
                  "data governance", "GDPR", "data privacy", "audit trail"],
  "Content Management": ["content management", "ECM", "enterprise content management",
                          "document management", "DMS"],
  "Storage Management": ["storage management", "content repository", "content repositories",
                          "storage solutions", "lifecycle management", "data lifecycle"],
  "L2/L3 Support": ["L2 support", "L3 support", "L2/L3", "production support",
                     "technical support", "incident management"],
  "UNIX": ["Unix", "UNIX", "Unix administration", "Linux/Unix", "Unix/Linux"]
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
   * Resolves any skill alias (e.g. "REST", "RESTful", "REST APIs")
   * to its canonical root skill name (e.g. "REST API").
   */
  getCanonicalSkill(skillQuery) {
    if (!skillQuery || typeof skillQuery !== "string") return null;
    const cleanQuery = skillQuery.trim().toLowerCase();

    for (const [canonicalSkill, aliases] of Object.entries(SKILL_DEFINITIONS)) {
      if (canonicalSkill.toLowerCase() === cleanQuery) {
        return canonicalSkill;
      }
      for (const alias of aliases) {
        if (alias.toLowerCase() === cleanQuery) {
          return canonicalSkill;
        }
      }
    }
    return null;
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

    // Normalize candidate skills to their canonical forms
    // This solves "REST & REST API" matching: if candidate has "REST" or "REST API",
    // it normalizes to canonical "REST API", matching accurately without strict hardcoding!
    const canonicalCandidateSkills = new Set();
    for (const rawSkill of safeCandidateSkills) {
      const canonical = this.getCanonicalSkill(rawSkill) || rawSkill;
      canonicalCandidateSkills.add(canonical.toLowerCase());
      canonicalCandidateSkills.add(rawSkill.toLowerCase());
    }

    // Identify matching skills
    const matchingSkills = requiredSkills.filter(skill => {
      const canonicalReq = (this.getCanonicalSkill(skill) || skill).toLowerCase();
      return (
        canonicalCandidateSkills.has(skill.toLowerCase()) ||
        canonicalCandidateSkills.has(canonicalReq)
      );
    });

    // Identify missing skills
    const missingSkills = requiredSkills.filter(skill => {
      const canonicalReq = (this.getCanonicalSkill(skill) || skill).toLowerCase();
      return !(
        canonicalCandidateSkills.has(skill.toLowerCase()) ||
        canonicalCandidateSkills.has(canonicalReq)
      );
    });

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