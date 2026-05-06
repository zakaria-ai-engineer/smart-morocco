import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { IMAGES } from "../config/images";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CurrentWeather {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  cityName: string;
}

interface DayForecast {
  dayLabel: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY || import.meta.env.VITE_WEATHER_API_KEY;

const iconUrl = (code: string, size: "2x" | "4x" = "2x") =>
  `https://openweathermap.org/img/wn/${code}@${size}.png`;

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_CURRENT: CurrentWeather = {
  temp: 24,
  feelsLike: 25.5,
  description: "clear sky",
  icon: "01d",
  cityName: "Casablanca",
};

const MOCK_DAILY: DayForecast[] = [
  { dayLabel: "Today", minTemp: 16, maxTemp: 24, icon: "01d" },
  { dayLabel: "Tomorrow", minTemp: 17, maxTemp: 26, icon: "02d" },
  { dayLabel: "Wed", minTemp: 15, maxTemp: 22, icon: "10d" },
  { dayLabel: "Thu", minTemp: 14, maxTemp: 21, icon: "03d" },
  { dayLabel: "Fri", minTemp: 16, maxTemp: 25, icon: "01d" },
];

// ─── Fetch helpers ─────────────────────────────────────────────────────────────
async function fetchCurrent(city: string): Promise<CurrentWeather> {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
  if (!res.ok) throw new Error("Fetch error");
  const d = await res.json();
  return {
    temp: d.main.temp,
    feelsLike: d.main.feels_like,
    description: d.weather[0]?.description ?? "",
    icon: d.weather[0]?.icon ?? "01d",
    cityName: d.name,
  };
}

async function fetchForecast(city: string): Promise<DayForecast[]> {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&cnt=40`);
  if (!res.ok) throw new Error("Fetch error");
  const d = await res.json();

  const dayMap: Record<string, any[]> = {};
  d.list.forEach((item: any) => {
    const key = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(item);
  });

  return Object.entries(dayMap).slice(0, 5).map(([label, items]) => {
    const mid = items[Math.floor(items.length / 2)];
    return {
      dayLabel: label,
      minTemp: Math.min(...items.map((i: any) => i.main.temp_min)),
      maxTemp: Math.max(...items.map((i: any) => i.main.temp_max)),
      icon: mid.weather[0]?.icon ?? "01d",
    };
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function WeatherWidget({ city: initialCity = "Casablanca" }: { city?: string }) {
  const [city, setCity] = useState(initialCity);
  const [searchInput, setSearchInput] = useState(initialCity);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [daily, setDaily] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (!API_KEY) {
      setTimeout(() => {
        if (cancelled) return;
        setCurrent(MOCK_CURRENT);
        setDaily(MOCK_DAILY);
        setSearchInput(MOCK_CURRENT.cityName);
        setLoading(false);
      }, 500);
      return;
    }

    Promise.all([fetchCurrent(city), fetchForecast(city)])
      .then(([cur, dy]) => {
        if (cancelled) return;
        setCurrent(cur);
        setDaily(dy);
        setSearchInput(cur.cityName);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCurrent(MOCK_CURRENT);
        setDaily(MOCK_DAILY);
        setSearchInput(MOCK_CURRENT.cityName);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) setCity(searchInput.trim());
  };

  if (loading || !current) return null;

  return (
    <div className="relative w-[95%] max-w-7xl min-h-[240px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 mx-auto mt-4">
      {/* BACKGROUND MEDIA */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={IMAGES.weatherVideo} type="video/mp4" />
      </video>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 w-full h-full bg-black/40 px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-white min-h-[240px]">

      {/* LEFT: Current Weather & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
        <div className="flex items-center gap-4">
          <img src={iconUrl(current.icon, "4x")} className="w-20 h-20 drop-shadow-xl" alt="weather icon" />
          <div>
            <div className="flex items-start">
              <p className="text-5xl font-light text-white tracking-tighter leading-none">{Math.round(current.temp)}°</p>
            </div>
            <p className="text-sm text-white/70 font-semibold uppercase tracking-widest mt-2">{current.cityName}</p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-16 bg-white/10 mx-2" />

        <div className="w-full sm:w-auto flex flex-col gap-3">
          <p className="text-sm font-medium text-white capitalize">{current.description} <span className="text-white/50 ml-2">Feels like {Math.round(current.feelsLike)}°</span></p>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search City..."
              className="bg-white/5 border border-white/10 rounded-full pl-5 pr-10 py-2.5 text-sm text-white focus:border-red-500/50 outline-none w-full sm:w-56 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: 5-Day Horizontal Forecast */}
      <div className="flex gap-6 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none justify-between lg:justify-end">
        {daily.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[50px]">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider">{d.dayLabel}</p>
            <img src={iconUrl(d.icon)} className="w-10 h-10 drop-shadow-md" alt="forecast icon" />
            <div className="flex gap-2 text-sm mt-1">
              <span className="font-bold text-white">{Math.round(d.maxTemp)}°</span>
              <span className="font-medium text-slate-500">{Math.round(d.minTemp)}°</span>
            </div>
          </div>
        ))}
      </div>

      </div>
    </div>
  );
}
