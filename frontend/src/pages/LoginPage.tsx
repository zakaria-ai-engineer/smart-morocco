import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleBlur = (field: "email" | "password") => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === "email") setEmailError(validateEmail(email));
    if (field === "password") setPasswordError(validatePassword(password));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passErr);
    setTouched({ email: true, password: true });
    if (emailErr || passErr) return;

    setLoading(true);
    setServerError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setServerError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="relative overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Gradient accent strip */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-600" />

          <div className="pb-2 pt-2">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 shadow-lg shadow-rose-500/30">
                <span className="text-2xl">🇲🇦</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Sign in to continue your Morocco journey
              </p>
            </div>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  key="server-error"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5 flex items-center gap-2.5 overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-400"
                >
                  <span className="shrink-0 text-base">⚠️</span>
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) setEmailError(validateEmail(e.target.value));
                    }}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    className={`w-full bg-transparent rounded-xl border py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 dark:text-white dark:placeholder-slate-500 ${emailError && touched.email
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30 dark:border-red-500"
                      : "border-slate-300 focus:border-red-500 focus:ring-red-500/20 dark:border-white/20 dark:focus:border-red-500"
                      }`}
                  />
                </div>
                <AnimatePresence>
                  {emailError && touched.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) setPasswordError(validatePassword(e.target.value));
                    }}
                    onBlur={() => handleBlur("password")}
                    placeholder="Min. 8 characters"
                    className={`w-full bg-transparent rounded-xl border py-3 pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 dark:text-white dark:placeholder-slate-500 ${passwordError && touched.password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30 dark:border-red-500"
                      : "border-slate-300 focus:border-red-500 focus:ring-red-500/20 dark:border-white/20 dark:focus:border-red-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordError && touched.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-200 hover:shadow-red-500/50 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Create one for free →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          By continuing, you agree to our{" "}
          <span className="underline-offset-2 hover:underline cursor-pointer">Terms of Service</span>{" "}
          and{" "}
          <span className="underline-offset-2 hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
