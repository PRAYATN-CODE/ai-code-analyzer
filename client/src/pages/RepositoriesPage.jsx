import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderGit2, Trash2, ExternalLink, Github, RefreshCw, ChevronRight } from "lucide-react";
import { repositoryApi } from "@/api/repositoryApi";
import { cn, formatRelative } from "@/lib/utils";
import { SkeletonCard } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function RepositoriesPage() {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await repositoryApi.getAll();
      setRepos(res.data.data || []);
    } catch {
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await repositoryApi.delete(id);
      setRepos((p) => p.filter((r) => r._id !== id));
      toast.success("Repository removed");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const STATUS_COLORS = {
    completed:  "text-emerald-500 bg-emerald-500/10",
    processing: "text-primary bg-primary/10",
    failed:     "text-destructive bg-destructive/10",
    pending:    "text-amber-500 bg-amber-500/10",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {repos.length} repository record{repos.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
        <button
          onClick={load}
          className="h-9 w-9 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center">
          <FolderGit2 size={40} className="text-muted-foreground/40 mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">No repositories yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Repositories are automatically saved when you analyze a GitHub URL.
          </p>
          <button
            onClick={() => navigate("/analyze")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Github size={15} /> Analyze a Repo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {repos.map((repo, i) => (
            <motion.div
              key={repo._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => navigate(`/repositories/${repo._id}`)}
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Github size={18} className="text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-sm truncate">{repo.name}</p>
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                    STATUS_COLORS[repo.status] || "text-muted-foreground bg-muted"
                  )}>
                    {repo.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
                  {repo.detectedFramework && repo.detectedFramework !== "Unknown" && (
                    <span>{repo.detectedFramework}</span>
                  )}
                  {repo.branch && <span>branch: {repo.branch}</span>}
                  <span>{formatRelative(repo.updatedAt)}</span>
                </div>
                {repo.detectedLanguages?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {repo.detectedLanguages.slice(0, 4).map((lang) => (
                      <span key={lang} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {repo.githubUrl && (
                  <a
                    href={repo.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  onClick={(e) => handleDelete(repo._id, e)}
                  disabled={deleting === repo._id}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  {deleting === repo._id
                    ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
