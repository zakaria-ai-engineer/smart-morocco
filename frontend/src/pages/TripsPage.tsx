import { useMemo, useState, useEffect } from "react";
import { tours as localTours } from "../data/tours";
import { Reveal } from "../components/Reveal";
import { SkeletonCard } from "../components/SkeletonCard";
import { TourCard } from "../components/TourCard";
import { useAppData } from "../context/AppDataContext";
import { getPlacesSearch, Place } from "../services/placesService";
import type { TripTag } from "../types";

const TAG_FILTERS: Array<TripTag | "all"> = ["all", "beach", "desert", "culture", "nature"];

const TAG_ICONS: Record<string, string> = {
  all: "🗺️",
  beach: "🏖️",
  desert: "🐪",
  culture: "🕌",
  nature: "🌿",
};

export function TripsPage() {
  const { trips, loadingTrips } = useAppData();

  // Search and UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<TripTag | "all">("all");
  const [maxBudget, setMaxBudget] = useState(10000);

  // API Logic State
  const [apiResults, setApiResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Trigger Foursquare Search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setApiResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getPlacesSearch(searchQuery, "attractions");
        setApiResults(results || []);
      } catch (err) {
        console.error("Search API failed:", err);
        setApiResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#060b18] text-white">

      {/* ── Minimalist Header ── */}
      <header className="relative pt-32 pb-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 text-left">
            Moroccan Tours
          </h1>

          {/* ── Search Bar ── */}
          <div className="relative w-full max-w-2xl">
            <svg
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city (e.g. Marrakech, Tangier)..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-14 pr-5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 backdrop-blur-md shadow-2xl"
            />
            {isSearching && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-red-500" />
              </div>
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24 space-y-12">

        {/* ── Results Grid ── */}
        <Reveal>
          <div className="space-y-12">

            {/* 1. Show API Search Results if user is searching */}
            {searchQuery && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">Discoveries in "{searchQuery}"</h2>
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-medium text-green-500/80 uppercase tracking-widest">Powered by Foursquare</span>
                </div>

                {isSearching ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : apiResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {apiResults.map((place) => (
                      <TourCard
                        key={place.id}
                        tour={{
                          id: place.id,
                          title: place.name,
                          imageUrl: place.image,
                          city: searchQuery,
                          category: place.category,
                          description: place.description,
                          price: "Explore",
                          duration: "Varies",
                          rating: place.rating
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No specific landmarks found. Try another city or explore our curated tours below.</p>
                )}
              </div>
            )}

            {/* 2. Featured Experiences (Curated Fallback) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{searchQuery ? "More Recommendations" : "Featured Experiences"}</h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {localTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            </div>

          </div>
        </Reveal>
      </main>
    </div>
  );
}
