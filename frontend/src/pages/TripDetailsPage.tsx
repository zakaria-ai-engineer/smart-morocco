import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SectionTitle } from "../components/SectionTitle";
import { WeatherWidget } from "../components/WeatherWidget";
import { useAppData } from "../context/AppDataContext";
import { MapboxMap, MarkerData } from "../components/MapboxMap";
import { getCityPlaces, getAIRecommendations, Place, AIRecommendation } from "../services/placesService";
import { getWeatherByCity, WeatherData } from "../services/weatherService";
import SafeImage from "../components/SafeImage";

type LatLng = { lat: number; lng: number };
const CITY_COORDS: Record<string, LatLng> = {
  marrakech: { lat: 31.6295, lng: -7.9811 },
  chefchaouen: { lat: 35.1714, lng: -5.2697 },
  merzouga: { lat: 31.0994, lng: -4.0127 },
  agadir: { lat: 30.4278, lng: -9.5981 },
  fes: { lat: 34.0181, lng: -5.0078 },
  tangier: { lat: 35.7595, lng: -5.8340 },
  essaouira: { lat: 31.5085, lng: -9.7595 },
  ouarzazate: { lat: 30.9335, lng: -6.9370 },
};

export function TripDetailsPage() {

  const { id } = useParams();
  const { trips } = useAppData();
  const trip = trips.find((item) => item.id === id);

  const cityKey = trip?.city?.toLowerCase() ?? "";
  const initialCenter = useMemo<LatLng>(() => CITY_COORDS[cityKey] ?? CITY_COORDS.marrakech, [cityKey]);
  const [mapCenter, setMapCenter] = useState<LatLng>(initialCenter);

  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);

  const [aiType, setAiType] = useState("food");
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);


  useEffect(() => {
    if (!trip?.city) return;
    setMapCenter(CITY_COORDS[cityKey] ?? CITY_COORDS.marrakech);

    // Single request → hotels + restaurants + activities
    getCityPlaces(trip.city)
      .then(({ hotels, restaurants, activities }) => {
        const mixed = [
          ...restaurants.slice(0, 2),
          ...hotels.slice(0, 2),
          ...activities.slice(0, 2),
        ];
        setPlaces(mixed);
        setPlacesLoading(false);
      })
      .catch(() => {
        setPlaces([]);
        setPlacesLoading(false);
      });
  }, [trip?.city, cityKey]);

  useEffect(() => {
    if (!trip) return;
    setAiLoading(true);
    getAIRecommendations(trip?.city ?? "Marrakech", aiType).then((res) => {
      setAiRecs(res ?? []);
      setAiLoading(false);
    }).catch(() => {
      setAiRecs([]);
      setAiLoading(false);
    });
  }, [trip, aiType]);

  useEffect(() => {


    if (!trip?.city) return;

    if (!import.meta.env.VITE_WEATHER_API_KEY) {
      console.warn("⚠️ Weather API key missing in environment variables (VITE_WEATHER_API_KEY)");
    }


    setWeatherLoading(true);
    getWeatherByCity(trip.city).then((data) => {

      setWeatherData(data);
      setWeatherLoading(false);
    }).catch((err) => {
      console.error("Weather fetch error:", err);
      setWeatherData(null);
      setWeatherLoading(false);
    });
  }, [trip?.city]);


  const markers: MarkerData[] = (places || []).map((p) => ({
    id: p?.id ?? Math.random().toString(),
    lat: p?.coordinates?.lat ?? 0,
    lng: p?.coordinates?.lng ?? 0,
    title: p?.name ?? "Unknown",
    color: p?.category?.toLowerCase()?.includes("hotel") ? "#D4AF37" : p?.category?.toLowerCase()?.includes("restaurant") ? "#C1272D" : "#0B1C2C"
  }));

  // Add the city center marker
  if (trip) {
    markers.push({ id: "center", lat: initialCenter.lat, lng: initialCenter.lng, title: trip.city, color: "#2563EB" });
  }

  const handlePlaceClick = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  return (
    <section className="space-y-8 pb-12">

      <SectionTitle title={trip?.title ?? "Unknown Trip"} subtitle={`${trip?.city ?? "Unknown City"} - ${trip?.duration ?? 0} days`} />

      <SafeImage
        src={trip?.image || null}
        alt={trip?.title ?? "Trip"}
        className="h-80 w-full rounded-2xl object-cover shadow-2xl transition-all duration-300 md:h-[420px]"
        loading="lazy"
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* MAIN CONTENT (2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          <article className="space-y-4 rounded-2xl bg-[#131822] p-6 shadow-xl border border-white/5 text-white">
            <h3 className="text-xl font-bold">Description</h3>
            <p className="text-gray-300 leading-relaxed">{trip?.description ?? "No description available."}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {(trip?.tags || []).map((tag) => (
                <span key={tag} className="rounded-full bg-brand-primary/10 px-4 py-1.5 text-sm font-semibold text-brand-primary border border-brand-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </article>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Top Places Near You</h3>
            {placesLoading ? (
              <div className="h-32 flex items-center justify-center rounded-2xl bg-[#131822] border border-white/5">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-brand-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {places?.length > 0 ? (
                  places.map((place, i) => (
                    <article
                      key={place?.name ?? i}
                      onClick={() => handlePlaceClick(place?.coordinates?.lat ?? 0, place?.coordinates?.lng ?? 0)}
                      className="cursor-pointer group rounded-xl border border-white/5 bg-[#131822] overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:scale-[1.02] hover:border-brand-primary/30"
                    >
                      <SafeImage src={place?.image ?? null} alt={place?.name ?? "Place"} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">{place?.category ?? "Unknown"}</p>
                            <h4 className="mt-1 font-bold text-white group-hover:text-brand-primary transition-colors">{place?.name ?? "Unnamed"}</h4>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-400 line-clamp-2">{place?.description ?? place?.address ?? "No description available"}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="text-gray-400">No places found</p>
                )}
              </div>
            )}
          </div>

          <div className="pt-6">
            <h3 className="text-2xl font-bold text-white mb-4">✨ AI Travel Guide</h3>
            <div className="bg-[#131822] border border-white/5 rounded-3xl p-6 shadow-2xl h-[600px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-primary/10 to-transparent pointer-events-none" />

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar z-10">
                {/* AI Welcome Message */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E53935] to-[#EF5350] flex items-center justify-center shadow-[0_0_15px_rgba(229,57,53,0.4)] shrink-0">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-md backdrop-blur-sm">
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Hi! I'm your luxury travel assistant for {trip?.city ?? "Morocco"}. I've curated some exclusive recommendations for you. What would you like to explore?
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["food", "hotel", "experience", "cities"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setAiType(t)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${aiType === t
                            ? "bg-brand-primary text-white shadow-lg"
                            : "bg-black/30 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User Request */}
                <div className="flex items-start gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white text-lg">👤</span>
                  </div>
                  <div className="bg-brand-primary/20 border border-brand-primary/30 rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-md backdrop-blur-sm">
                    <p className="text-white text-sm">
                      Show me the best <span className="font-bold text-[#EF5350]">{aiType}</span> spots.
                    </p>
                  </div>
                </div>

                {/* AI Response with Cards */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E53935] to-[#EF5350] flex items-center justify-center shadow-[0_0_15px_rgba(229,57,53,0.4)] shrink-0">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <div className="flex-1 max-w-[90%]">
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 shadow-md backdrop-blur-sm mb-4">
                      {aiLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-brand-primary" />
                          <p className="text-sm text-gray-400">Curating the finest {aiType} experiences...</p>
                        </div>
                      ) : (!aiRecs || aiRecs.length === 0) ? (
                        <p className="text-sm text-gray-400">I couldn't find any exclusive {aiType} recommendations right now.</p>
                      ) : (
                        <p className="text-sm text-gray-200">Here are my top picks for {aiType} in {trip?.city ?? "the area"}:</p>
                      )}
                    </div>

                    {/* Cards Container inside chat */}
                    {!aiLoading && aiRecs && aiRecs.length > 0 && (
                      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
                        {aiRecs.map((rec, i) => (
                          <article
                            key={i}
                            className="snap-start shrink-0 w-[260px] group rounded-2xl bg-[#0B0E14] p-3 shadow-lg border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(229,57,53,0.15)] hover:border-brand-primary/30 flex flex-col"
                          >
                            <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 shrink-0">
                              <SafeImage src={rec?.image ?? null} alt={rec?.name ?? "Recommendation"} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14]/80 to-transparent" />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <h4 className="font-bold text-white text-sm leading-tight group-hover:text-brand-primary transition-colors">{rec?.name ?? "Amazing Spot"}</h4>
                              <p className="mt-1 text-xs text-gray-400 leading-relaxed line-clamp-2">
                                {rec?.description ?? "A beautiful place to explore."}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestion Chips */}
              <div className="flex gap-2 overflow-x-auto py-3 hide-scrollbar mt-2 z-10">
                {["Best places", "7-day itinerary", "Top beaches", "Local food guide"].map(chip => (
                  <button key={chip} className="whitespace-nowrap bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-gray-300 transition-colors">
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input field */}
              <div className="relative mt-1 z-10">
                <input type="text" placeholder="Ask your AI assistant..." className="w-full bg-[#0B0E14] border border-white/10 rounded-full py-3.5 pl-5 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-inner" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center hover:scale-105 hover:shadow-[0_0_15px_rgba(229,57,53,0.5)] transition-all shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR (1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          <aside className="rounded-2xl bg-[#131822] border border-white/5 p-6 shadow-xl text-white">
            <h3 className="text-xl font-bold">Trip info</h3>
            <ul className="mt-4 space-y-3 font-medium">
              <li className="flex justify-between items-center bg-[#0B0E14] px-4 py-3 rounded-xl border border-white/5">
                <span className="text-gray-400">Price</span> <span className="text-brand-primary font-bold">{trip?.price ?? 0} MAD</span>
              </li>
              <li className="flex justify-between items-center bg-[#0B0E14] px-4 py-3 rounded-xl border border-white/5">
                <span className="text-gray-400">Duration</span> <span className="text-white">{trip?.duration ?? 0} days</span>
              </li>
              <li className="flex justify-between items-center bg-[#0B0E14] px-4 py-3 rounded-xl border border-white/5">
                <span className="text-gray-400">City</span> <span className="text-white">{trip?.city ?? "Unknown"}</span>
              </li>
            </ul>
          </aside>

          <aside className="rounded-2xl bg-[#131822] border border-white/5 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Current Weather</h3>
            <WeatherWidget city={trip?.city ?? "Marrakech"} />
          </aside>

          <aside className="rounded-2xl bg-[#131822] border border-white/5 p-6 shadow-xl flex flex-col h-[500px]">
            <h3 className="text-lg font-bold text-white mb-4 shrink-0">Location Map</h3>
            <div className="w-full flex-1 rounded-xl overflow-hidden ring-1 ring-white/5">
              <MapboxMap center={mapCenter} zoom={13} markers={markers} />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
