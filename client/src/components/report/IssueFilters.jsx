import { useDispatch, useSelector } from "react-redux";
import { setFilter, clearFilters, selectActiveFilters } from "@/store/slices/analysisSlice";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const SEVERITIES = ["critical", "high", "medium", "low", "info"];
const CATEGORIES = ["bug", "security", "performance", "code-quality"];

const SEV_COLORS = {
  critical: "bg-rose-500/10 text-rose-500 border-rose-500/30",
  high:     "bg-orange-500/10 text-orange-500 border-orange-500/30",
  medium:   "bg-amber-500/10 text-amber-500 border-amber-500/30",
  low:      "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  info:     "bg-violet-500/10 text-violet-500 border-violet-500/30",
};

const CAT_COLORS = {
  bug:          "bg-rose-400/10 text-rose-400 border-rose-400/20",
  security:     "bg-orange-400/10 text-orange-400 border-orange-400/20",
  performance:  "bg-amber-400/10 text-amber-400 border-amber-400/20",
  "code-quality":"bg-violet-400/10 text-violet-400 border-violet-400/20",
};

export default function IssueFilters({ totalShown, totalAll }) {
  const dispatch = useDispatch();
  const filters = useSelector(selectActiveFilters);
  const hasActive = filters.severity.length > 0 || filters.category.length > 0;

  const toggle = (type, val) => dispatch(setFilter({ type, value: val }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{totalShown}</span> of <span className="text-foreground">{totalAll}</span> issues
        </p>
        {hasActive && (
          <button
            onClick={() => dispatch(clearFilters())}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
          >
            <X size={11} /> Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {SEVERITIES.map((s) => {
          const active = filters.severity.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggle("severity", s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150",
                active
                  ? cn(SEV_COLORS[s], "ring-1 ring-offset-1 ring-offset-background", `ring-current`)
                  : "bg-muted/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}

        <span className="self-center text-muted-foreground/40 text-xs">|</span>

        {CATEGORIES.map((c) => {
          const active = filters.category.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle("category", c)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                active
                  ? CAT_COLORS[c]
                  : "bg-muted/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              )}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
