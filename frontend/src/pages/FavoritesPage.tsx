import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// @ts-ignore
import { useFavorites } from "../hooks/useFavorites";
import { useLanguage } from "../hooks/useLanguage";
import { TourCard } from "../components/TourCard";
import { getDestinationData } from "../services/destinationService";
import { motion } from "framer-motion";

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const { t } = useLanguage();
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDestinationData();
        setAllItems(data.allItems);
      } catch (error) {
        console.error("Error loading destination data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter based on stored favorite IDs
  const savedItems = allItems.filter(item => favorites.includes(item.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b18] pt-28 pb-20 relative overflow-hidden flex items-center justify-center">
        <div className="text-white text-xl">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b18] pt-28 pb-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            My <span className="text-red-500">Favorites</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Your personalized collection of Moroccan dreams. Keep track of the places and experiences that inspire your next journey.
          </p>
        </motion.div>

        {savedItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {savedItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <TourCard tour={item} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 opacity-80">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Your journey awaits</h2>
            <p className="text-slate-400 max-w-md mb-8 text-lg">
              Start saving your favorite Moroccan experiences to build your perfect itinerary.
            </p>
            <Link
              to="/trips"
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:-translate-y-1"
            >
              Explore Experiences
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
