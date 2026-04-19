import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Code2, FolderGit2, ChevronLeft,
  LogOut, User, Zap, Shield, Bug, Sparkles
} from "lucide-react";
import { logout, selectUser } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analyze",      icon: Code2,           label: "Analyze Code" },
  { to: "/repositories", icon: FolderGit2,      label: "Repositories" },
];

const agentItems = [
  { icon: Bug,       label: "Bug Detection",  color: "text-rose-500" },
  { icon: Shield,    label: "Security Scan",  color: "text-orange-500" },
  { icon: Zap,       label: "Performance",    color: "text-amber-500" },
  { icon: Sparkles,  label: "Fix Synthesis",  color: "text-violet-500" },
];

export default function Sidebar({ open, onToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: open ? 256 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full border-r border-border bg-card z-20 overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Code2 size={16} className="text-primary" />
              </div>
              <span className="font-display font-bold text-base gradient-text whitespace-nowrap">
                CodeSense
              </span>
            </motion.div>
          )}
          {!open && (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center"
            >
              <Code2 size={16} className="text-primary" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
        >
          <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={15} />
          </motion.div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {/* Main nav items */}
        <div className="space-y-0.5">
          {open && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 pb-1.5">
              Navigation
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={cn("flex-shrink-0", isActive && "text-primary")} />
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Agent pipeline indicators */}
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t border-border"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 pb-2">
              AI Agents
            </p>
            <div className="space-y-0.5">
              {agentItems.map((ag) => (
                <div
                  key={ag.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground"
                >
                  <ag.icon size={14} className={cn("flex-shrink-0", ag.color)} />
                  <span className="whitespace-nowrap">{ag.label}</span>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse-slow" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <User size={15} className="text-primary" />
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {open && (
            <button
              onClick={handleLogout}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
