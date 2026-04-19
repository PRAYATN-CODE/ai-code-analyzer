import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Mail, Lock, Code2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginUser, selectAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector(selectAuth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (result.meta.requestStatus === "fulfilled") navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col w-[45%] relative bg-card border-r border-border overflow-hidden">
        <div className="absolute inset-0 bg-dots" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Code2 size={18} className="text-primary" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">CodeSense AI</span>
          </Link>

          <div className="flex-1 flex items-center">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-4xl font-bold leading-tight">
                  Analyze code.<br />
                  <span className="gradient-text">Ship with confidence.</span>
                </h2>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Five AI agents scanning your codebase for bugs, vulnerabilities, and performance issues in seconds.
                </p>
              </motion.div>

              {["Bug Detection Agent", "Security Scanner", "Performance Analyzer", "Fix Synthesizer"].map((agent, i) => (
                <motion.div
                  key={agent}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
                  {agent}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Code2 size={15} className="text-primary" />
            </div>
            <span className="font-display font-bold gradient-text">CodeSense AI</span>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">
            New here?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground/80">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full gap-2 h-11">
              Sign in
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-8">
            By signing in you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> and{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
