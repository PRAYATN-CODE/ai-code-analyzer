import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Code2 } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="font-mono text-8xl font-bold gradient-text">404</div>
        <div>
          <h1 className="font-display text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            The route you're looking for doesn't exist.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent transition-all"
          >
            <ArrowLeft size={15} /> Home
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Code2 size={15} /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
