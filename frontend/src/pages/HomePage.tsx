import { useEffect, useRef, useState, useMemo } from "react";
import { MessageSquare, Bot, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { MapboxMap, type MarkerData } from "../components/MapboxMap";
import { IMAGES } from "../config/images";
import SafeImage from "../components/SafeImage";
import { WeatherWidget } from "../components/WeatherWidget";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

const DESTINATIONS = [
  { slug: "marrakech", name: "Marrakech", desc: "The Red City's vibrant souks and palaces.", priceFrom: "450 MAD" },
  { slug: "fes", name: "Fes", desc: "Medieval medina and ancient tanneries.", priceFrom: "320 MAD" },
  { slug: "chefchaouen", name: "Chefchaouen", desc: "The famous Blue Pearl of the Rif Mountains.", priceFrom: "280 MAD" },
  { slug: "essaouira", name: "Essaouira", desc: "Windswept Atlantic port and arts haven.", priceFrom: "350 MAD" },
  { slug: "merzouga", name: "Merzouga", desc: "Gateway to the golden Sahara dunes.", priceFrom: "600 MAD" },
  { slug: "agadir", name: "Agadir", desc: "Sun-drenched beaches and modern resort life.", priceFrom: "400 MAD" },
];

/* ── Intersection-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, vis } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function HomePage() {
  const { cities, loadingCities } = useAppData();
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  const markers: MarkerData[] = useMemo(() =>
    cities.map(c => ({ id: c.id, lat: c.coordinates?.lat ?? 31.79, lng: c.coordinates?.lng ?? -7.09, title: c.name, description: c.description ?? "", image: `${API}/static/images/${c.slug}.jpg`, color: "#dc2626" })),
    [cities]);

  // ── NLP parser ──
  const MOROCCAN_CITIES = [
    'marrakech', 'casablanca', 'rabat', 'tangier', 'agadir',
    'fes', 'chefchaouen', 'essaouira', 'merzouga', 'ouarzazate',
    'meknes', 'tetouan', 'dakhla', 'ifrane'
  ];

  interface ParsedTrip { destination: string; days: number; budget: number | null; }

  function parseQuery(text: string): ParsedTrip | null {
    const lower = text.toLowerCase();
    const foundCity = MOROCCAN_CITIES.find(c => lower.includes(c));
    if (!foundCity) return null;
    const destination = foundCity.charAt(0).toUpperCase() + foundCity.slice(1);
    let days = 3;
    const daysMatch = lower.match(/(\d+)\s*day/);
    if (daysMatch) days = parseInt(daysMatch[1]);
    else if (lower.includes('week')) days = 7;
    else if (lower.includes('weekend')) days = 2;
    let budget: number | null = null;
    const budgetMatch = lower.match(/\$?([\d,]+)\s*(mad|usd|\$)?/);
    if (budgetMatch) {
      const raw = parseInt(budgetMatch[1].replace(/,/g, ''));
      if (raw > 10) budget = raw;
    }
    return { destination, days, budget };
  }

  const CHIPS = [
    { label: '🕌 3 days in Marrakech', query: '3 days in Marrakech budget 1000' },
    { label: '🔵 Week in Chefchaouen', query: 'a week in Chefchaouen under 1500' },
    { label: '🐪 Desert adventure', query: '5 days in Merzouga budget 2000' },
    { label: '🌊 Coastal Agadir', query: '4 days Agadir budget 1200' },
  ];

  const handleGenerate = () => {
    setSearchError(null);
    if (!aiQuery.trim()) { navigate('/plan-trip'); return; }
    const parsed = parseQuery(aiQuery.trim());
    if (!parsed) {
      setSearchError('Please specify a Moroccan city (e.g. Marrakech, Fes, Chefchaouen).');
      return;
    }
    navigate('/plan-trip', { state: parsed });
  };

  const imgUrl = (slug: string) => `${API}/static/images/${slug}.jpg`;

  return (
    <div className="w-full bg-slate-950 text-white font-sans overflow-hidden">

      {/* ══════════════════════════════════════════════
          1 ▸ CENTRAL HERO SECTION (No empty voids)
      ══════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[60vh] md:min-h-[75vh] xl:min-h-[85vh] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center" style={{ backgroundImage: `url("${IMAGES.homeHero}")` }}>
        <div className="absolute inset-0 bg-slate-950/50"></div>

        {/* Hero content — centred immediately below navbar */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl">

          <h1 className="leading-tight mb-6">
            <span className="text-white drop-shadow-2xl font-black text-5xl md:text-7xl block">Discover Morocco</span>
            <span className="bg-gradient-to-r from-[#C1272D]/30 to-[#006233]/30 bg-clip-text text-transparent [-webkit-text-stroke:1.5px_white] [text-shadow:0_10px_30px_rgba(0,0,0,0.5)] no-underline font-black text-5xl md:text-7xl block mt-2">Like Never Before</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed mb-12">
            Your intelligent guide to Morocco's hidden gems, luxury riads, and unforgettable desert journeys.
          </p>

          {/* AI Pill Search Bar */}
          <div className={`w-full bg-white/10 backdrop-blur-xl border rounded-full p-2.5 flex items-center shadow-2xl transition-all mb-3 ${searchError ? 'border-[#E63946]/70' : 'border-white/20 focus-within:border-red-500/50'
            }`}>
            <input
              type="text"
              value={aiQuery}
              onChange={e => { setAiQuery(e.target.value); setSearchError(null); }}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder='Try "5 days under 2000 MAD in Marrakech…"'
              className="flex-1 bg-transparent text-white placeholder-slate-400 text-base md:text-lg outline-none px-6 py-3"
            />
            <button
              onClick={handleGenerate}
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02]"
            >
              Plan Your Trip
            </button>
          </div>

          {/* Inline error message */}
          {searchError && (
            <p className="text-[#E63946] text-sm font-semibold text-center mb-2 animate-pulse">
              ⚠️ {searchError}
            </p>
          )}

          {/* Suggestion Chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {CHIPS.map(chip => (
              <button
                key={chip.label}
                onClick={() => { setAiQuery(chip.query); setSearchError(null); }}
                className="bg-white/10 hover:bg-[#E63946]/80 border border-white/20 hover:border-[#E63946] text-white/80 hover:text-white text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_12px_rgba(230,57,70,0.4)]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* Weather Widget */}
      <div className="w-full flex justify-center py-8">
        <WeatherWidget city="Casablanca" />
      </div>

      {/* ══════════════════════════════════════════════
          3 ▸ CINEMATIC VIDEO SECTION
      ══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <Reveal>
          <div className="relative w-full h-[450px] rounded-3xl overflow-hidden my-12 shadow-2xl shadow-black/50 border border-white/10 group">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src={IMAGES.promoVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30 z-10 transition-colors duration-700 group-hover:bg-black/10" />

            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-tight opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                Experience the Magic
              </h2>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS SECTION
      ══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[#E63946] text-xs font-bold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">How It Works</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Plan your dream Moroccan trip in three simple steps with our AI-powered platform.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line — bisects the step-number circles vertically */}
          <div className="hidden md:block absolute top-[1rem] left-[calc(16.67%+1.25rem)] right-[calc(16.67%+1.25rem)] h-px bg-gradient-to-r from-[#E63946]/30 via-[#E63946]/60 to-[#E63946]/30" />

          {([
            { step: "01", Icon: MessageSquare, title: "Describe Your Trip", desc: "Type a natural query like \"5 days in Marrakech under 2000 MAD\" into our AI search bar." },
            { step: "02", Icon: Bot, title: "AI Builds Your Itinerary", desc: "Our Groq-powered AI instantly generates a day-by-day plan with local food, hidden gems, and budget breakdown." },
            { step: "03", Icon: Users, title: "Invite & Collaborate", desc: "Share a live link with your group to vote on activities, split costs, and chat in real time." },
          ] as const).map((item, i) => (
            <Reveal key={item.step} delay={i * 120}>
              <div className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-[#E63946]/40 hover:bg-[#E63946]/5 transition-all duration-500 group">
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#E63946] text-white text-xs font-black flex items-center justify-center shadow-[0_0_16px_rgba(230,57,70,0.5)] z-10">
                  {item.step}
                </div>
                {/* Lucide icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/10 mb-5 mt-4 group-hover:scale-110 group-hover:bg-[#E63946]/20 group-hover:border-[#E63946]/30 transition-all duration-300">
                  <item.Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4 ▸ TOP DESTINATIONS
      ══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-12 pb-24">
        <Reveal>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Top Destinations</h2>
            <button onClick={() => navigate("/cities")} className="text-red-400 text-sm font-semibold hover:text-white transition-colors">View All →</button>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingCities
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white/5 border border-white/10 rounded-3xl h-72 animate-pulse" />)
            : DESTINATIONS.map((dest, i) => (
              <Reveal key={dest.slug} delay={i * 80}>
                <div
                  onClick={() => navigate(`/cities/${dest.slug}`)}
                  className="relative h-72 rounded-3xl overflow-hidden cursor-pointer group bg-white/5 border border-white/10 shadow-lg"
                >
                  <SafeImage
                    src={imgUrl(dest.slug)}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Morocco
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-2">{dest.name}</h3>
                    <p className="text-slate-300 text-sm line-clamp-1">{dest.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))
          }
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4 ▸ FOOTER WITH MAP
      ══════════════════════════════════════════════ */}
      <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Big Map */}
          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-16 relative" style={{ height: 500 }}>
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none" />

              {/* Floating Search Bar */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-10">
                <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/20 p-1.5 rounded-full shadow-lg">
                  <svg className="w-5 h-5 text-white/70 ml-3 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" placeholder="Search map..." className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm px-2" />
                  <button className="bg-blue-600 hover:bg-blue-500 rounded-full px-6 py-2 text-white text-sm font-medium transition-colors shrink-0">
                    Go
                  </button>
                </div>
              </div>

              <MapboxMap center={{ lat: 31.7917, lng: -7.0926 }} zoom={5} markers={markers} />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
            </div>
          </Reveal>

          {/* Footer links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span>🌍</span>
                <span className="font-extrabold text-lg text-white">Smart <span className="text-red-500">Morocco</span></span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Your AI-powered gateway to Morocco's most extraordinary destinations.
              </p>
            </div>
            {[
              { title: "Explore", links: [["Destinations", "/cities"], ["Experiences", "/trips"], ["Plan a Trip", "/plan-trip"]] },
              { title: "Company", links: [["About", "/about"], ["Blog", "#"], ["Careers", "#"]] },
              { title: "Support", links: [["Help", "#"], ["Contact", "#"], ["Safety", "#"]] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-bold text-white mb-6 uppercase tracking-wider text-xs">{col.title}</p>
                <ul className="space-y-4">
                  {col.links.map(([l, h]) => (
                    <li key={l}><a href={h} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
            <p className="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} Smart Morocco. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-slate-500 font-medium">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
