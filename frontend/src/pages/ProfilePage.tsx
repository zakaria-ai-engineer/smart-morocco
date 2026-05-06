import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { TripCard } from "../components/TripCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { Reveal } from "../components/Reveal";
import { User, Settings, Bell, LogOut, Heart } from "lucide-react";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { favorites, loadingFavorites } = useFavorites();
  const favoriteTrips = favorites.map((row) => row.trip);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 min-h-screen">
      <Reveal>
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage your profile, preferences, and saved trips.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#E63946] to-rose-500 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_24px_rgba(230,57,70,0.4)] mb-4">
                {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white">
                {user.full_name || "Traveler"}
              </h2>
              <p className="text-sm text-slate-400 break-all mb-6">
                {user.email}
              </p>

              {/* Stats Bar */}
              <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white">0</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Planned</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white">{favoriteTrips.length}</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Saved</span>
                </div>
              </div>
              
              <div className="w-full mt-6 pt-4 border-t border-slate-800">
                <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 tracking-widest uppercase">
                  Traveler
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-2 mt-4">
              <button className="flex items-center gap-3 w-full px-5 py-3 bg-[#E63946]/10 text-[#E63946] font-semibold rounded-2xl transition">
                <User className="w-5 h-5" /> Personal Info
              </button>
              <button className="flex items-center gap-3 w-full px-5 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium rounded-2xl transition">
                <Settings className="w-5 h-5" /> Account Settings
              </button>
              <button className="flex items-center gap-3 w-full px-5 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-white font-medium rounded-2xl transition">
                <Bell className="w-5 h-5" /> Notifications
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-5 py-3 text-[#E63946] hover:bg-[#E63946]/10 font-medium rounded-2xl transition mt-4"
              >
                <LogOut className="w-5 h-5" /> Sign out
              </button>
            </nav>
          </div>

          {/* ── Main Content Area ── */}
          <div className="lg:col-span-3 space-y-10">

            {/* Personal Details Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-white mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <p className="text-lg font-medium text-white">{user.full_name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <p className="text-lg font-medium text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Type</label>
                  <p className="text-lg font-medium text-white capitalize">Traveler</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Member Since</label>
                  <p className="text-lg font-medium text-white">Just joined!</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800">
                <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-full transition-colors text-sm">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Saved Trips / Favorites */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">My Saved Trips</h3>
                <Link to="/favorites" className="text-sm font-semibold text-[#E63946] hover:text-red-400 transition-colors">
                  View All
                </Link>
              </div>

              {loadingFavorites ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
              ) : favoriteTrips.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {favoriteTrips.slice(0, 4).map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center shadow-sm">
                  <Heart className="w-12 h-12 text-[#E63946] mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-white">No saved trips yet.</p>
                  <p className="text-slate-400 mt-1 mb-6">Start exploring and save your favorite Moroccan itineraries.</p>
                  <Link to="/trips" className="inline-flex items-center justify-center bg-[#E63946] hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(230,57,70,0.3)] hover:-translate-y-0.5">
                    Explore Trips
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </Reveal>
    </section>
  );
}
