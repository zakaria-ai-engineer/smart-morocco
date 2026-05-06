import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import SafeImage from "./SafeImage";

export function TourCard({ tour }: { tour: any }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(tour?.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removeFavorite(tour?.id);
    else addFavorite(tour?.id);
  };

  const title = tour?.title ?? tour?.name ?? "Unnamed Tour";
  const category = tour?.category ?? tour?.type ?? "Experience";
  const price = tour?.price != null ? tour.price : null;
  const duration = tour?.duration ?? null;
  const location = tour?.city ?? tour?.location ?? tour?.address ?? null;
  const description = tour?.description ?? null;
  const imageUrl = tour?.imageUrl ?? tour?.image ?? null;
  const rating = tour?.rating ?? null;

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-[#0a0f1e]/90 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(220,38,38,0.18)] hover:border-red-500/25 flex flex-col">

      {/* ── Image Block ── */}
      <div className="relative h-56 w-full overflow-hidden rounded-t-3xl flex-shrink-0">
        <SafeImage
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/20 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute left-4 top-4 flex items-center gap-2 z-10">
          {price != null && (
            <span className="rounded-xl bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm border border-red-500/40">
              {price} MAD
            </span>
          )}
          {duration && (
            <span className="rounded-xl bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10">
              {duration}
            </span>
          )}
        </div>

        {/* Rating badge */}
        {rating != null && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-white text-xs font-bold">{Number(rating).toFixed(1)}</span>
          </div>
        )}

        {/* Favorite button */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/40 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/15 border border-white/15"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={favorite ? "#dc2626" : "none"}
            stroke={favorite ? "#dc2626" : "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-5 h-5 transition-all duration-300 ${favorite ? "drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "text-white"}`}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-6 gap-3">
        {/* Category tag */}
        <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors duration-300">
          {title}
        </h3>

        {/* Location */}
        {location && (
          <p className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-red-500 shrink-0">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.429-.24.7-.435.542-.389 1.26-.982 1.97-1.833C14.512 15.34 16 12.943 16 10a6 6 0 10-12 0c0 2.943 1.488 5.34 2.715 6.514.71.851 1.428 1.444 1.97 1.833a9.04 9.04 0 00.7.435 5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{location}</span>
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
            {description}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <Link
          to={`/trips/${tour?.id}`}
          className="mt-2 flex items-center justify-center gap-2 w-full rounded-2xl bg-white/5 border border-white/10 py-3 text-center text-sm font-bold text-white transition-all duration-300 hover:bg-red-600 hover:border-red-500 hover:shadow-[0_0_24px_rgba(220,38,38,0.4)] group/btn"
        >
          <span>View Details</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 -translate-x-0.5 group-hover/btn:translate-x-0.5 transition-transform duration-200">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
