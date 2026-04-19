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