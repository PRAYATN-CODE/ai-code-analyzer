import { analysisApi } from "@/api/analysisApi";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  selectSubmitting,
  setJobStatus,
  submitGithubAnalysis,
  submitSnippetAnalysis,
} from "@/store/slices/analysisSlice";
import { selectTheme } from "@/store/slices/themeSlice";
import Editor from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bug,
  CheckCircle2,
  Code2,
  Cpu,
  Github,
  Info,
  Shield,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LANGUAGES = ["javascript", "typescript", "python", "java", "go", "rust", "php", "csharp", "cpp"];

const tabs = [
  { id: "github",  label: "GitHub Repo",  icon: Github },
  { id: "snippet", label: "Code Snippet", icon: Code2 },
];

const AGENT_STEPS = [
  { icon: Cpu,      label: "Planner Agent",    desc: "Mapping architecture & critical files…" },
  { icon: Bug,      label: "Bug Detector",     desc: "Scanning for logical errors & edge cases…" },
  { icon: Shield,   label: "Security Scanner", desc: "Checking OWASP Top 10 vulnerabilities…" },
  { icon: Zap,      label: "Performance Agent",desc: "Analyzing complexity & memory usage…" },
  { icon: Sparkles, label: "Fix Synthesizer",  desc: "Generating corrected code & final report…" },
];

