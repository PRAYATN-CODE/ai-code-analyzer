import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2, Bug, ShieldAlert, Zap, ArrowRight,
  Github, Sparkles, CheckCircle2, Moon, Sun
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, selectTheme } from "@/store/slices/themeSlice";

const FEATURES = [
  {
    icon: Bug,
    title: "Bug Detection",
    desc: "Finds null pointer exceptions, race conditions, off-by-one errors and logic bugs before they hit production.",
    color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20",
  },
  {
    icon: ShieldAlert,
    title: "Security Scanning",
    desc: "Zero-trust analysis covering OWASP Top 10: injection flaws, broken auth, sensitive data exposure.",
    color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20",
  },
  {
    icon: Zap,
    title: "Performance Analysis",
    desc: "Detects O(n²) algorithms, memory leaks, N+1 queries, and blocking I/O in async code.",
    color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20",
  },
  {
    icon: Sparkles,
    title: "Fix Synthesis",
    desc: "The Synthesizer agent de-duplicates findings, scores your codebase A–F, and generates corrected code.",
    color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20",
  },
];

const PIPELINE_STEPS = [
  { num: "01", label: "Ingest",       desc: "GitHub ZIP or code snippet" },
  { num: "02", label: "Plan",         desc: "Detect framework & critical files" },
  { num: "03", label: "Parallel Scan", desc: "Bug · Security · Performance agents" },
  { num: "04", label: "Synthesize",   desc: "Merge, rank, generate fixes" },
];

export default function LandingPage() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Code2 size={16} className="text-primary" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">CodeSense AI</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-28 px-6 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dots opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-8">
            <Sparkles size={12} />
            Powered by Gemini 1.5 Pro · Multi-Agent Architecture
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            AI-Powered{" "}
            <span className="gradient-text">Code Analysis</span>
            <br />
            That Actually Fixes
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Five specialized AI agents analyze your codebase in parallel — detecting bugs,
            security vulnerabilities, and performance bottlenecks, then generating
            context-aware fixes with corrected code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-primary/90 glow-primary-sm transition-all duration-200 hover:scale-[1.02]"
            >
              Start analyzing free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border border-border bg-card text-foreground px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-accent transition-all duration-200"
            >
              <Github size={16} />
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Floating code preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative z-10 mt-20 max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-xs font-mono text-muted-foreground ml-2">analysis-result.json</span>
            </div>
            <pre className="p-5 text-xs font-mono text-left leading-relaxed overflow-hidden">
              <span className="text-muted-foreground">{`{
  `}</span>
              <span className="text-primary">{`"summary"`}</span>
              <span className="text-muted-foreground">{`: {
    `}</span>
              <span className="text-cyan-400">{`"grade"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-amber-400">{`"B"`}</span>
              <span className="text-muted-foreground">{`, `}</span>
              <span className="text-cyan-400">{`"overallScore"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-emerald-400">{`78`}</span>
              <span className="text-muted-foreground">{`,
    `}</span>
              <span className="text-cyan-400">{`"critical"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-rose-400">{`2`}</span>
              <span className="text-muted-foreground">{`, `}</span>
              <span className="text-cyan-400">{`"high"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-orange-400">{`5`}</span>
              <span className="text-muted-foreground">{`, `}</span>
              <span className="text-cyan-400">{`"medium"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-amber-400">{`8`}</span>
              {`
  `}
              <span className="text-muted-foreground">{`},
  `}</span>
              <span className="text-primary">{`"issues"`}</span>
              <span className="text-muted-foreground">{`: [
    { `}</span>
              <span className="text-cyan-400">{`"severity"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-rose-400">{`"critical"`}</span>
              <span className="text-muted-foreground">{`,
      `}</span>
              <span className="text-cyan-400">{`"title"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-green-400">{`"SQL Injection in getUserById"`}</span>
              <span className="text-muted-foreground">{`,
      `}</span>
              <span className="text-cyan-400">{`"fixedCode"`}</span>
              <span className="text-muted-foreground">{`: `}</span>
              <span className="text-green-400">{`"db.query('SELECT * FROM users WHERE id = ?', [id])"`}</span>
              <span className="text-muted-foreground">{` }
  ]
}`}</span>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* ── Pipeline ── */}
      <section className="py-20 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            How the Pipeline Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card"
              >
                <span className="font-mono text-xs text-primary font-bold">{step.num}</span>
                <div>
                  <p className="font-display font-semibold text-base">{step.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight size={14} className="absolute -right-3 top-1/2 -translate-y-1/2 text-primary/40 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">
            Five Agents. One Unified Report.
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Each agent is a specialized Gemini prompt with strict JSON output enforcement. They run in parallel then converge.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border p-6 space-y-3 ${f.bg} ${f.border}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.bg} border ${f.border}`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 border-t border-border bg-muted/20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto space-y-6"
        >
          <h2 className="font-display text-4xl font-bold">
            Ready to ship <span className="gradient-text">cleaner code?</span>
          </h2>
          <p className="text-muted-foreground">
            Paste a GitHub URL or snippet and get a full multi-agent analysis in under 90 seconds.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-semibold hover:bg-primary/90 glow-primary transition-all duration-200 hover:scale-[1.02]"
          >
            Start for free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-display font-semibold">CodeSense AI</span>
          <span>Built with Gemini 1.5 Pro · Node.js · MongoDB</span>
        </div>
      </footer>
    </div>
  );
}
