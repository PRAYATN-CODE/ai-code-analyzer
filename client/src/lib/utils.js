import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    color: "#F43F5E",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/30",
    ring: "ring-rose-500/20",
  },
  high: {
    label: "High",
    color: "#F97316",
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/30",
    ring: "ring-orange-500/20",
  },
  medium: {
    label: "Medium",
    color: "#F59E0B",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30",
    ring: "ring-amber-500/20",
  },
  low: {
    label: "Low",
    color: "#06B6D4",
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    border: "border-cyan-500/30",
    ring: "ring-cyan-500/20",
  },
  info: {
    label: "Info",
    color: "#8B5CF6",
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/30",
    ring: "ring-violet-500/20",
  },
};

export const CATEGORY_CONFIG = {
  bug: {
    label: "Bug",
    icon: "Bug",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  security: {
    label: "Security",
    icon: "ShieldAlert",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  performance: {
    label: "Performance",
    icon: "Zap",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  "code-quality": {
    label: "Quality",
    icon: "Sparkles",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
};

export const GRADE_CONFIG = {
  A: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Excellent" },
  B: { color: "text-cyan-500",    bg: "bg-cyan-500/10",    label: "Good" },
  C: { color: "text-amber-500",   bg: "bg-amber-500/10",   label: "Fair" },
  D: { color: "text-orange-500",  bg: "bg-orange-500/10",  label: "Poor" },
  F: { color: "text-rose-500",    bg: "bg-rose-500/10",    label: "Critical" },
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
};

export const formatRelative = (dateStr) => {
  if (!dateStr) return "—";
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

export const truncate = (str, max = 40) =>
  str?.length > max ? `${str.slice(0, max)}…` : str;

export const getScoreColor = (score) => {
  if (score >= 90) return "text-emerald-500";
  if (score >= 75) return "text-cyan-500";
  if (score >= 55) return "text-amber-500";
  if (score >= 35) return "text-orange-500";
  return "text-rose-500";
};