// ─── JobTracker — live agent progress while polling ──────────────────────────
function JobTracker({ jobId, onComplete, onFail }) {
  const [activeStep, setActiveStep] = useState(0);
  const [status, setStatus]         = useState("processing");
  const [elapsed, setElapsed]       = useState(0);
  const pollRef  = useRef(null);
  const stepRef  = useRef(null);
  const startRef = useRef(Date.now());

  // Advance simulated step every 18s (5 agents × ~18s ≈ 90s total)
  useEffect(() => {
    stepRef.current = setInterval(
      () => setActiveStep((p) => Math.min(p + 1, AGENT_STEPS.length - 1)),
      18000
    );
    return () => clearInterval(stepRef.current);
  }, []);

  // Elapsed counter
  useEffect(() => {
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)),
      1000
    );
    return () => clearInterval(t);
  }, []);

  // Poll backend every 4s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await analysisApi.getStatus(jobId);
        const s = res.data.data?.status;
        setStatus(s);
        if (s === "completed") {
          clearInterval(pollRef.current);
          clearInterval(stepRef.current);
          setActiveStep(AGENT_STEPS.length - 1);
          onComplete(jobId);
        } else if (s === "failed") {
          clearInterval(pollRef.current);
          clearInterval(stepRef.current);
          onFail(res.data.data?.errorMessage);
        }
      } catch { /* network blip — keep polling */ }
    };

    poll(); // immediate first hit
    pollRef.current = setInterval(poll, 4000);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  if (status === "completed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 flex flex-col items-center gap-3 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <CheckCircle2 size={48} className="text-emerald-500" />
        </motion.div>
        <p className="font-display font-bold text-xl">Analysis Complete!</p>
        <p className="text-sm text-muted-foreground">Opening your report…</p>
      </motion.div>
    );
  }

  if (status === "failed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 flex flex-col items-center gap-3 text-center"
      >
        <XCircle size={48} className="text-destructive" />
        <p className="font-display font-bold text-xl">Analysis Failed</p>
        <p className="text-sm text-muted-foreground">An error occurred during processing.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-card p-6 space-y-5"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-t-primary border-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu size={15} className="text-primary" />
            </div>
          </div>
          <div>
            <p className="font-display font-semibold">Agents Running</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              job: {jobId.slice(0, 8)}…
            </p>
          </div>
        </div>
        <span className="font-mono text-sm text-muted-foreground tabular-nums">{elapsed}s</span>
      </div>

      {/* Agent step list */}
      <div className="space-y-1.5">
        {AGENT_STEPS.map((step, i) => {
          const done    = i < activeStep;
          const active  = i === activeStep;
          const pending = i > activeStep;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300",
                done    && "bg-emerald-500/5 border border-emerald-500/15",
                active  && "bg-primary/5 border border-primary/20 shadow-sm",
                pending && "opacity-35"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                done   && "bg-emerald-500/15",
                active && "bg-primary/15",
                pending && "bg-muted"
              )}>
                {done ? (
                  <CheckCircle2 size={13} className="text-emerald-500" />
                ) : active ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  >
                    <step.icon size={13} className="text-primary" />
                  </motion.div>
                ) : (
                  <step.icon size={13} className="text-muted-foreground/60" />
                )}
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  done ? "text-emerald-500" : active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {active && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-muted-foreground mt-0.5"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </div>

              {/* Status tag */}
              <span className={cn(
                "text-[10px] font-mono font-semibold flex-shrink-0 px-1.5 py-0.5 rounded",
                done   && "text-emerald-500 bg-emerald-500/10",
                active && "text-primary bg-primary/10 animate-pulse-slow",
                pending && "text-muted-foreground/40"
              )}>
                {done ? "✓ done" : active ? "running" : "queued"}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pipeline progress</span>
          <span className="font-mono">
            {Math.round(((activeStep) / AGENT_STEPS.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
            animate={{ width: `${Math.max(5, (activeStep / AGENT_STEPS.length) * 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground/50 font-mono">
        ~60–120s total · safe to navigate away — job runs server-side
      </p>
    </motion.div>
  );
}

// ─── Main AnalysisForm ────────────────────────────────────────────────────────
export default function AnalysisForm() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const submitting = useSelector(selectSubmitting);
  const theme      = useSelector(selectTheme);

  const [activeTab,     setActiveTab]     = useState("github");
  const [githubUrl,     setGithubUrl]     = useState("");
  const [code,          setCode]          = useState("// Paste your code here...\n");
  const [language,      setLanguage]      = useState("javascript");
  const [urlError,      setUrlError]      = useState("");
  const [trackingJobId, setTrackingJobId] = useState(null);

  const validateGithubUrl = (url) =>
    /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$/.test(url.trim());

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!validateGithubUrl(githubUrl)) {
      setUrlError("Please enter a valid GitHub repository URL");
      return;
    }
    setUrlError("");
    const result = await dispatch(submitGithubAnalysis({ githubUrl: githubUrl.trim() }));
    if (result.meta.requestStatus === "fulfilled") {
      const jobId = result.payload?.jobId;
      if (jobId) {
        dispatch(setJobStatus("processing"));
        setTrackingJobId(jobId);
      } else {
        toast.error("No job ID returned from server.");
      }
    }
  };

  const handleSnippetSubmit = async () => {
    if (!code.trim() || code.trim() === "// Paste your code here...") return;
    const result = await dispatch(submitSnippetAnalysis({ code: code.trim(), language }));
    if (result.meta.requestStatus === "fulfilled") {
      const jobId = result.payload?.jobId;
      if (jobId) navigate(`/report/${jobId}`);
    }
  };

  const handleComplete = (jobId) => {
    toast.success("Analysis complete!");
    setTimeout(() => navigate(`/report/${jobId}`), 600);
  };

  const handleFail = (errMsg) => {
    toast.error(errMsg || "Analysis failed. Please try again.");
    setTrackingJobId(null);
  };

  // ── Show JobTracker while polling ──────────────────────────────────────────
  if (trackingJobId) {
    return (
      <div className="w-full max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">Analysis Running</h3>
          <button
            onClick={() => { setTrackingJobId(null); navigate("/dashboard"); }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            → Go to Dashboard
          </button>
        </div>
        <JobTracker
          jobId={trackingJobId}
          onComplete={handleComplete}
          onFail={handleFail}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-2xl bg-muted w-fit mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-card border border-border rounded-xl shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon size={15} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── GitHub tab ── */}
        {activeTab === "github" ? (
          <motion.div
            key="github"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleGithubSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Repository URL</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => { setGithubUrl(e.target.value); setUrlError(""); }}
                      placeholder="https://github.com/owner/repository"
                      className={cn(
                        "w-full h-11 pl-9 pr-4 rounded-xl border bg-background/50 text-sm font-mono",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
                        "transition-all duration-200 placeholder:text-muted-foreground/50",
                        urlError ? "border-destructive" : "border-input"
                      )}
                    />
                  </div>
                  <Button type="submit" loading={submitting} disabled={!githubUrl || submitting} className="gap-2 px-6 h-11">
                    {!submitting && <ArrowRight size={16} />}
                    Analyze
                  </Button>
                </div>
                {urlError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle size={12} /> {urlError}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
                <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground/80">How it works</p>
                  <p>Repo fetched as ZIP → filtered → 5 sequential AI agents → scored report with corrected code.</p>
                  <p className="text-xs text-muted-foreground/70 font-mono mt-1">Estimated: ~60–120 seconds.</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">Try an example</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "https://github.com/expressjs/express",
                    "https://github.com/axios/axios",
                    "https://github.com/tj/commander.js",
                  ].map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setGithubUrl(url)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent hover:border-primary/40 transition-colors font-mono text-muted-foreground hover:text-foreground"
                    >
                      {url.replace("https://github.com/", "")}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          /* ── Snippet tab ── */
          <motion.div
            key="snippet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-8 px-3 rounded-lg border border-input bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleSnippetSubmit} loading={submitting} size="sm" className="gap-2">
                {!submitting && <ArrowRight size={15} />}
                Analyze Snippet
              </Button>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  snippet.{language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "python" ? "py" : language}
                </span>
              </div>
              <Editor
                height="400px"
                language={language}
                value={code}
                onChange={(v) => setCode(v || "")}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  automaticLayout: true,
                  tabSize: 2,
                  smoothScrolling: true,
                  cursorSmoothCaretAnimation: "on",
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}