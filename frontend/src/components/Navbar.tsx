import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, Globe, Heart } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { useFavorites } from "../context/FavoritesContext";

/* ─── Nav links ─────────────────────────────────────────────────── */
const LINKS = [
  { to: "/", key: "home", end: true },
  { to: "/cities", key: "destinations", end: false },
  { to: "/trips", key: "tours", end: false },
  { to: "/plan-trip", key: "planTrip", end: false },
  { to: "/travel-friends", key: "friends", fallback: "Friends", end: false },
  { to: "/about", key: "about", end: false },
];

function initials(user: { full_name?: string | null; email: string }) {
  if (user.full_name) {
    return user.full_name.split(" ").filter(Boolean).slice(0, 2)
      .map((w) => w[0].toUpperCase()).join("");
  }
  return user.email[0].toUpperCase();
}

/* ════════════════════════════════════════════════════════════════ */
export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { favorites } = useFavorites();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [langMenu, setLangMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });

    // Initialize dark mode state
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemDark);
    setIsDark(isDarkTheme);
    if (isDarkTheme) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
    setLangMenu(false);
  }, [location]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setUserMenu(false);
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangMenu(false);
    };
    if (userMenu || langMenu) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [userMenu, langMenu]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLanguageChange = (lang: 'EN' | 'FR' | 'AR') => {
    setLanguage(lang);
    setLangMenu(false);
  };

  /* On hero (top) = transparent white text; scrolled = dark bg */
  const isHero = !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[200] transition-all duration-400 ${scrolled
        ? "bg-[#060b18]/95 backdrop-blur-xl shadow-lg border-b border-white/5"
        : "bg-transparent"
        }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 lg:px-10 h-[68px]">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-black tracking-tighter">
            <span className="text-green-500">Travel</span>{" "}
            <span className="text-red-500">Morocco</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((link) => {
            const labelStr = t(link.key);
            const displayLabel = labelStr === link.key && link.fallback ? link.fallback : labelStr;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200
                   ${isActive
                    ? "text-red-500"
                    : "text-white/70 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {displayLabel}
                    <span className={`
                      absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-red-600
                      transition-all duration-300
                      ${isActive ? "w-4/5 opacity-100" : "w-0 opacity-0"}
                    `} />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Favorites Badge */}
          <Link
            to="/favorites"
            className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 border group ${isHero
              ? "border-white/30 text-white hover:bg-white/10"
              : "border-white/10 text-white/80 hover:bg-white/10"
              }`}
            title="Favorites"
          >
            <Heart className={`w-5 h-5 transition-colors ${favorites.length > 0 ? "text-red-500 fill-red-500/20" : ""}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#060b18]">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenu(!langMenu)}
              className={`flex items-center justify-center gap-1.5 px-2 w-14 h-9 rounded-full transition-all duration-200 border group ${isHero
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-white/10 text-white/80 hover:bg-white/10"
                }`}
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold">{language}</span>
            </button>

            <AnimatePresence>
              {langMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-32 rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl py-2 z-50"
                >
                  {(['EN', 'FR', 'AR'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${language === lang
                        ? "bg-red-500/10 text-red-400"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      {lang === 'EN' ? 'English' : lang === 'FR' ? 'Français' : 'العربية'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 border group ${isHero
              ? "border-white/30 text-white hover:bg-white/10"
              : "border-white/10 text-white/80 hover:bg-white/10"
              }`}
            title="Toggle Dark Mode"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                id="user-menu-button"
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200 border ${isHero
                  ? "border-white/30 hover:bg-white/10 text-white"
                  : "border-white/10 text-white/80 hover:bg-white/5"
                  }`}
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-black">
                  {initials(user)}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user.full_name?.split(" ")[0] ?? user.email.split("@")[0]}
                </span>
                <svg
                  className={`w-3 h-3 opacity-50 transition-transform duration-200 ${userMenu ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    key="user-dd"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white overflow-hidden shadow-xl ring-1 ring-gray-100"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      {user.full_name && (
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.full_name}</p>
                      )}
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-gray-50 transition-all duration-150">
                        <span>👤</span> My Account
                      </Link>
                      <Link to="/favorites" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-gray-50 transition-all duration-150">
                        <span>❤️</span> Favourites
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                      >
                        <span>🚪</span> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${isHero ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-gray-100"
                  }`}
              >
                Log in
              </Link>
              <Link to="/register" className="bg-red-600 hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all text-white px-5 py-2 text-sm rounded-full">
                Get started
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className={`lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl transition ${isHero ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
          >
            <span className={`block w-5 h-[1.5px] rounded transition-all duration-300 ${isHero ? "bg-white" : "bg-slate-700"} ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] rounded transition-all duration-300 ${isHero ? "bg-white" : "bg-slate-700"} ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] rounded transition-all duration-300 ${isHero ? "bg-white" : "bg-slate-700"} ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="bg-[#0f172a]/95 backdrop-blur-xl mx-4 mb-3 rounded-2xl p-3 space-y-0.5 shadow-xl border border-white/10">
              {LINKS.map((link) => {
                const labelStr = t(link.key);
                const displayLabel = labelStr === link.key && link.fallback ? link.fallback : labelStr;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                       ${isActive ? "bg-red-500/10 text-red-500" : "text-white/80 hover:text-white hover:bg-white/5"}`
                    }
                  >
                    {displayLabel}
                  </NavLink>
                );
              })}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-white/10 flex gap-2">
                  <Link to="/login" className="flex-1 py-2.5 text-sm text-center text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition">Log in</Link>
                  <Link to="/register" className="flex-1 py-2.5 text-sm text-center bg-red-600 hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all text-white rounded-xl">Get started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
