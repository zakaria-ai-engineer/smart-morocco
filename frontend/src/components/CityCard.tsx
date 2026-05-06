import { useState } from "react";
import type { City } from "../types";
import SafeImage from "./SafeImage";

const BACKEND = "http://localhost:8001";
const FALLBACK = `${BACKEND}/static/images/default.jpg`;

function imgSrc(city: City): string {
  if (city.image && /^https?:\/\//i.test(city.image)) return city.image;
  const slug = city.slug === "marrakech" ? "marrrakech" : city.slug;
  return `${BACKEND}/static/images/${slug}.jpg`;
}

interface Props {
  city: City;
  onClick?: () => void;
}

export function CityCard({ city, onClick }: Props) {
  const [ready, setReady] = useState(false);

  return (
    <article
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5] bg-[#0B1C2C]"
      style={{
        transition: "transform 0.4s cubic-bezier(.4,0,.2,1), box-shadow 0.4s",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "scale(1.025)";
        el.style.boxShadow = "0 20px 60px rgba(0,0,0,0.55), 0 0 30px rgba(212,175,55,0.12)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "scale(1)";
        el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
      }}
    >
      {/* Skeleton while loading */}
      {!ready && <div className="absolute inset-0 skeleton z-10 rounded-2xl" />}

      {/* Image */}
      <SafeImage
        src={imgSrc(city)}
        alt={city.name}
        loading="lazy"
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

      {/* Region badge */}
      {city.region && (
        <div className="absolute top-4 left-4 z-10">
          <span className="glass text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {city.region}
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 w-full p-5 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
        {city.category && city.category !== "city" && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
            {city.category}
          </p>
        )}
        <h3 className="text-xl font-extrabold text-white leading-tight">{city.name}</h3>
        <p className="text-xs text-white/55 mt-1 line-clamp-2 max-h-0 group-hover:max-h-12 overflow-hidden transition-all duration-500">
          {city.description || `Discover the beauty of ${city.name}`}
        </p>
      </div>
    </article>
  );
}
