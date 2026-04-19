import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileCode, Copy, Check, Lightbulb } from "lucide-react";
import { SeverityBadge, CategoryBadge } from "@/components/ui/Badge";
import { cn, SEVERITY_CONFIG } from "@/lib/utils";

export default function IssueCard({ issue, index }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.info;

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        "rounded-2xl border bg-card overflow-hidden transition-all duration-200",
        `severity-${issue.severity}`,
        expanded ? "border-primary/30 shadow-md" : "border-border hover:border-border/80"
      )}
    >
      {/* Header — always visible */}
      <button
        className="w-full flex items-start gap-4 p-5 text-left"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Severity color bar */}
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: cfg.color }}
        />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="font-display font-semibold text-base text-foreground leading-snug">
              {issue.title}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SeverityBadge severity={issue.severity} />
              <CategoryBadge category={issue.category} />
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {issue.description}
          </p>

          {issue.file && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 font-mono">
              <FileCode size={11} />
              <span className="truncate">{issue.file}</span>
              {issue.lineStart && (
                <span className="text-primary/60">:{issue.lineStart}{issue.lineEnd && issue.lineEnd !== issue.lineStart ? `–${issue.lineEnd}` : ""}</span>
              )}
            </div>
          )}
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1 text-muted-foreground"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-border/50 pt-5">
              {/* Full description */}
              <p className="text-sm text-foreground/80 leading-relaxed">{issue.description}</p>

              {/* Suggestion */}
              {issue.suggestion && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Lightbulb size={14} />
                    Suggested Fix
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{issue.suggestion}</p>
                </div>
              )}

              {/* Code snippet */}
              {issue.codeSnippet && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problematic Code</p>
                  </div>
                  <pre className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                    {issue.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Fixed code */}
              {issue.fixedCode && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Corrected Code</p>
                    <button
                      onClick={() => handleCopy(issue.fixedCode)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
                    >
                      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                    {issue.fixedCode}
                  </pre>
                </div>
              )}

              {/* Effort badge */}
              {issue.effort && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Fix effort:</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-semibold",
                    issue.effort === "trivial" ? "bg-emerald-500/10 text-emerald-500" :
                    issue.effort === "minor"   ? "bg-cyan-500/10 text-cyan-500" :
                    issue.effort === "moderate"? "bg-amber-500/10 text-amber-500" :
                    "bg-rose-500/10 text-rose-500"
                  )}>
                    {issue.effort.charAt(0).toUpperCase() + issue.effort.slice(1)}
                  </span>
                </div>
              )}

              {/* OWASP / references */}
              {issue.owaspCategory && (
                <p className="text-xs text-muted-foreground/60 font-mono">
                  OWASP: {issue.owaspCategory}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
