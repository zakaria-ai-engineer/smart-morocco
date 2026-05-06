import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import type { Trip } from "../types";
import { FallbackImage } from "./FallbackImage";

export function TripCard({ trip }: { trip: Trip }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(trip.id);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-[#111827] border border-white/5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-glow/20">
      {/* Image wrapper — fixed height, zoom on hover */}
      <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
        <FallbackImage
          src={trip.image ?? undefined}
          fallbackSrc="/static/images/default.jpg"
          alt={trip.title}
          className="h-56 w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-md bg-brand-primary/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm border border-brand-primary/50">
            {trip.price} MAD
          </span>
          <span className="rounded-md bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
            {trip.duration}d
          </span>
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={() => void toggleFavorite(trip)}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/40 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/10 border border-white/10"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span className={`text-lg ${favorite ? "text-brand-primary drop-shadow-[0_0_8px_rgba(255,122,0,0.8)]" : "text-white"}`}>♥</span>
        </button>
      </div>

      {/* Card body */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-brand-accent transition-colors duration-300">{trip.title}</h3>
        <p className="mt-1 text-sm text-gray-400">{trip.city}</p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {trip.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          to={`/trips/${trip.id}`}
          className="mt-6 block w-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent py-3 text-center text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,122,0,0.4)]"
        >
          View Trip
        </Link>
      </div>
    </article>
  );
}
