import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ChatFloatingWidget } from "./components/ChatFloatingWidget";

import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAppData } from "./context/AppDataContext";

import { TripDetailsPage } from "./pages/TripDetailsPage";

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const CitiesPage = lazy(() => import("./pages/CitiesPage").then((m) => ({ default: m.CitiesPage })));
const TripsPage = lazy(() => import("./pages/TripsPage").then((m) => ({ default: m.TripsPage })));

const PlanTripPage = lazy(() => import("./pages/PlanTripPage").then((m) => ({ default: m.PlanTripPage })));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage").then((m) => ({ default: m.FavoritesPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const TravelFriendsPage = lazy(() => import("./pages/TravelFriendsPage").then((m) => ({ default: m.TravelFriendsPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const FriendsLandingPage = lazy(() => import("./pages/FriendsLandingPage").then((m) => ({ default: m.FriendsLandingPage })));
const FriendsRoomPage = lazy(() => import("./pages/FriendsRoomPage").then((m) => ({ default: m.FriendsRoomPage })));

function PageFallback() {
  return (
    <div className="p-8 space-y-4 max-w-7xl mx-auto">
      <div className="h-8 w-48 rounded-xl skeleton" />
      <div className="h-48 rounded-2xl skeleton" />
      <div className="h-48 rounded-2xl skeleton" />
    </div>
  );
}

function App() {
  const { error } = useAppData();
  const location = useLocation();

  return (
    <div className="relative w-full min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white flex flex-col overflow-x-hidden transition-colors duration-300">
      <Navbar />
      <main className="flex-1 w-full">
        {error ? (
          <div className="mx-4 mt-20 mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 shadow-lg">
            {error}
          </div>
        ) : null}
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              <Routes location={location}>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/:id" element={<TripDetailsPage />} />
                <Route path="/test-trip" element={<TripDetailsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes — require authentication */}
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/plan-trip"
                  element={
                    <ProtectedRoute>
                      <PlanTripPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <ProtectedRoute>
                      <FriendsLandingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/travel-friends"
                  element={
                    <ProtectedRoute>
                      <TravelFriendsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/friends/:roomId"
                  element={
                    <ProtectedRoute>
                      <FriendsRoomPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <ChatFloatingWidget />
    </div>
  );
}

export default App;
