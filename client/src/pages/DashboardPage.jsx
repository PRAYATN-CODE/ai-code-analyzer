import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, History, Code2, ArrowRight, TrendingUp } from "lucide-react";
import { fetchHistory, selectHistory, selectLoadingHistory } from "@/store/slices/analysisSlice";
import { selectUser } from "@/store/slices/authSlice";
import HistoryCard from "@/components/dashboard/HistoryCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const history = useSelector(selectHistory);
  const loading = useSelector(selectLoadingHistory);
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchHistory({ limit: 10 }));
  }, [dispatch]);

  // Quick stats from recent completed reports
  const completed = history.filter((r) => r.status === "completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, r) => s + (r.summary?.overallScore || 0), 0) / completed.length)
    : 0;
  const totalIssues = completed.reduce((s, r) => s + (r.summary?.totalIssues || 0), 0);
  const criticalCount = completed.reduce((s, r) => s + (r.summary?.critical || 0), 0);

  const chartData = [
    { name: "Score", value: avgScore, fill: avgScore >= 75 ? "#06b6d4" : avgScore >= 55 ? "#f59e0b" : "#f43f5e" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">
            Welcome back,{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0] || "Developer"}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {history.length
              ? `${history.length} analysis run${history.length !== 1 ? "s" : ""} total`
              : "No analyses yet — start your first one"}
          </p>
        </motion.div>

        <Link
          to="/analyze"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all glow-primary-sm"
        >
          <Plus size={16} />
          New Analysis
        </Link>
      </div>

      {/* Stats row */}
      {completed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Analyses Run",  value: completed.length,  color: "text-foreground",    icon: Code2 },
            { label: "Avg Score",     value: `${avgScore}/100`, color: "text-cyan-500",       icon: TrendingUp },
            { label: "Total Issues",  value: totalIssues,       color: "text-amber-500",      icon: History },
            { label: "Critical Found",value: criticalCount,     color: "text-rose-500",       icon: ArrowRight },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">{s.label}</p>
              <p className={`text-3xl font-display font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <Code2 size={28} className="text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">No analyses yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Paste a GitHub URL or a code snippet to run your first multi-agent analysis.
          </p>
          <Link
            to="/analyze"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus size={15} /> Start Analyzing
          </Link>
        </motion.div>
      )}

      {/* History list */}
      {(loading || history.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <History size={18} className="text-muted-foreground" />
              Recent Analyses
            </h2>
          </div>

          <div className="space-y-3">
            {loading
              ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
              : history.map((report, i) => (
                  <HistoryCard key={report._id || report.jobId} report={report} index={i} />
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
