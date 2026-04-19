import { repositoryApi } from "@/api/repositoryApi";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { cn, formatDate, formatRelative, getScoreColor, GRADE_CONFIG } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Clock,
    Code2,
    ExternalLink,
    FileCode,
    Github,
    Loader2, XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

const STATUS_CONFIG = {
    completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Completed" },
    processing: { icon: Loader2, color: "text-primary", bg: "bg-primary/10", label: "Processing", spin: true },
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
    failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
};

export default function RepositoryDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [repo, setRepo] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await repositoryApi.getOne(id);
            setRepo(res.data.data);
        } catch (err) {
            toast.error("Repository not found");
            navigate("/repositories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="h-8 w-32 rounded-lg shimmer" />
                <div className="h-24 rounded-2xl shimmer" />
                <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
            </div>
        );
    }

    if (!repo) return null;

    const status = STATUS_CONFIG[repo.status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const reports = repo.reports || [];

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            {/* Back */}
            <button
                onClick={() => navigate("/repositories")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft size={14} /> Repositories
            </button>

            {/* Header card */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                            <Github size={22} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-display font-bold text-xl truncate">{repo.name}</h1>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-mono">
                                <span>branch: {repo.branch || "main"}</span>
                                {repo.detectedFramework && repo.detectedFramework !== "Unknown" && (
                                    <>
                                        <span className="text-muted-foreground/40">·</span>
                                        <span>{repo.detectedFramework}</span>
                                    </>
                                )}
                                <span className="text-muted-foreground/40">·</span>
                                <span>Added {formatRelative(repo.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status chip + external link */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn(
                            "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                            status.bg, status.color
                        )}>
                            <StatusIcon size={12} className={status.spin ? "animate-spin" : ""} />
                            {status.label}
                        </span>
                        {repo.githubUrl && (
                            <a
                                href={repo.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                            >
                                <ExternalLink size={13} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                        { label: "Total Files", value: repo.totalFiles || "—" },
                        { label: "Analyzed Files", value: repo.analyzedFiles || "—" },
                        { label: "Analyses Run", value: reports.length },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl bg-muted/50 p-3 text-center">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="font-display font-bold text-xl mt-1">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Language tags */}
                {repo.detectedLanguages?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {repo.detectedLanguages.map((lang) => (
                            <span key={lang} className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground font-mono">
                                {lang}
                            </span>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Analysis Reports list */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                        <FileCode size={17} className="text-muted-foreground" />
                        Analysis History
                        <span className="text-muted-foreground font-normal text-base">({reports.length})</span>
                    </h2>
                    <Link
                        to="/analyze"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
                        + Run new analysis
                    </Link>
                </div>

                {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-border text-center gap-3">
                        <Code2 size={32} className="text-muted-foreground/30" />
                        <div>
                            <p className="font-medium text-sm">No analyses yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Run an analysis from the{" "}
                                <Link to="/analyze" className="text-primary hover:underline">Analyze page</Link>.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report, i) => {
                            const grade = report.summary?.grade;
                            const gradeInfo = grade ? GRADE_CONFIG[grade] : null;
                            const score = report.summary?.overallScore;
                            const rStatus = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                            const RIcon = rStatus.icon;

                            return (
                                <motion.div
                                    key={report._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => report.status === "completed" && navigate(`/report/${report.jobId}`)}
                                    className={cn(
                                        "group rounded-2xl border border-border bg-card p-5",
                                        "flex items-center gap-4 transition-all duration-200",
                                        report.status === "completed"
                                            ? "cursor-pointer hover:border-primary/40 hover:shadow-md"
                                            : "opacity-75"
                                    )}
                                >
                                    {/* Score */}
                                    {score !== undefined && report.status === "completed" ? (
                                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 w-12">
                                            <span className={cn("text-2xl font-display font-bold tabular-nums", getScoreColor(score))}>
                                                {score}
                                            </span>
                                            {gradeInfo && (
                                                <span className={cn("text-[10px] font-bold px-1.5 rounded", gradeInfo.bg, gradeInfo.color)}>
                                                    {grade}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                            <RIcon size={18} className={cn(rStatus.color, rStatus.spin && "animate-spin")} />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xs font-semibold px-2 py-0.5 rounded-full",
                                                rStatus.bg, rStatus.color
                                            )}>
                                                {rStatus.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {formatDate(report.createdAt)}
                                            </span>
                                        </div>
                                        {report.summary && report.status === "completed" && (
                                            <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                                                {report.summary.critical > 0 && (
                                                    <span className="text-rose-500">{report.summary.critical} critical</span>
                                                )}
                                                {report.summary.high > 0 && (
                                                    <span className="text-orange-500">{report.summary.high} high</span>
                                                )}
                                                <span>{report.summary.totalIssues} total issues</span>
                                            </div>
                                        )}
                                    </div>

                                    {report.status === "completed" && (
                                        <ChevronRight size={15} className="text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}