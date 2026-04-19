import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowLeft, Github, Code2, Clock, Cpu, RefreshCw,
  Download, ChevronDown, Lightbulb, AlertTriangle,
} from "lucide-react";
import {
  fetchReport,
  selectCurrentReport,
  selectLoadingReport,
  selectActiveFilters,
  clearCurrentJob,
} from "@/store/slices/analysisSlice";
import { analysisApi } from "@/api/analysisApi";
import ScoreGauge from "@/components/report/ScoreGauge";
import SummaryStats from "@/components/report/SummaryStats";
import IssueCard from "@/components/report/IssueCard";
import IssueFilters from "@/components/report/IssueFilters";
import { SkeletonReport } from "@/components/ui/Skeleton";
import { cn, formatDate } from "@/lib/utils";
import useJobPoller from "@/hooks/useJobPoller";

export default function ReportPage() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const report = useSelector(selectCurrentReport);
  const loading = useSelector(selectLoadingReport);
  const filters = useSelector(selectActiveFilters);
  const { startPolling, stopPolling } = useJobPoller();

  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    dispatch(fetchReport(jobId)).then((res) => {
      const status = res.payload?.status;
      if (status === "processing" || status === "pending") {
        setPolling(true);
        startPolling(jobId, () => {
          setPolling(false);
          dispatch(fetchReport(jobId));
        });
      }
    });
    return () => stopPolling();
  }, [jobId]);

  // Filter issues by active filters
  const filteredIssues = (report?.issues || []).filter((issue) => {
    if (filters.severity.length > 0 && !filters.severity.includes(issue.severity)) return false;
    if (filters.category.length > 0 && !filters.category.includes(issue.category)) return false;
    return true;
  });

  // ── Loading state ──
  if (loading && !report) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonReport />
      </div>
    );
  }

  // ── Processing state ──
  if (report?.status === "processing" || report?.status === "pending" || polling) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center gap-8 text-center">
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-t-primary border-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu size={28} className="text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Agents at Work</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Five AI agents are analyzing your codebase in parallel. This typically takes 30–90 seconds.
          </p>
        </div>

        {/* Animated agent steps */}
        <div className="w-full max-w-sm space-y-2">
          {[
            "Planner: Mapping architecture…",
            "Bug Detector: Scanning logic…",
            "Security: Checking OWASP Top 10…",
            "Performance: Analyzing complexity…",
            "Synthesizer: Generating fixes…",
          ].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: [0, 1, 0.6] }}
              transition={{ delay: i * 0.6, duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="font-mono text-xs">{step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── Failed state ──
  if (report?.status === "failed") {
    return (
      <div className="max-w-xl mx-auto py-20 flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-destructive" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-muted-foreground text-sm">{report.errorMessage || "An unexpected error occurred."}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/analyze"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <RefreshCw size={15} /> Try Again
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent transition-all"
          >
            <ArrowLeft size={15} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const summary = report.summary || {};
  const arch = report.architectureContext || {};
  const keyRecs = report.keyRecommendations || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Clock size={12} />
          {formatDate(report.createdAt)}
        </div>
      </div>

      {/* Report header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            {report.inputType === "github"
              ? <Github size={22} className="text-primary" />
              : <Code2 size={22} className="text-primary" />
            }
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-xl truncate">
              {report.repository?.name || (report.inputType === "snippet" ? "Code Snippet" : "Analysis Report")}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground font-mono">
              {arch.framework && <span className="px-1.5 py-0.5 rounded bg-muted">{arch.framework}</span>}
              {arch.primaryLanguage && <span>{arch.primaryLanguage}</span>}
              {report.agentMetadata?.processingTimeMs && (
                <span className="text-muted-foreground/60">
                  · {(report.agentMetadata.processingTimeMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score gauge */}
        <div className="flex-shrink-0">
          <ScoreGauge score={summary.overallScore || 0} grade={summary.grade || "F"} />
        </div>
      </motion.div>

      {/* Summary stats grid */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SummaryStats summary={summary} />
      </motion.div>

      {/* Key Recommendations */}
      {keyRecs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3"
        >
          <div className="flex items-center gap-2 font-display font-semibold text-primary">
            <Lightbulb size={17} />
            Key Recommendations
          </div>
          <ul className="space-y-2">
            {keyRecs.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Issues list */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">
            Issues <span className="text-muted-foreground font-normal text-base">({report.issues?.length || 0})</span>
          </h2>
        </div>

        {/* Filters */}
        <IssueFilters totalShown={filteredIssues.length} totalAll={report.issues?.length || 0} />

        {/* Issue cards */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm rounded-2xl border border-dashed border-border">
            No issues match the current filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue, i) => (
              <IssueCard key={issue.id || i} issue={issue} index={i} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Agent metadata footer */}
      {report.agentMetadata && (
        <motion.details
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card text-sm group"
        >
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none text-muted-foreground hover:text-foreground transition-colors">
            <span className="font-medium flex items-center gap-2">
              <Cpu size={14} /> Agent Metadata
            </span>
            <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border pt-4">
            {[
              ["Total Tokens", report.agentMetadata.totalTokensUsed?.toLocaleString()],
              ["Processing Time", `${(report.agentMetadata.processingTimeMs / 1000).toFixed(1)}s`],
              ["Planner Tokens", report.agentMetadata.plannerTokens?.toLocaleString()],
              ["Bug Agent Tokens", report.agentMetadata.bugAgentTokens?.toLocaleString()],
              ["Security Tokens", report.agentMetadata.securityAgentTokens?.toLocaleString()],
              ["Performance Tokens", report.agentMetadata.performanceAgentTokens?.toLocaleString()],
            ].map(([label, val]) => val && (
              <div key={label} className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-mono font-semibold text-foreground">{val}</p>
              </div>
            ))}
          </div>
        </motion.details>
      )}
    </div>
  );
}
