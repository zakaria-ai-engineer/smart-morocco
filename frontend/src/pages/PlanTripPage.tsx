import { FormEvent, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { AIRecommendationsSection } from "../components/AIRecommendationsSection";
import { Sparkles, MapPin, Calendar, DollarSign, Users, UsersRound } from "lucide-react";
import api from "../services/api";

interface ParsedTrip {
  destination: string;
  days: number;
  budget: number | null;
}

const MOROCCAN_CITIES = [
  "marrakech", "casablanca", "rabat", "tangier", "agadir",
  "fes", "chefchaouen", "essaouira", "merzouga", "ouarzazate",
  "meknes", "tetouan"
];

const extractCity = (input: string): string => {
  const lowInput = input.toLowerCase();
  for (const city of MOROCCAN_CITIES) {
    if (lowInput.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  return "Marrakech"; // Fallback
};

export function PlanTripPage() {
  const location = useLocation();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState<number | "">("");
  const [budget, setBudget] = useState<number | "">("");
  const [persons, setPersons] = useState<number | "">("");
  const [groupType, setGroupType] = useState("Friends");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Auto-fill from Hero NLP search
  useEffect(() => {
    const parsed = location.state as ParsedTrip | null;
    if (parsed?.destination) setDestination(parsed.destination);
    if (parsed?.days)        setDays(parsed.days);
    if (parsed?.budget)      setBudget(parsed.budget);
  }, [location.state]);

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();
    if (!destination.trim()) return;
    
    setLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await api.post(`/ai/generate`, {
        destination,
        days: Number(days) || 3,
        budget: Number(budget) || 1000,
        persons: Number(persons) || 2,
        group_type: groupType
      });
      
      if (response.data && response.data.response) {
        setAiResponse(response.data.response);
      } else {
        setAiResponse(JSON.stringify(response.data));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not generate trip. The AI backend might be down.");
    } finally {
      setLoading(false);
    }
  };

  // Parsing logic
  let daysContent: string[] = [];
  let budgetContent = "";

  if (aiResponse) {
    const parts = aiResponse.split("💰 Budget Breakdown");
    const itineraryPart = parts[0];
    budgetContent = parts[1] ? parts[1].trim() : "";

    daysContent = itineraryPart
      .split("✈️ Day")
      .map(d => d.trim())
      .filter(d => d.length > 0);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 font-sans">
      {/* ── Top Hero Section ── */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Design your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600">Moroccan escape.</span></h1>
        <p className="text-gray-400 text-lg">Chat with our AI or browse smart recommendations to build your perfect itinerary.</p>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* ── LEFT/MAIN AREA: Planner/Chat ── */}
        <div className="lg:col-span-8 relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Subtle Orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 space-y-12">
            {/* Trip Generator Form */}
            <form onSubmit={handleGenerate} className="w-full bg-[#0f172a]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Destination */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4 text-[#E63946]" /> Destination</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Marrakech, Fes..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#E63946] transition-colors"
                  />
                </div>

                {/* Days */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-4 h-4 text-[#E63946]" /> Days</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={days}
                    onChange={(e) => setDays(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 5"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#E63946] transition-colors"
                  />
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#E63946]" /> Budget ($)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 1500"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#E63946] transition-colors"
                  />
                </div>

                {/* Persons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4 text-[#E63946]" /> Persons</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={persons}
                    onChange={(e) => setPersons(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 2"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#E63946] transition-colors"
                  />
                </div>

                {/* Group Type */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><UsersRound className="w-4 h-4 text-[#E63946]" /> Group Type</label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-[#E63946] transition-colors appearance-none"
                  >
                    <option className="bg-[#0f172a]" value="Friends">Friends</option>
                    <option className="bg-[#0f172a]" value="Family">Family</option>
                    <option className="bg-[#0f172a]" value="Couple">Couple</option>
                    <option className="bg-[#0f172a]" value="Solo">Solo</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-2/3 max-w-md bg-[#E63946] text-white rounded-2xl py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex justify-center items-center ${
                    loading 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-red-500 hover:shadow-[0_0_20px_rgba(230,57,70,0.6)] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? "✈️ Planning your trip..." : "GENERATE ✈️"}
                </button>
              </div>
            </form>

            {/* Error State */}
            {error && (
              <div className="rounded-3xl border border-[#E63946]/30 bg-[#E63946]/10 p-6 text-red-400 shadow-md text-center font-medium backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Parsed Response Area */}
            {aiResponse && !loading && (
              <Reveal>
                <div className="space-y-8 mt-12">
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <Sparkles className="text-[#E63946] w-6 h-6" /> Your AI Itinerary
                  </h3>
                  
                  {/* Render Itinerary Days */}
                  {daysContent.map((dayText, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-xl hover:border-white/20 transition-all duration-300">
                      <h4 className="text-[#E63946] font-bold text-lg mb-4 uppercase tracking-widest">
                        Day {dayText.split(":")[0]?.trim() || index + 1}
                      </h4>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {dayText.substring(dayText.indexOf(":") + 1).trim()}
                      </div>
                    </div>
                  ))}

                  {/* Render Budget Breakdown */}
                  {budgetContent && (
                    <div className="bg-gradient-to-br from-[#E63946]/20 to-black/40 border border-[#E63946]/30 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E63946] to-transparent opacity-50" />
                       <h4 className="text-white font-black text-xl mb-4 flex items-center gap-2">
                         <DollarSign className="text-[#E63946]" /> Budget Breakdown
                       </h4>
                       <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                         {budgetContent}
                       </div>
                    </div>
                  )}
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {/* ── RIGHT/SIDEBAR AREA: AI Recommendations ── */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24">
            <AIRecommendationsSection city={destination || "Morocco"} />
          </div>
        </div>

      </div>
    </div>
  );
}