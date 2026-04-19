import { motion } from "framer-motion";
import { Cpu, Zap, Shield, Bug, Sparkles } from "lucide-react";
import AnalysisForm from "@/components/analysis/AnalysisForm";

const AGENT_BADGES = [
  { icon: Cpu,       label: "Planner Agent",     color: "text-cyan-500",    bg: "bg-cyan-500/10" },
  { icon: Bug,       label: "Bug Detector",       color: "text-rose-500",    bg: "bg-rose-500/10" },
  { icon: Shield,    label: "Security Scanner",   color: "text-orange-500",  bg: "bg-orange-500/10" },
  { icon: Zap,       label: "Performance Agent",  color: "text-amber-500",   bg: "bg-amber-500/10" },
  { icon: Sparkles,  label: "Fix Synthesizer",    color: "text-violet-500",  bg: "bg-violet-500/10" },
];

export default function AnalyzePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h1 className="font-display text-3xl font-bold">
          Analyze <span className="gradient-text">Your Code</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Submit a GitHub repository URL or paste a snippet. Five AI agents will analyze it in
          parallel and deliver a scored, actionable report.
        </p>

        {/* Agent pipeline pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {AGENT_BADGES.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-transparent ${a.bg} ${a.color}`}
            >
              <a.icon size={12} />
              {a.label}
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-pulse-slow" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <AnalysisForm />
      </motion.div>
    </div>
  );
}
