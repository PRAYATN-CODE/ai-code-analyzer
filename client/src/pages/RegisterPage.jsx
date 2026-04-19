import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Mail, Lock, User, Code2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { registerUser, selectAuth } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(selectAuth);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (form.password.length < 8) errs.password = "Minimum 8 characters";
    if (!/[A-Z]/.test(form.password)) errs.password = "Must include uppercase letter";
    if (!/\d/.test(form.password)) errs.password = "Must include a number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(registerUser(form));
    if (result.meta.requestStatus === "fulfilled") navigate("/dashboard");
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Code2 size={15} className="text-primary" />
          </div>
          <span className="font-display font-bold gradient-text">CodeSense AI</span>
        </Link>

        <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Already have one?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            icon={User}
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
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
                onChange={set("password")}
                placeholder="Minimum 8 characters"
                required
                className="w-full h-10 pl-9 pr-10 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}

            {/* Password strength hints */}
            <div className="flex gap-3 mt-1">
              {[
                { label: "8+ chars", pass: form.password.length >= 8 },
                { label: "Uppercase", pass: /[A-Z]/.test(form.password) },
                { label: "Number", pass: /\d/.test(form.password) },
              ].map((h) => (
                <span key={h.label} className={`text-xs font-medium transition-colors ${h.pass ? "text-emerald-500" : "text-muted-foreground/50"}`}>
                  {h.pass ? "✓ " : "○ "}{h.label}
                </span>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full gap-2 h-11">
            Create account
            {!loading && <ArrowRight size={16} />}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
