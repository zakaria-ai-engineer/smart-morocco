import type { Trip } from "../types";

export function TripMiniCard({ trip }: { trip: Trip }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-slate-900 dark:text-white">{trip.title}</h4>
        <span className="text-sm font-semibold text-brand-primary">{trip.price} MAD</span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{trip.city}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{trip.duration} days</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {trip.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-brand-accent/15 px-2 py-1 text-xs text-slate-800 dark:text-slate-100"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
