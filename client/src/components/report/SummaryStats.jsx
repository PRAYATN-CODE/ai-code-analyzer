import { motion } from "framer-motion";
import { Bug, ShieldAlert, Zap, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const STAT_ITEMS = [
  { key: "critical", label: "Critical",    color: "text-rose-500",   bg: "bg-rose-500/10",   border: "border-rose-500/20",   icon: AlertTriangle },
  { key: "high",     label: "High",        color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertTriangle },
  { key: "medium",   label: "Medium",      color: "text-amber-500",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: Info },
  { key: "low",      label: "Low",         color: "text-cyan-500",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: Info },
  { key: "bugCount", label: "Bugs",        color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/20",   icon: Bug },
  { key: "securityCount", label: "Security", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", icon: ShieldAlert },
  { key: "performanceCount", label: "Performance", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: Zap },
  { key: "totalIssues", label: "Total", color: "text-foreground", bg: "bg-muted", border: "border-border", icon: Info },
];

export default function SummaryStats({ summary = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STAT_ITEMS.map((item, i) => {
        const count = summary[item.key] ?? 0;
        const Icon = item.icon;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "rounded-2xl border p-4 flex flex-col gap-2",
              item.bg, item.border
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
              <Icon size={14} className={item.color} />
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 + 0.3 }}
              className={cn("text-3xl font-display font-bold", item.color)}
            >
              {count}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}
