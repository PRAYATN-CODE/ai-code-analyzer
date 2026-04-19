# AI Code Analyzer — Frontend

React + Vite + Tailwind CSS frontend for the CodeSense AI platform.

## Tech Stack
- **Framework:** React 18 + Vite 5
- **Styling:** Tailwind CSS v3 with custom design tokens
- **State:** Redux Toolkit
- **Routing:** React Router v6
- **Animations:** Framer Motion
- **Code Editor:** Monaco Editor (@monaco-editor/react)
- **Charts:** Recharts
- **HTTP:** Axios with interceptors
- **Toast:** react-hot-toast
- **UI Primitives:** Radix UI

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
# → http://localhost:3000
```

## Folder Structure

```
src/
├── api/
│   ├── axiosInstance.js      ← JWT interceptor, error normalization
│   ├── authApi.js
│   ├── analysisApi.js
│   └── repositoryApi.js
├── store/
│   ├── index.js
│   └── slices/
│       ├── authSlice.js      ← register/login/fetchMe
│       ├── analysisSlice.js  ← submit/poll/report/history
│       └── themeSlice.js     ← dark/light with localStorage
├── hooks/
│   └── useJobPoller.js       ← 4s interval polling until completed/failed
├── components/
│   ├── ui/                   ← Button, Input, Badge, Card, Skeleton, LoadingScreen
│   ├── auth/                 ← ProtectedRoute
│   ├── layout/               ← AppLayout, Sidebar (animated collapse), Topbar
│   ├── analysis/             ← AnalysisForm (GitHub + Monaco snippet tabs)
│   ├── report/               ← ScoreGauge, SummaryStats, IssueCard, IssueFilters
│   └── dashboard/            ← HistoryCard
├── pages/
│   ├── LandingPage.jsx       ← Marketing page with pipeline visualization
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx     ← Analysis history + quick stats
│   ├── AnalyzePage.jsx       ← GitHub URL + Monaco snippet form
│   ├── ReportPage.jsx        ← Full report: gauge, stats, filterable issue list
│   ├── RepositoriesPage.jsx
│   └── NotFoundPage.jsx
├── lib/
│   └── utils.js              ← cn(), SEVERITY_CONFIG, GRADE_CONFIG, formatters
└── index.css                 ← CSS vars (light+dark), glass, shimmer, dot-grid
```

## Features
- 🌗 Dark / light theme (persisted, system-aware)
- 🔒 JWT auth with auto-redirect and token refresh
- 📊 Animated score gauge (SVG radial progress)
- 🧹 Issue filters by severity + category
- ⏳ Background job polling every 4s with animated processing UI
- 💻 Monaco Editor with syntax highlighting for 9 languages
- 🎞️ Framer Motion page transitions + staggered list animations
- 📱 Responsive sidebar with collapse animation


------------------------------------------------------------------------------


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
