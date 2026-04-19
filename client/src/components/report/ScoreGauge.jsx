import { motion } from "framer-motion";
import { cn, GRADE_CONFIG, getScoreColor } from "@/lib/utils";

export default function ScoreGauge({ score = 0, grade = "F" }) {
  const gradeInfo = GRADE_CONFIG[grade] || GRADE_CONFIG.F;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (score / 100) * circumference;

  const trackColor =
    score >= 90 ? "#10b981" :
    score >= 75 ? "#06b6d4" :
    score >= 55 ? "#f59e0b" :
    score >= 35 ? "#f97316" :
    "#f43f5e";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            strokeWidth="10"
            stroke="currentColor"
            className="text-muted/60"
          />
          {/* Progress */}
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            strokeWidth="10"
            stroke={trackColor}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${trackColor}60)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className={cn("text-4xl font-display font-bold", getScoreColor(score))}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground font-mono">/100</span>
        </div>
      </div>

      {/* Grade badge */}
      <div className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold", gradeInfo.bg, gradeInfo.color)}>
        <span className="text-lg font-display font-bold">{grade}</span>
        <span className="text-xs font-medium opacity-80">{gradeInfo.label}</span>
      </div>
    </div>
  );
}
