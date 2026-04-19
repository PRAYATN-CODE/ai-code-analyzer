import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Github, Code2, Clock, Trash2, ExternalLink, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { deleteReport } from "@/store/slices/analysisSlice";
import { cn, formatRelative, GRADE_CONFIG, getScoreColor } from "@/lib/utils";

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: "text-emerald-500", label: "Completed" },
  processing: { icon: Loader2,      color: "text-primary",     label: "Processing", spin: true },
  pending:    { icon: Clock,        color: "text-amber-500",   label: "Pending" },
  failed:     { icon: XCircle,      color: "text-destructive", label: "Failed" },
};

export default function HistoryCard({ report, index }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const grade = report.summary?.grade;
  const gradeInfo = grade ? GRADE_CONFIG[grade] : null;
  const score = report.summary?.overallScore;

  const handleDelete = async (e) => {
    e.stopPropagation();
    await dispatch(deleteReport(report.jobId));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => report.status === "completed" && navigate(`/report/${report.jobId}`)}
      className={cn(
        "group rounded-2xl border border-border bg-card p-5 transition-all duration-200",
        report.status === "completed"
          ? "cursor-pointer hover:border-primary/40 hover:shadow-md"
          : "cursor-default opacity-80"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            {report.inputType === "github"
              ? <Github size={16} className="text-muted-foreground" />
              : <Code2 size={16} className="text-muted-foreground" />
            }
          </div>

          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-foreground truncate">
              {report.repository?.name || (report.inputType === "snippet" ? "Code Snippet" : "Repository")}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-mono">
                {report.architectureContext?.framework || "—"}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span>{formatRelative(report.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Score */}
          {score !== undefined && report.status === "completed" && (
            <span className={cn("text-lg font-display font-bold tabular-nums", getScoreColor(score))}>
              {score}
            </span>
          )}

          {/* Grade chip */}
          {gradeInfo && report.status === "completed" && (
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg", gradeInfo.bg, gradeInfo.color)}>
              {grade}
            </span>
          )}

          {/* Status */}
          <div className={cn("flex items-center gap-1 text-xs font-medium", status.color)}>
            <StatusIcon size={13} className={status.spin ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{status.label}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {report.status === "completed" && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/report/${report.jobId}`); }}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <ExternalLink size={13} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Issue summary bar */}
      {report.summary && report.status === "completed" && (
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          {report.summary.critical > 0 && (
            <span className="text-rose-500 font-semibold">{report.summary.critical} critical</span>
          )}
          {report.summary.high > 0 && (
            <span className="text-orange-500">{report.summary.high} high</span>
          )}
          {report.summary.medium > 0 && (
            <span className="text-amber-500">{report.summary.medium} medium</span>
          )}
          <span className="ml-auto">{report.summary.totalIssues} total issues</span>
        </div>
      )}
    </motion.div>
  );
}
