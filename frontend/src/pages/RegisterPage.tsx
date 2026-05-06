import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function validateName(name: string): string | null {
  if (!name.trim()) return "Full name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
}

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

function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return "Please confirm your password.";
  if (confirm !== password) return "Passwords do not match.";
  return null;
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength =
    password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)
      ? 4
      : password.length >= 10 && (/[A-Z]/.test(password) || /[0-9]/.test(password))
        ? 3
        : password.length >= 8
          ? 2
          : 1;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-amber-400", "bg-lime-500", "bg-emerald-500"];
  const textColors = ["", "text-red-600", "text-amber-500", "text-lime-600", "text-emerald-600"];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: level <= strength ? 1 : 0 }}
            transition={{ duration: 0.25, delay: level * 0.05 }}
            style={{ originX: 0 }}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${level <= strength ? colors[strength] : "bg-slate-200 dark:bg-slate-700"}`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [errors, setErrors] = useState({ name: null as string | null, email: null as string | null, password: null as string | null, confirm: null as string | null });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({
      ...e,
      name: field === "name" ? validateName(fullName) : e.name,
      email: field === "email" ? validateEmail(email) : e.email,
      password: field === "password" ? validatePassword(password) : e.password,
      confirm: field === "confirm" ? validateConfirmPassword(password, confirmPassword) : e.confirm,
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nameErr = validateName(fullName);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    setErrors({ name: nameErr, email: emailErr, password: passErr, confirm: confirmErr });
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (nameErr || emailErr || passErr || confirmErr) return;

    setLoading(true);
    setServerError(null);
    try {
      await register(email, password, fullName.trim());
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(
        status === 409
          ? "This email is already registered. Try logging in instead."
          : "Registration failed. Please try again."
      );
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
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 shadow-lg shadow-emerald-500/30">
                <span className="text-2xl">🌍</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create your account
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Join thousands exploring Morocco
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
              {/* Full Name */}
              <div>
                <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (touched.name) setErrors((err) => ({ ...err, name: validateName(e.target.value) }));
                    }}
                    onBlur={() => handleBlur("name")}
                    placeholder="Ahmed El Mansouri"
                    className={`w-full bg-transparent rounded-xl border py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 dark:text-white dark:placeholder-slate-500 ${errors.name && touched.name
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30 dark:border-red-500"
                      : "border-slate-300 focus:border-red-500 focus:ring-red-500/20 dark:border-white/20 dark:focus:border-red-500"
                      }`}
                  />
                </div>
                <AnimatePresence>
                  {errors.name && touched.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) setErrors((err) => ({ ...err, email: validateEmail(e.target.value) }));
                    }}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    className={`w-full bg-transparent rounded-xl border py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 dark:text-white dark:placeholder-slate-500 ${errors.email && touched.email
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30 dark:border-red-500"
                      : "border-slate-300 focus:border-red-500 focus:ring-red-500/20 dark:border-white/20 dark:focus:border-red-500"
                      }`}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && touched.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) setErrors((err) => ({ ...err, password: validatePassword(e.target.value) }));
                      if (touched.confirm) setErrors((err) => ({ ...err, confirm: validateConfirmPassword(e.target.value, confirmPassword) }));
                    }}
                    onBlur={() => handleBlur("password")}
                    placeholder="Min. 8 characters"
                    className={`w-full bg-transparent rounded-xl border py-3 pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 dark:text-white dark:placeholder-slate-500 ${errors.password && touched.password
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
                  {errors.password && touched.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="register-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (touched.confirm) setErrors((err) => ({ ...err, confirm: validateConfirmPassword(password, e.target.value) }));
                    }}
                    onBlur={() => handleBlur("confirm")}
                    placeholder="Repeat your password"
                    className={`w-full bg-transparent rounded-xl border py-3 pl-10 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 dark:text-white dark:placeholder-slate-500 ${errors.confirm && touched.confirm
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30 dark:border-red-500"
                      : "border-slate-300 focus:border-red-500 focus:ring-red-500/20 dark:border-white/20 dark:focus:border-red-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirm && touched.confirm && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      {errors.confirm}
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
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          By creating an account, you agree to our{" "}
          <span className="underline-offset-2 hover:underline cursor-pointer">Terms of Service</span>{" "}
          and{" "}
          <span className="underline-offset-2 hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
  );
}
