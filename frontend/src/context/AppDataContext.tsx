import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchCities, fetchTrips } from "../services/api";
import type { City, Trip } from "../types";

interface AppDataContextValue {
  cities: City[];
  trips: Trip[];
  loadingCities: boolean;
  loadingTrips: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setError(null);
    setLoadingCities(true);
    setLoadingTrips(true);
    const [citiesResult, tripsResult] = await Promise.allSettled([fetchCities(), fetchTrips()]);

    if (citiesResult.status === "fulfilled") {
      setCities(citiesResult.value);
    } else {
      setCities([]);
    }

    if (tripsResult.status === "fulfilled") {
      setTrips(tripsResult.value);
    } else {
      setTrips([]);
    }

    if (citiesResult.status === "rejected" || tripsResult.status === "rejected") {
      if (citiesResult.status === "rejected" && tripsResult.status === "rejected") {
        setError("Unable to load cities and trips. Please check backend connectivity.");
      } else if (citiesResult.status === "rejected") {
        setError("Cities are temporarily unavailable. Trips are still loaded.");
      } else {
        setError("Trips are temporarily unavailable. Cities are still loaded.");
      }
    }

    setLoadingCities(false);
    setLoadingTrips(false);
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const value = useMemo(
    () => ({ cities, trips, loadingCities, loadingTrips, error, refreshData }),
    [cities, trips, loadingCities, loadingTrips, error, refreshData],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider.");
  }
  return context;
}
