import { motion } from "framer-motion";
import { FallbackImage } from "./FallbackImage";

type ShowcaseTrip = {
  title: string;
  city: string;
  price: number;
  duration: number;
  tags: string[];
  description: string;
  image?: string | null;
  onSelect: () => void;
};

export function TripShowcaseCard({ trip }: { trip: ShowcaseTrip }) {
  return (
    <motion.button
      type="button"
      onClick={trip.onSelect}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl bg-[#111827] text-left shadow-lg border border-white/5 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-glow/20 w-full"
    >
      {/* Image wrapper */}
      <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
        <FallbackImage
          src={trip.image ?? undefined}
          fallbackSrc="/static/images/default.jpg"
          alt={trip.title}
          loading="lazy"
          className="h-56 w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />

        {/* Price & duration badges */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-md bg-brand-primary/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm border border-brand-primary/50">
            {trip.price} MAD
          </span>
          <span className="rounded-md bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10">
            {trip.duration}d
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-brand-accent transition-colors duration-300">{trip.title}</h3>
        <p className="mt-1 text-sm text-gray-400">{trip.city}</p>
        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{trip.description}</p>

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

        <div className="mt-6 flex items-center justify-between">

          <span className="rounded-full bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-2 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,122,0,0.4)]">
            Plan Trip →
          </span>
        </div>
      </div>
    </motion.button>
  );
}
