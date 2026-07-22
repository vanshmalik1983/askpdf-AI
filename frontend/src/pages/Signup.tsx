import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle, Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AuthSidePanel } from "@/components/AuthSidePanel";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasMinLength || !hasNumber) {
      setError("Password must be at least 8 characters and include a number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-sm"
        >
          <Link to="/">
            <Logo />
          </Link>

          <h1 className="mt-10 font-display text-[28px] font-medium text-ink">Create your account</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Free to try. Upload your first PDF in under a minute.</p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-danger-soft px-3.5 py-3 text-sm text-danger">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="name" className="field-label">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                maxLength={60}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2.5 flex gap-4">
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      hasMinLength ? "text-verified" : "text-ink-faint"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                    8+ characters
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      hasNumber ? "text-verified" : "text-ink-faint"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                    One number
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
              {isSubmitting ? "Creating account…" : "Create account"}
              {!isSubmitting && <ArrowRight size={16} strokeWidth={2.5} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-cobalt hover:text-cobalt-dark">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      <AuthSidePanel />
    </div>
  );
}
