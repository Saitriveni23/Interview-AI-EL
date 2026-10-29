/**
 * Interview AI - Curated Technical Study Materials & Resource Registry
 * 
 * Provides verified official documentation links, free tutorials, cheatsheets,
 * hands-on lab exercises, and interview questions for all major technical skills.
 */

export const STUDY_MATERIALS_REGISTRY = {
  // -------------------------------------------------------------
  // DATABASES & ORM
  // -------------------------------------------------------------
  Prisma: {
    skill: "Prisma",
    category: "Databases & ORM",
    badgeColor: "indigo",
    overview: "Next-generation TypeScript & Node.js ORM for type-safe database querying and declarative schema migrations.",
    documentation: [
      {
        title: "Prisma Official Quickstart",
        url: "https://www.prisma.io/docs/getting-started/quickstart-sqlite",
        type: "Official Docs",
        description: "Set up Prisma from scratch, create schema models, and run migrations."
      },
      {
        title: "Prisma Client API Reference",
        url: "https://www.prisma.io/docs/orm/prisma-client",
        type: "Reference",
        description: "Complete guide on CRUD queries, transactions, relations, and filtering."
      }
    ],
    tutorials: [
      {
        title: "Prisma ORM Crash Course for Beginners",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/prisma-orm-tutorial-for-beginners/",
        format: "Hands-on Guide",
        duration: "2 hours"
      },
      {
        title: "PostgreSQL & Database Modeling Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/postgresql",
        format: "Roadmap",
        duration: "Interactive"
      }
    ],
    cheatsheet: {
      title: "Prisma CLI & Query Cheatsheet",
      tips: [
        "`npx prisma init` — Initialize Prisma in your project with schema.prisma and .env",
        "`npx prisma migrate dev --name init` — Generate SQL migration and sync local database",
        "`npx prisma generate` — Generate type-safe Prisma Client based on schema models",
        "`prisma.user.findMany({ where: { role: 'ADMIN' }, include: { posts: true } })` — Typed relational query",
        "`npx prisma studio` — Launch local visual database browser on localhost:5555"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Type-Safe CRUD API with Express & Prisma",
      tasks: [
        "Define User and Post relational models with 1-to-many relationship in schema.prisma",
        "Run database migrations to generate tables in PostgreSQL or SQLite",
        "Implement GET /users, POST /users, and POST /posts with input validation",
        "Implement nested relation queries and test error handling using Prisma Client"
      ]
    },
    interviewQuestions: [
      "How does Prisma achieve end-to-end type safety compared to traditional query builders like Knex or raw SQL?",
      "Explain the difference between `prisma migrate dev` and `prisma db push`.",
      "How do you prevent the N+1 query problem and optimize relational queries in Prisma?"
    ]
  },

  PostgreSQL: {
    skill: "PostgreSQL",
    category: "Databases & ORM",
    badgeColor: "blue",
    overview: "Powerful, open-source object-relational database system renowned for reliability, SQL compliance, and high performance.",
    documentation: [
      {
        title: "PostgreSQL Official Documentation",
        url: "https://www.postgresql.org/docs/current/",
        type: "Official Docs",
        description: "Official manual covering SQL syntax, transactions, indexing, and administration."
      },
      {
        title: "PostgreSQL Tutorial & Interactive Examples",
        url: "https://www.postgresqltutorial.com/",
        type: "Tutorial Guide",
        description: "Step-by-step SQL queries, joins, indexes, views, and stored procedures."
      }
    ],
    tutorials: [
      {
        title: "SQL & Relational Databases for Beginners",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/learn-sql-in-10-minutes/",
        format: "Guide & Exercises",
        duration: "3 hours"
      },
      {
        title: "PostgreSQL DBA & Developer Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/postgresql",
        format: "Roadmap",
        duration: "Self-paced"
      }
    ],
    cheatsheet: {
      title: "PostgreSQL Performance & Query Cheatsheet",
      tips: [
        "`EXPLAIN ANALYZE SELECT * FROM users WHERE email = '...';` — Profile execution plan and scan type",
        "`CREATE INDEX idx_users_email ON users(email);` — Add B-tree index for rapid lookups",
        "`BEGIN; ... COMMIT; / ROLLBACK;` — Atomically commit or revert transaction blocks",
        "`WITH ranked_posts AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) FROM posts)` — Window function CTE"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: High-Performance Database Schema & Indexing",
      tasks: [
        "Design 3 normalized tables (Users, Orders, Items) with primary & foreign keys",
        "Insert 10,000 mock rows and compare query execution speed with and without B-Tree indexes using EXPLAIN ANALYZE",
        "Implement ACID transactions handling concurrent account balance transfers",
        "Write a complex multi-table JOIN with aggregations and GROUP BY"
      ]
    },
    interviewQuestions: [
      "Explain ACID properties in PostgreSQL and how isolation levels (Read Committed vs Serializable) work.",
      "What is the difference between Clustered and Non-Clustered / B-Tree indexes?",
      "How does PostgreSQL Multi-Version Concurrency Control (MVCC) prevent dirty reads without locking tables?"
    ]
  },

  SQL: {
    skill: "SQL",
    category: "Databases & ORM",
    badgeColor: "blue",
    overview: "Standard query language for storing, manipulating, and retrieving data in relational database management systems.",
    documentation: [
      {
        title: "W3Schools SQL Tutorial & Reference",
        url: "https://www.w3schools.com/sql/",
        type: "Official Docs",
        description: "Interactive SQL queries, aggregate functions, and constraint definitions."
      }
    ],
    tutorials: [
      {
        title: "SQLZoo Interactive Exercises",
        platform: "SQLZoo",
        url: "https://sqlzoo.net/",
        format: "Interactive Sandbox",
        duration: "3 hours"
      }
    ],
    cheatsheet: {
      title: "Core SQL Commands & Joins",
      tips: [
        "`SELECT DISTINCT col FROM table WHERE condition GROUP BY col HAVING COUNT(*) > 1 ORDER BY col DESC;`",
        "`INNER JOIN` — Matches rows existing in both tables",
        "`LEFT JOIN` — Returns all rows from left table and matching rows from right table",
        "`COALESCE(val, fallback)` — Returns first non-null argument"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Real-Time E-Commerce Analytics Query Suite",
      tasks: [
        "Calculate monthly recurring revenue (MRR) per product category using GROUP BY and DATE_TRUNC",
        "Find the top 5 spenders in the last 90 days using Window Functions (DENSE_RANK)",
        "Identify churned customers with LEFT JOIN finding customers with zero orders in 6 months"
      ]
    },
    interviewQuestions: [
      "What is the difference between WHERE and HAVING in SQL?",
      "Explain the difference between UNION and UNION ALL in terms of performance and duplicates."
    ]
  },

  // -------------------------------------------------------------
  // PROGRAMMING LANGUAGES & BACKEND
  // -------------------------------------------------------------
  Python: {
    skill: "Python",
    category: "Programming Language",
    badgeColor: "emerald",
    overview: "High-level, expressive programming language renowned for clean syntax, backend microservices, scripting, and AI/ML ecosystems.",
    documentation: [
      {
        title: "Python 3 Official Documentation & Tutorial",
        url: "https://docs.python.org/3/tutorial/",
        type: "Official Docs",
        description: "Comprehensive guide to syntax, standard libraries, modules, and built-in data structures."
      },
      {
        title: "The Python Standard Library by Example",
        url: "https://docs.python.org/3/library/",
        type: "Reference",
        description: "In-depth guide to itertools, functools, collections, asyncio, and typing."
      }
    ],
    tutorials: [
      {
        title: "Python for Beginners Full Course",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/learn-python-free-python-courses-for-beginners/",
        format: "Full Course",
        duration: "4 hours"
      },
      {
        title: "Python Developer Learning Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/python",
        format: "Roadmap",
        duration: "Interactive"
      }
    ],
    cheatsheet: {
      title: "Python Syntax & Idiomatic Patterns",
      tips: [
        "List Comprehension: `[x**2 for x in nums if x % 2 == 0]` (faster than map/filter)",
        "Dictionary Comprehension: `{k: v for k, v in zip(keys, values)}`",
        "Context Managers: `with open('data.json', 'r') as f: data = json.load(f)`",
        "Decorators: Wrap functions with `@functools.wraps(func)` to preserve docstrings and signatures",
        "Generators: Use `yield` for memory-efficient lazy sequence evaluation"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Async CLI Data Processor & REST Client",
      tasks: [
        "Create modular classes adhering to SOLID principles, type hints (`typing`), and docstrings",
        "Implement custom exception classes and robust `try...except...finally` error handling",
        "Use `argparse` or `click` to accept command-line arguments and process CSV/JSON files",
        "Write unit tests with `pytest` testing edge cases and mock network calls"
      ]
    },
    interviewQuestions: [
      "What is the Python Global Interpreter Lock (GIL) and how does it impact multi-threaded CPU-bound programs?",
      "Explain the difference between mutable (list, dict, set) and immutable (int, str, tuple) types in memory.",
      "How does memory management and garbage collection (reference counting + cyclic GC) work in Python?"
    ]
  },

  "Node.js": {
    skill: "Node.js",
    category: "Backend Runtime",
    badgeColor: "emerald",
    overview: "Asynchronous event-driven JavaScript runtime designed to build scalable network applications.",
    documentation: [
      {
        title: "Node.js Official Documentation",
        url: "https://nodejs.org/en/docs/",
        type: "Official Docs",
        description: "Guides on event loop, streams, buffers, clustering, and worker threads."
      }
    ],
    tutorials: [
      {
        title: "Node.js & Express Full Course",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/free-8-hour-node-js-express-course/",
        format: "Video Course",
        duration: "8 hours"
      },
      {
        title: "Node.js Developer Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/nodejs",
        format: "Roadmap",
        duration: "Self-paced"
      }
    ],
    cheatsheet: {
      title: "Node.js Event Loop & Core Modules",
      tips: [
        "Event Loop Phases: Timers -> Pending Callbacks -> Idle/Prepare -> Poll -> Check -> Close Callbacks",
        "`process.nextTick()` executes before the event loop continues to the next phase",
        "`fs.createReadStream()` / `pipe()` — Process massive gigabyte files without RAM spikes",
        "`crypto.randomBytes(32).toString('hex')` — Cryptographically secure token generation"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Scalable File Streaming & Webhook Service",
      tasks: [
        "Create a stream pipeline parsing CSV records chunk-by-chunk using Node.js stream transform",
        "Implement rate limiting using in-memory token bucket algorithm",
        "Handle graceful process shutdown on SIGINT and SIGTERM without dropping active HTTP sockets"
      ]
    },
    interviewQuestions: [
      "How does the Node.js single-threaded event loop handle non-blocking asynchronous I/O?",
      "What is the difference between `process.nextTick()` and `setImmediate()`?",
      "How do Worker Threads differ from the Cluster module in Node.js?"
    ]
  },

  "Express.js": {
    skill: "Express.js",
    category: "Backend Framework",
    badgeColor: "slate",
    overview: "Fast, unopinionated, minimalist web framework for Node.js.",
    documentation: [
      {
        title: "Express.js Official Guide & Routing",
        url: "https://expressjs.com/en/guide/routing.html",
        type: "Official Docs",
        description: "Middleware architecture, error handling, route parameters, and static files."
      }
    ],
    tutorials: [
      {
        title: "Building RESTful APIs with Express",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/build-a-restful-api-using-node-express-and-mongodb/",
        format: "Tutorial",
        duration: "2 hours"
      }
    ],
    cheatsheet: {
      title: "Express Middleware & Best Practices",
      tips: [
        "Middleware Signature: `(req, res, next) => { ... next(); }`",
        "Error Middleware: Must take 4 arguments `(err, req, res, next) => { ... }`",
        "`express.json({ limit: '10mb' })` — Body parser with payload limits",
        "CORS Configuration: `app.use(cors({ origin: ['http://localhost:3000'] }))`"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Secure REST API with Role-Based Access Control",
      tasks: [
        "Build modular Express routers for auth, products, and admin routes",
        "Implement custom authentication middleware verifying JWT signatures in Authorization header",
        "Build centralized error handler intercepting 404s and internal exceptions with sanitization"
      ]
    },
    interviewQuestions: [
      "How does middleware ordering affect request execution in Express?",
      "How do you safely catch asynchronous errors in Express routes to prevent server crashes?"
    ]
  },

  TypeScript: {
    skill: "TypeScript",
    category: "Programming Language",
    badgeColor: "blue",
    overview: "Strongly typed programming language that builds on JavaScript, giving you compile-time type safety and tooling.",
    documentation: [
      {
        title: "TypeScript Handbook & Documentation",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        type: "Official Docs",
        description: "Official guide to interfaces, generics, union types, and utility types."
      }
    ],
    tutorials: [
      {
        title: "TypeScript Full Course for Beginners",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/learn-typescript-complete-course/",
        format: "Interactive Course",
        duration: "3 hours"
      },
      {
        title: "TypeScript Developer Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/typescript",
        format: "Roadmap",
        duration: "Interactive"
      }
    ],
    cheatsheet: {
      title: "TypeScript Types & Utility Types Cheatsheet",
      tips: [
        "`Partial<T>` / `Required<T>` — Make all properties optional or mandatory",
        "`Pick<T, 'id' | 'email'>` / `Omit<T, 'password'>` — Construct new types from subsets",
        "`Record<string, number>` — Object mapping string keys to number values",
        "Type Guards: `function isUser(val: unknown): val is User { return ... }`",
        "Discriminated Unions: Use a shared string literal `type: 'success' | 'error'` for strict exhaustiveness checking"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Strict Type-Safe Domain Model & API Client",
      tasks: [
        "Define discriminated union types representing API Request States (Idle, Loading, Success, Error)",
        "Write a generic HTTP fetch wrapper `async function apiFetch<T>(url: string): Promise<T>`",
        "Use TypeScript `satisfies` and `as const` to enforce compile-time schema constants"
      ]
    },
    interviewQuestions: [
      "What is the difference between `interface` and `type` in TypeScript, and when do you use each?",
      "What is the difference between `any`, `unknown`, and `never`?",
      "How does TypeScript structural typing (duck typing) differ from nominal typing?"
    ]
  },

  // -------------------------------------------------------------
  // AI, LLM & MODERN TECHNOLOGIES
  // -------------------------------------------------------------
  LLMs: {
    skill: "LLMs",
    category: "Generative AI",
    badgeColor: "purple",
    overview: "Large Language Models, prompt engineering, structured JSON responses, vector embeddings, and Retrieval-Augmented Generation (RAG).",
    documentation: [
      {
        title: "Google Gemini API Official Documentation",
        url: "https://ai.google.dev/gemini-api/docs",
        type: "Official Docs",
        description: "Guide to structured JSON output, system instructions, function calling, and token safety."
      },
      {
        title: "OpenAI API Reference & Guides",
        url: "https://platform.openai.com/docs/guides/text-generation",
        type: "Reference",
        description: "Best practices for token parameters, structured outputs, and fine-tuning."
      }
    ],
    tutorials: [
      {
        title: "Prompt Engineering for Developers",
        platform: "DeepLearning.AI",
        url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
        format: "Free Course",
        duration: "1.5 hours"
      },
      {
        title: "AI Engineer & LLM Developer Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/ai-engineer",
        format: "Roadmap",
        duration: "Self-paced"
      }
    ],
    cheatsheet: {
      title: "LLM & Prompt Architecture Cheatsheet",
      tips: [
        "Structured Output: Enforce schema validation via responseMimeType='application/json'",
        "Few-Shot Prompting: Provide 2-3 input/output examples before asking for target completion",
        "Temperature Settings: 0.0 for deterministic classification/parsing, 0.7 for creative brainstorming",
        "Context Window: Always reserve at least 20% of total tokens for model output response",
        "Hallucination Guardrails: Cross-reference model assertions against source text tokens (Layer 2 Governance)"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Fact-Verified RAG Document Q&A Engine",
      tasks: [
        "Chunk a 10-page document into 400-token blocks with 50-token overlapping boundaries",
        "Generate text embeddings and calculate cosine similarity to retrieve top-3 most relevant blocks",
        "Construct prompt combining system instructions, retrieved context, and user question",
        "Implement a Layer 2 post-processing verification checker auditing output against ground-truth facts"
      ]
    },
    interviewQuestions: [
      "What causes LLM hallucinations and what algorithmic strategies reduce them in production systems?",
      "Explain how Retrieval-Augmented Generation (RAG) differs from model fine-tuning.",
      "What are vector embeddings and cosine similarity, and how are semantic searches executed?"
    ]
  },

  Ollama: {
    skill: "Ollama",
    category: "Local AI & LLM Infrastructure",
    badgeColor: "purple",
    overview: "Run large language models locally: Llama 3, Mistral, Gemma, and custom Modelfiles with zero cloud egress.",
    documentation: [
      {
        title: "Ollama Official GitHub & REST API Docs",
        url: "https://github.com/ollama/ollama/blob/main/docs/api.md",
        type: "Official Docs",
        description: "Run models locally via CLI and REST API with zero external cloud transmission."
      },
      {
        title: "Ollama Modelfile Reference",
        url: "https://github.com/ollama/ollama/blob/main/docs/modelfile.md",
        type: "Reference",
        description: "Create custom system prompts, temperature parameters, and quantized models."
      }
    ],
    tutorials: [
      {
        title: "Run LLMs Locally with Ollama & Node.js",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/run-llms-locally-with-ollama/",
        format: "Step-by-Step Guide",
        duration: "1 hour"
      }
    ],
    cheatsheet: {
      title: "Ollama CLI & API Commands",
      tips: [
        "`ollama run llama3` — Pull and start interactive chat with Llama 3 model",
        "`ollama list` — Show all locally installed models and their sizes on disk",
        "`curl http://localhost:11434/api/generate -d '{\"model\": \"llama3\", \"prompt\": \"Hello\"}'` — REST API call",
        "`ollama rm <model>` — Free up disk space by deleting unneeded models"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Local Privacy-First Chatbot API",
      tasks: [
        "Install and run a lightweight local model (e.g. gemma:2b or llama3:8b) using Ollama",
        "Create an Express.js backend route that streams response tokens from Ollama's local port 11434",
        "Implement zero cloud data transmission guarantee for confidential candidate data"
      ]
    },
    interviewQuestions: [
      "What are the latency, privacy, and cost trade-offs of local models (Ollama) vs cloud APIs (Gemini/OpenAI)?",
      "What hardware considerations (VRAM, quantization e.g. 4-bit vs 8-bit) matter when running local LLMs?"
    ]
  },

  // -------------------------------------------------------------
  // CLOUD, DEVOPS & SYSTEM DESIGN
  // -------------------------------------------------------------
  Docker: {
    skill: "Docker",
    category: "DevOps & Containers",
    badgeColor: "cyan",
    overview: "Platform for developing, shipping, and running applications inside isolated lightweight containers.",
    documentation: [
      {
        title: "Docker Get Started Official Guide",
        url: "https://docs.docker.com/get-started/",
        type: "Official Docs",
        description: "Containers, Dockerfiles, volume mounts, and port forwarding."
      },
      {
        title: "Dockerfile Best Practices Guide",
        url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/",
        type: "Best Practices",
        description: "Multi-stage builds, layer caching, non-root users, and minimal base images."
      }
    ],
    tutorials: [
      {
        title: "Docker for Beginners Crash Course",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/the-docker-handbook/",
        format: "Handbook & Video",
        duration: "3 hours"
      },
      {
        title: "Docker Developer Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/docker",
        format: "Roadmap",
        duration: "Interactive"
      }
    ],
    cheatsheet: {
      title: "Docker CLI Commands & Multi-Stage Builds",
      tips: [
        "`docker build -t my-app:latest .` — Build container image from Dockerfile",
        "`docker run -d -p 3000:3000 --env-file .env my-app:latest` — Run detached with port mapping",
        "`docker-compose up --build -d` — Start multi-container stack (web, database, redis)",
        "`docker system prune -a` — Reclaim disk space by removing unused images and stopped containers",
        "Use multi-stage builds (`FROM node:20-alpine AS builder ... FROM node:20-alpine AS runner`) to cut image size by 80%"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Production Multi-Container Compose Stack",
      tasks: [
        "Write an optimized multi-stage Dockerfile for a Node.js + React application",
        "Create docker-compose.yml orchestrating the API server and a PostgreSQL database",
        "Configure Docker healthchecks, non-root user execution, and persistent volume mounts"
      ]
    },
    interviewQuestions: [
      "What is the difference between a Docker Image and a Docker Container?",
      "How do multi-stage Docker builds reduce image size and improve security?",
      "Explain the difference between Docker bridge network, host network, and overlay network."
    ]
  },

  AWS: {
    skill: "AWS",
    category: "Cloud Infrastructure",
    badgeColor: "amber",
    overview: "Comprehensive cloud computing platform offering compute, storage, databases, networking, and serverless architectures.",
    documentation: [
      {
        title: "AWS Cloud Essentials & Architecture Center",
        url: "https://aws.amazon.com/architecture/",
        type: "Official Docs",
        description: "Well-Architected Framework: Reliability, security, cost optimization, and performance."
      }
    ],
    tutorials: [
      {
        title: "AWS Certified Cloud Practitioner Free Training",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/aws-certified-cloud-practitioner-study-course/",
        format: "Comprehensive Course",
        duration: "4 hours"
      },
      {
        title: "AWS Developer Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/aws",
        format: "Roadmap",
        duration: "Self-paced"
      }
    ],
    cheatsheet: {
      title: "Core AWS Services Reference",
      tips: [
        "Compute: EC2 (Virtual VMs), ECS/EKS (Containers), Lambda (Serverless event-driven execution)",
        "Storage: S3 (Object storage with lifecycle rules), EBS (Block storage for EC2), EFS (Shared file system)",
        "Database: RDS (Managed PostgreSQL/MySQL with read replicas), DynamoDB (Serverless NoSQL key-value)",
        "Networking: VPC (Virtual Private Cloud), Route 53 (DNS), CloudFront (Global CDN), ALB (Application Load Balancer)",
        "Security: IAM (Least-privilege policies, roles, and MFA enforcement)"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Serverless S3 Upload & Image Processing Pipeline",
      tasks: [
        "Create an Amazon S3 bucket with private ACL and pre-signed URL upload endpoint",
        "Write an AWS Lambda function triggered on s3:ObjectCreated events to generate thumbnails",
        "Configure IAM roles with least-privilege permissions and CloudWatch alarm monitoring"
      ]
    },
    interviewQuestions: [
      "Explain the difference between horizontal scaling (EC2 Auto Scaling) and vertical scaling.",
      "How do IAM Roles differ from IAM Users and Access Keys?",
      "What is the difference between S3 Standard, S3 Infrequent Access, and S3 Glacier?"
    ]
  },

  "System Design": {
    skill: "System Design",
    category: "Architecture & Scalability",
    badgeColor: "indigo",
    overview: "Designing large-scale, highly available, distributed software systems handling millions of users.",
    documentation: [
      {
        title: "The System Design Primer (GitHub)",
        url: "https://github.com/donnemartin/system-design-primer",
        type: "Open Source Guide",
        description: "Comprehensive guide to scalability, databases, caching, microservices, and design patterns."
      }
    ],
    tutorials: [
      {
        title: "System Design Course for Beginners",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/systems-design-for-beginners/",
        format: "Course & Case Studies",
        duration: "3 hours"
      },
      {
        title: "System Design Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/system-design",
        format: "Roadmap",
        duration: "Interactive"
      }
    ],
    cheatsheet: {
      title: "System Design Pillars & Heuristics",
      tips: [
        "CAP Theorem: In a distributed system with network partitions (P), choose between Consistency (C) or Availability (A)",
        "Caching Strategies: Cache-Aside, Read-Through, Write-Through, Write-Behind (Redis/Memcached)",
        "Database Scaling: Read replicas for read-heavy loads, Sharding/Partitioning for write-heavy loads",
        "Asynchronous Decoupling: Use message queues (Kafka, RabbitMQ, SQS) to buffer traffic spikes",
        "Rate Limiting: Token Bucket and Leaky Bucket algorithms to protect downstream services"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: High-Scale URL Shortener System Architecture",
      tasks: [
        "Calculate storage and throughput requirements (e.g. 100M URLs/month, 10:1 read-to-write ratio)",
        "Design Base62 hashing algorithm with collision mitigation and distributed unique ID generator (Snowflake)",
        "Draw full architecture: DNS -> CDN -> ALB -> Stateless App Tier -> Redis Cache -> PostgreSQL Shards"
      ]
    },
    interviewQuestions: [
      "How do you design a distributed rate limiter that works across multiple server instances?",
      "Explain the trade-offs between SQL (Relational) and NoSQL (Document/Key-Value) databases at scale.",
      "How does Redis caching reduce database load and what strategies prevent Cache Stampede?"
    ]
  },

  React: {
    skill: "React",
    category: "Frontend Development",
    badgeColor: "cyan",
    overview: "Component-based declarative JavaScript library for building responsive user interfaces.",
    documentation: [
      {
        title: "React Official Documentation (react.dev)",
        url: "https://react.dev/learn",
        type: "Official Docs",
        description: "Modern React documentation covering Hooks, State management, Effects, and Escape Hatches."
      }
    ],
    tutorials: [
      {
        title: "React 18 / 19 Full Course for Beginners",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/learn-react-18-complete-course/",
        format: "Video Course",
        duration: "5 hours"
      },
      {
        title: "React Developer Roadmap",
        platform: "Roadmap.sh",
        url: "https://roadmap.sh/react",
        format: "Roadmap",
        duration: "Interactive"
      }
    ],
    cheatsheet: {
      title: "React Hooks & Performance Cheatsheet",
      tips: [
        "`useState` — Local component state; pass functional update `setCount(c => c + 1)` when depending on prior state",
        "`useEffect` — Synchronize with external systems; always include cleanup function when subscribing",
        "`useMemo` / `useCallback` — Memoize expensive calculations and callback references to prevent child re-renders",
        "`useRef` — Store mutable values that do not trigger re-renders or hold direct DOM node references",
        "React Reconciliation: Key prop uniquely identifies elements across renders; never use array index for dynamic lists"
      ]
    },
    handsOnLab: {
      title: "Mini-Project: Interactive Dashboard with Custom Hooks & Tailwind",
      tasks: [
        "Create custom hook `useFetchData` with loading states, caching, and abort-controller cleanup",
        "Implement responsive layout with Tailwind CSS and dark mode support",
        "Optimize rendering performance using `React.memo` and profiling tools"
      ]
    },
    interviewQuestions: [
      "How does the React Virtual DOM diffing algorithm (Reconciliation) work?",
      "What are the rules of Hooks, and why can't Hooks be placed inside conditions or loops?",
      "What causes unnecessary re-renders in React and how do you profile and eliminate them?"
    ]
  }
};

/**
 * Returns comprehensive study materials for a specific skill.
 * If the skill is not in the predefined registry, generates a structured fallback.
 */
export function getStudyMaterialForSkill(skillName) {
  if (!skillName || typeof skillName !== 'string') return null;
  const cleanName = skillName.trim();

  // 1. Direct match
  if (STUDY_MATERIALS_REGISTRY[cleanName]) {
    return STUDY_MATERIALS_REGISTRY[cleanName];
  }

  // 2. Case-insensitive match or alias
  const lowerName = cleanName.toLowerCase();
  for (const [key, value] of Object.entries(STUDY_MATERIALS_REGISTRY)) {
    if (key.toLowerCase() === lowerName || (value.aliases && value.aliases.some(a => a.toLowerCase() === lowerName))) {
      return value;
    }
  }

  // 3. Normalized matching (e.g. "AI / LLM APIs" -> "LLMs", "Prisma ORM" -> "Prisma")
  if (lowerName.includes('prisma')) return STUDY_MATERIALS_REGISTRY.Prisma;
  if (lowerName.includes('llm') || lowerName.includes('ai') || lowerName.includes('gpt')) return STUDY_MATERIALS_REGISTRY.LLMs;
  if (lowerName.includes('ollama')) return STUDY_MATERIALS_REGISTRY.Ollama;
  if (lowerName.includes('postgres')) return STUDY_MATERIALS_REGISTRY.PostgreSQL;
  if (lowerName.includes('python')) return STUDY_MATERIALS_REGISTRY.Python;
  if (lowerName.includes('docker') || lowerName.includes('container')) return STUDY_MATERIALS_REGISTRY.Docker;
  if (lowerName.includes('aws') || lowerName.includes('cloud')) return STUDY_MATERIALS_REGISTRY.AWS;
  if (lowerName.includes('system design') || lowerName.includes('architecture')) return STUDY_MATERIALS_REGISTRY['System Design'];
  if (lowerName.includes('react')) return STUDY_MATERIALS_REGISTRY.React;
  if (lowerName.includes('node')) return STUDY_MATERIALS_REGISTRY['Node.js'];
  if (lowerName.includes('express')) return STUDY_MATERIALS_REGISTRY['Express.js'];
  if (lowerName.includes('typescript')) return STUDY_MATERIALS_REGISTRY.TypeScript;
  if (lowerName.includes('sql')) return STUDY_MATERIALS_REGISTRY.SQL;

  // 4. Dynamic structured fallback for any other skill (e.g., C++, Go, Kubernetes, Redis)
  return {
    skill: cleanName,
    category: "Technical Skill",
    badgeColor: "indigo",
    overview: `Core concepts, architecture, syntax, and practical implementation patterns for ${cleanName}.`,
    documentation: [
      {
        title: `${cleanName} Reference & Documentation Guide`,
        url: `https://devdocs.io/#q=${encodeURIComponent(cleanName)}`,
        type: "Reference Manual",
        description: `Explore official syntax, APIs, commands, and best practices for ${cleanName}.`
      },
      {
        title: `${cleanName} Developer Learning Path`,
        url: `https://roadmap.sh/search?q=${encodeURIComponent(cleanName)}`,
        type: "Curriculum",
        description: `Visual career roadmap and structured learning milestones for ${cleanName}.`
      }
    ],
    tutorials: [
      {
        title: `${cleanName} Fundamentals & Crash Course`,
        platform: "freeCodeCamp",
        url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(cleanName)}`,
        format: "Guided Tutorial",
        duration: "Self-paced"
      }
    ],
    cheatsheet: {
      title: `${cleanName} Essential Principles & Commands`,
      tips: [
        `Master the core terminology, design patterns, and idiomatic conventions of ${cleanName}.`,
        `Practice writing clean, modular code with descriptive variable naming and comprehensive test coverage.`,
        `Review debugging strategies, common pitfalls, and error-handling paradigms in ${cleanName}.`
      ]
    },
    handsOnLab: {
      title: `Mini-Project: Hands-on Implementation Challenge with ${cleanName}`,
      tasks: [
        `Initialize a new working environment and configure dependencies for ${cleanName}.`,
        `Implement a functional prototype demonstrating core features of ${cleanName}.`,
        `Add unit tests and document key architectural decisions and challenges.`
      ]
    },
    interviewQuestions: [
      `What are the core advantages and trade-offs of using ${cleanName} in production systems?`,
      `Describe a common problem you solved or a feature you built using ${cleanName}.`
    ]
  };
}

/**
 * Returns merged study materials for a list of skills.
 */
export function getStudyMaterialsForSkills(skillsList = []) {
  if (!Array.isArray(skillsList)) return [];
  const map = new Map();

  for (const skill of skillsList) {
    const material = getStudyMaterialForSkill(skill);
    if (material && !map.has(material.skill)) {
      map.set(material.skill, material);
    }
  }

  return Array.from(map.values());
}

