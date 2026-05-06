import { useEffect, useState } from "react";
import { Utensils, Bed, Sparkles, Train } from "lucide-react";

type RecType = "food" | "hotels" | "experiences" | "transport";

interface Place {
  name?: string;
  address?: string;
  image?: string;
  title?: string;
  description?: string;
  estimated_cost?: string;
  icon?: string;
}

const TAB_META: Record<RecType, { icon: React.ElementType; label: string; color: string }> = {
  food: { icon: Utensils, label: "Food", color: "from-orange-500/20 to-transparent border-orange-500/20 text-orange-400" },
  hotels: { icon: Bed, label: "Hotels", color: "from-cyan-500/20   to-transparent border-cyan-500/20   text-cyan-400" },
  experiences: { icon: Sparkles, label: "Experiences", color: "from-purple-500/20 to-transparent border-purple-500/20 text-purple-400" },
  transport: { icon: Train, label: "Transport", color: "from-blue-500/20 to-transparent border-blue-500/20 text-blue-400" },
};

interface Props {
  city?: string;
}

export function AIRecommendationsSection({ city = "Morocco" }: Props) {
  const [activeTab, setActiveTab] = useState<RecType>("food");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have a recognized city that isn't the generic fallback
    if (!city || city === "Morocco") return;
    
    let alive = true;
    setLoading(true);
    setError(null);

    // Using fetch directly as requested for this component's specific sidebar logic
    fetch(`http://localhost:8001/places/search?city=${city}&type=${activeTab}`)
      .then(res => res.json())
      .then(data => {
        if (!alive) return;
        if (Array.isArray(data) && data.length > 0) {
          setPlaces(data);
        } else {
          setPlaces([]);
          setError(`No ${activeTab} found in ${city}.`);
        }
      })
      .catch(() => {
        if (!alive) return;
        setPlaces([]);
        setError("Recommendations temporarily unavailable.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [city, activeTab]);

  return (
    <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-600/10 rounded-full blur-3xl" />

      {/* ── Header ── */}
      <div className="mb-6">
        <h2 className="font-bold text-white text-2xl leading-tight mb-2">
          Smart Recommendations
        </h2>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-col gap-2 mb-8">
        {(["food", "hotels", "experiences", "transport"] as RecType[]).map((tab) => {
          const m = TAB_META[tab];
          const Icon = m.icon;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-2.5 font-medium text-sm transition-all duration-300 ease-out
                ${isActive
                  ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] rounded-xl"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Cards ── */}
      <div className="flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl animate-pulse min-h-[100px]" />
          ))
        ) : error ? (
          <div className="text-slate-400 text-sm text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
            <p className="text-2xl mb-2 opacity-50">📍</p>
            {error}
          </div>
        ) : (
          places.slice(0, 3).map((place, i) => {
            const m = TAB_META[activeTab];
            const Icon = m.icon;
            const isTransport = activeTab === "transport";
            
            const displayTitle = place.title || place.name;
            const displayDesc = place.description || place.address;
            
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl bg-slate-900/40 border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${m.color}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={place.image || '/images/placeholder-city.jpg'}
                    alt={displayTitle}
                    className="w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder-city.jpg' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                </div>

                <div className="relative z-10 p-5 h-full flex flex-col justify-end">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-white/10 p-2 rounded-lg shadow-sm border border-white/5">
                      <Icon className="w-5 h-5 text-current" />
                    </div>
                    {isTransport && place.estimated_cost && (
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-[10px] font-bold tracking-wider text-green-400 uppercase">{place.estimated_cost}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{displayTitle}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{displayDesc}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

  );
}
