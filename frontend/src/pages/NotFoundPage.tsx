import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-card dark:bg-slate-900">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">404</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">The page you requested does not exist.</p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-xl bg-brand-primary px-5 py-2 font-semibold text-white shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:brightness-110"
      >
        Go Home
      </Link>
    </div>
  );
}
