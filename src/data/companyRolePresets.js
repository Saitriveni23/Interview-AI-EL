/**
 * Interview AI - Company & Role Presets Database
 * 
 * Provides industry-standard job descriptions, required tech stacks,
 * and hiring evaluation criteria for top technology companies and job roles.
 */

export const TOP_COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Netflix",
  "Uber",
  "Stripe",
  "Apple",
  "Salesforce",
  "Adobe",
  "Cisco",
  "Bloomberg",
  "TCS / Infosys / Wipro",
  "High-Growth Tech Startup",
  "Custom Company"
];

export const POPULAR_ROLES = [
  "Full Stack Developer",
  "Backend Software Engineer",
  "Frontend Engineer",
  "Cloud & DevOps Engineer",
  "AI & Machine Learning Engineer",
  "Data Engineer",
  "Systems & Infrastructure Architect",
  "Mobile App Developer",
  "Site Reliability Engineer (SRE)",
  "QA & Test Automation Engineer",
  "Product Manager (Technical)",
  "Security Engineer",
  "Custom Role"
];

export const EXPERIENCE_LEVELS = [
  { label: "Entry-Level / College Graduate (0 - 1 Years)", value: "Entry-Level (0-1 yrs)" },
  { label: "Junior Software Engineer (1 - 3 Years)", value: "Junior (1-3 yrs)" },
  { label: "Mid-Level Software Engineer (3 - 5 Years)", value: "Mid-Level (3-5 yrs)" },
  { label: "Senior Software Engineer (5 - 8 Years)", value: "Senior (5-8 yrs)" },
  { label: "Staff / Principal Engineer (8+ Years)", value: "Staff / Principal (8+ yrs)" }
];

