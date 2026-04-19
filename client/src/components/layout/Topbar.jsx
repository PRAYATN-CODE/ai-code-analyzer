import { useSelector, useDispatch } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { Menu, Sun, Moon, Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toggleTheme, selectTheme } from "@/store/slices/themeSlice";
import { selectUser } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

const BREADCRUMBS = {
  "/dashboard":    ["Dashboard"],
  "/analyze":      ["Analyze Code"],
  "/repositories": ["Repositories"],
};

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const user = useSelector(selectUser);
  const { pathname } = useLocation();

  const isReport = pathname.startsWith("/report/");
  const crumbs = BREADCRUMBS[pathname] || (isReport ? ["Reports", "View Report"] : ["Page"]);

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-xl flex items-center justify-between px-5 gap-4 flex-shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Menu size={17} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted-foreground/40">/</span>}
              <span className={cn(i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground")}>
                {c}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => dispatch(toggleTheme())}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </motion.div>
        </motion.button>

        {/* User chip */}
        <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary text-xs font-bold font-mono">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground/80 max-w-[120px] truncate">
            {user?.name || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
