import { cn, SEVERITY_CONFIG, CATEGORY_CONFIG } from "@/lib/utils";

export function Badge({ children, className, variant = "default" }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium font-sans transition-colors";
  const variants = {
    default: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  return <span className={cn(base, variants[variant] || variants.default, className)}>{children}</span>;
}

export function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
      cfg.bg, cfg.text, "border", cfg.border
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.bug;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-medium",
      cfg.bg, cfg.color
    )}>
      {cfg.label}
    </span>
  );
}