export const ROLE_PRESETS = {
  "Full Stack Developer": {
    skills: ["React", "TypeScript", "Node.js", "Express.js", "PostgreSQL", "Prisma", "Docker", "AWS", "REST API"],
    generateJD: (company, level) => `${company} is looking for a ${level} Full Stack Developer to design, build, and maintain mission-critical web applications.
Key Responsibilities & Requirements:
- Build modern, accessible, high-performance web frontends using React, TypeScript, and modern state management.
- Architect scalable backend APIs and microservices using Node.js, Express.js, and REST APIs.
- Model relational schemas and optimize queries using PostgreSQL and Prisma ORM.
- Containerize services using Docker and manage deployments across cloud environments (AWS).
- Strong understanding of software architecture, unit testing, and agile collaboration.`
  },

  "Backend Software Engineer": {
    skills: ["Python", "Node.js", "PostgreSQL", "SQL", "Redis", "Docker", "REST API", "Microservices", "System Design"],
    generateJD: (company, level) => `${company} is hiring a ${level} Backend Software Engineer to lead the engineering of core transaction engines and data pipelines.
Key Responsibilities & Requirements:
- Develop robust, fault-tolerant backend services using Python and Node.js.
- Design relational and key-value database schemas using PostgreSQL, SQL, and Redis caching.
- Build high-throughput REST APIs and asynchronous microservices with Docker containerization.
- Apply distributed System Design principles, caching strategies (Cache-Aside), and concurrency control.
- Ensure strict reliability, observability, logging, and automated test coverage.`
  },

  "Frontend Engineer": {
    skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Next.js", "REST API", "Vite"],
    generateJD: (company, level) => `${company} is seeking an exceptional ${level} Frontend Engineer passionate about crafting seamless user experiences.
Key Responsibilities & Requirements:
- Engineer high-performance web applications using React, Next.js, and strict TypeScript.
- Build responsive, modern interfaces using Tailwind CSS and semantic HTML5/CSS3.
- Integrate RESTful APIs and handle asynchronous states, error boundaries, and optimistic UI.
- Optimize client-side web vitals, bundle sizes (Vite/Webpack), and render performance.
- Write unit and component integration tests with modern testing frameworks.`
  },

  "Cloud & DevOps Engineer": {
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Git", "Python", "System Design"],
    generateJD: (company, level) => `${company} is looking for a ${level} Cloud & DevOps Engineer to scale cloud infrastructure and automate release engineering.
Key Responsibilities & Requirements:
- Manage cloud infrastructure across AWS utilizing Infrastructure-as-Code (Terraform).
- Build containerization and orchestration pipelines using Docker and Kubernetes (EKS).
- Automate CI/CD deployment pipelines using GitHub Actions, Jenkins, and shell scripting in Linux environments.
- Monitor system reliability, implement auto-scaling, load balancing, and disaster recovery.
- Script administrative automation tools using Python or Bash.`
  },

  "AI & Machine Learning Engineer": {
    skills: ["Python", "Machine Learning", "Deep Learning", "LLMs", "Generative AI", "NLP", "PyTorch", "Docker", "REST API"],
    generateJD: (company, level) => `${company} is hiring a ${level} AI & Machine Learning Engineer to build intelligent agentic products and LLM systems.
Key Responsibilities & Requirements:
- Develop production-grade AI pipelines and fine-tuned models using Python and PyTorch.
- Integrate Large Language Models (LLMs), prompt engineering, embeddings, and Retrieval-Augmented Generation (RAG).
- Deploy NLP and Generative AI microservices wrapped in REST APIs using Docker.
- Build Layer 2 governance guardrails to detect hallucinations and ensure factuality.
- Evaluate model accuracy, latency, token budgets, and inference optimizations.`
  },

  "Data Engineer": {
    skills: ["Python", "SQL", "PostgreSQL", "MySQL", "AWS", "Docker", "Linux", "REST API"],
    generateJD: (company, level) => `${company} is looking for a ${level} Data Engineer to construct reliable data warehouses and ETL pipelines.
Key Responsibilities & Requirements:
- Write optimized SQL queries, transformations, and analytical aggregations in PostgreSQL.
- Build robust data ingestion pipelines in Python handling batch and streaming events.
- Deploy cloud data storage architectures on AWS (S3, Redshift) containerized with Docker.
- Ensure data integrity, schema validation, data quality monitoring, and schema migration.`
  },

  "Systems & Infrastructure Architect": {
    skills: ["System Design", "Microservices", "Docker", "Kubernetes", "AWS", "PostgreSQL", "Redis", "Linux"],
    generateJD: (company, level) => `${company} is seeking a ${level} Systems & Infrastructure Architect to direct end-to-end platform scalability.
Key Responsibilities & Requirements:
- Design multi-region, distributed System Architectures handling millions of concurrent requests.
- Champion Microservice decomposition, event-driven messaging, and resilient network topologies.
- Standardize container orchestration (Kubernetes, Docker) and cloud operations (AWS).
- Architect caching layers (Redis), database sharding (PostgreSQL), and zero-downtime migrations.`
  },

  "Mobile App Developer": {
    skills: ["React Native", "TypeScript", "JavaScript", "iOS", "Android", "REST API", "Firebase", "Git"],
    generateJD: (company, level) => `${company} is looking for a ${level} Mobile App Developer to build polished, high-performance iOS and Android applications.
Key Responsibilities & Requirements:
- Build cross-platform mobile applications using React Native and TypeScript.
- Integrate REST APIs, real-time Firebase services, and third-party mobile SDKs.
- Optimize app performance, startup time, memory usage, and battery consumption.
- Publish and maintain apps across the App Store and Google Play, managing release cycles.
- Implement mobile-specific UX patterns, offline-first architecture, and push notifications.`
  },

  "Site Reliability Engineer (SRE)": {
    skills: ["Linux", "Python", "Docker", "Kubernetes", "AWS", "CI/CD", "System Design", "Terraform", "Prometheus"],
    generateJD: (company, level) => `${company} is hiring a ${level} Site Reliability Engineer (SRE) to ensure reliability and scalability of production services.
Key Responsibilities & Requirements:
- Define and enforce SLOs, SLIs, and error budgets across distributed production services.
- Build observability stacks using Prometheus, Grafana, distributed tracing, and centralized logging.
- Automate incident response, runbooks, and on-call workflows to reduce MTTR.
- Manage Kubernetes clusters and cloud infrastructure using Terraform on AWS.
- Drive reliability reviews, chaos engineering experiments, and capacity planning.`
  },

  "QA & Test Automation Engineer": {
    skills: ["Python", "JavaScript", "Selenium", "Playwright", "REST API", "SQL", "CI/CD", "Docker", "Git"],
    generateJD: (company, level) => `${company} is looking for a ${level} QA & Test Automation Engineer to champion software quality across the engineering organization.
Key Responsibilities & Requirements:
- Design and maintain end-to-end UI test suites using Playwright or Selenium with Python/JavaScript.
- Build REST API integration test frameworks validating backend service contracts.
- Integrate automated tests into CI/CD pipelines (GitHub Actions, Jenkins) with Docker-based test environments.
- Write SQL validation queries to verify data integrity across relational databases.
- Conduct performance, regression, and exploratory testing; triage and track defect root causes.`
  },

  "Product Manager (Technical)": {
    skills: ["Product Strategy", "SQL", "REST API", "Agile", "System Design", "Data Analysis", "User Research", "Git"],
    generateJD: (company, level) => `${company} is seeking a ${level} Technical Product Manager to bridge business goals with engineering execution.
Key Responsibilities & Requirements:
- Own the product roadmap, backlog prioritization, and feature lifecycle for ${company}'s core platform products.
- Collaborate deeply with engineering leads, writing clear technical specifications and acceptance criteria.
- Use SQL and data analytics tools to measure feature impact, funnels, and user engagement metrics.
- Lead agile ceremonies, sprint planning, and cross-functional stakeholder alignment.
- Translate customer research and market signals into actionable product decisions backed by data.`
  },

  "Security Engineer": {
    skills: ["Python", "Linux", "AWS", "Cryptography", "REST API", "Docker", "SQL", "Network Security", "OWASP"],
    generateJD: (company, level) => `${company} is hiring a ${level} Security Engineer to protect systems, data, and infrastructure against threats.
Key Responsibilities & Requirements:
- Perform security architecture reviews, threat modeling, and penetration testing across ${company}'s platforms.
- Implement application security controls aligned with OWASP Top 10, CSRF, XSS, and injection prevention.
- Build and manage cloud security posture on AWS: IAM policies, VPC security groups, and encryption at rest/in transit.
- Develop security automation scripts and SIEM detection rules using Python on Linux environments.
- Lead vulnerability management programs, triage CVEs, and coordinate security incident response.`
  }
};

/**
 * Generate a complete target Job Description based on Company, Role, and Seniority.
 */
export function getPresetJobDescription(company = "Google", role = "Full Stack Developer", level = "Mid-Level (3-5 yrs)") {
  const cleanCompany = (company || "Target Company").trim();
  const cleanRole = (role || "Full Stack Developer").trim();
  const cleanLevel = (level || "Mid-Level (3-5 yrs)").trim();

  if (ROLE_PRESETS[cleanRole]) {
    return ROLE_PRESETS[cleanRole].generateJD(cleanCompany, cleanLevel);
  }

  // Generic fallback for custom roles
  return `${cleanCompany} is seeking a qualified ${cleanLevel} ${cleanRole} to join our high-impact engineering organization.
Key Responsibilities & Requirements:
- Deliver scalable, production-quality software features aligned with ${cleanCompany}'s architectural standards.
- Collaborate with cross-functional teams to build, test, and deploy reliable software services.
- Leverage modern engineering tools, version control (Git), and containerized cloud environments.
- Strong problem-solving abilities, communication skills, and technical ownership.`;
}

