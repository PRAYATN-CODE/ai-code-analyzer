import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated logo mark */}
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-xl bg-primary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-2 rounded-lg bg-card border border-border flex items-center justify-center">
            <span className="text-primary font-mono font-bold text-xl">{"<>"}</span>
          </div>
        </div>

        {/* Shimmer bar */}
        <div className="w-40 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full w-1/3 bg-primary rounded-full"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <p className="text-muted-foreground text-sm font-mono">Initializing...</p>
      </motion.div>
    </div>
  );
}
