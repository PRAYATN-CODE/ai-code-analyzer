# AI Code Analyzer — Backend

Multi-agent Node.js/Express backend for the AI Code Analyzer platform.

## Tech Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **AI Engine:** Google Gemini 1.5 Pro
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Security:** helmet, cors, express-rate-limit, express-mongo-sanitize, hpp
- **Logging:** Winston + daily-rotate-file
- **Zip extraction:** adm-zip
- **HTTP client:** axios

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY

# 3. Start development server
npm run dev

# 4. Health check
curl http://localhost:5000/health
```

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | — |
| POST | `/api/v1/auth/login` | Login & get JWT | — |
| GET | `/api/v1/auth/me` | Get current user | ✅ |
| POST | `/api/v1/analysis/github` | Submit GitHub repo for analysis | ✅ |
| POST | `/api/v1/analysis/snippet` | Submit code snippet | ✅ |
| GET | `/api/v1/analysis/status/:jobId` | Poll job status | ✅ |
| GET | `/api/v1/analysis/report/:jobId` | Get full analysis report | ✅ |
| GET | `/api/v1/analysis/history` | Get user's analysis history | ✅ |
| DELETE | `/api/v1/analysis/report/:jobId` | Delete a report | ✅ |
| GET | `/api/v1/repositories` | List user's repositories | ✅ |
| GET | `/api/v1/repositories/:id` | Get repository details | ✅ |
| DELETE | `/api/v1/repositories/:id` | Delete a repository | ✅ |

## Multi-Agent Pipeline

```
GitHub URL / Code Snippet
        │
        ▼
  [File Filter Service]   ← strips node_modules, binaries, lock files
        │
        ▼
  [Planner Agent]         ← detects framework, selects critical files
        │
        ▼ (parallel Promise.all)
┌───────┬────────┬────────────┐
│  Bug  │Security│ Performance│
│ Agent │ Agent  │   Agent    │
└───────┴────────┴────────────┘
        │
        ▼
[Fix Suggestion Agent]   ← de-dupes, scores, grades, final report
        │
        ▼
   MongoDB Atlas          ← persisted AnalysisReport document
```

## Folder Structure

```
backend/
├── server.js                  ← Entry point
├── src/
│   ├── app.js                 ← Express app + middleware
│   ├── agents/
│   │   ├── plannerAgent.js
│   │   ├── bugDetectionAgent.js
│   │   ├── securityAgent.js
│   │   ├── performanceAgent.js
│   │   └── fixSuggestionAgent.js
│   ├── config/
│   │   ├── db.js
│   │   └── gemini.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── analysisController.js
│   │   └── repositoryController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Repository.js
│   │   └── AnalysisReport.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── analysisRoutes.js
│   │   └── repositoryRoutes.js
│   ├── services/
│   │   ├── analysisOrchestrator.js
│   │   ├── fileFilterService.js
│   │   ├── geminiService.js
│   │   └── githubService.js
│   └── utils/
│       ├── fileTree.js
│       ├── jsonValidator.js
│       ├── logger.js
│       └── tokenCounter.js
├── .env.example
├── .gitignore
└── package.json
```
