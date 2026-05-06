import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Reveal } from "../components/Reveal";
import { SkeletonCard } from "../components/SkeletonCard";

export function CitiesPage() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch all 20 cities from the media collection
    axios.get("http://localhost:8001/media")
      .then(res => setMediaItems(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return mediaItems.filter((item) => {
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.tags?.some((t: string) => t.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [mediaItems, search]);

  return (
    <div className="min-h-screen bg-[#060b18] text-white">
      {/* ── Minimalist Header ── */}
      <header className="relative pt-32 pb-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 text-left">
            Moroccan Cities
          </h1>

          {/* ── Simple Glassmorphism Search Bar ── */}
          <div className="relative w-full max-w-2xl">
            <svg
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              id="cities-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-14 pr-5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 backdrop-blur-md"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24 space-y-12">
        {/* ── City Grid ── */}
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length > 0 ? (
              filtered.map((item, index) => (
                <div key={item.id || index} className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5] bg-[#0B1C2C] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all">
                  <img
                    src={`http://localhost:8001${item.url}`}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                  <div className="absolute bottom-0 left-0 w-full p-5 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
                    <h3 className="text-xl font-extrabold text-white leading-tight">
                      {item.title?.replace(" Landscapes", "")}
                    </h3>
                    <p className="text-xs text-white/55 mt-1 line-clamp-2 max-h-0 group-hover:max-h-12 overflow-hidden transition-all duration-500">
                      Explore {item.category}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/3 p-16 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-white text-lg font-bold mb-2">No cities found</p>
                <p className="text-slate-500 text-sm mb-6">
                  Try a different search term.
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-semibold px-6 py-2.5 hover:bg-red-600/30 transition"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </Reveal>

      </main>
    </div>
  );
}
