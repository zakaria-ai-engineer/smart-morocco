import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addFavorite, fetchFavorites, removeFavorite } from "../services/api";
import { useAuth } from "./AuthContext";
import type { FavoriteWithTrip, Trip } from "../types";

interface FavoritesContextValue {
  favoriteIds: string[];
  favoriteMap: Record<string, string>;
  favorites: FavoriteWithTrip[];
  favoritesCount: number;
  loadingFavorites: boolean;
  isFavorite: (tripId: string) => boolean;
  toggleFavorite: (trip: Trip) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<FavoriteWithTrip[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const refreshFavorites = async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      setFavoriteMap({});
      setFavorites([]);
      return;
    }
    setLoadingFavorites(true);
    try {
      const rows = await fetchFavorites();
      const ids = rows.map((r) => r.trip.id);
      const map = rows.reduce<Record<string, string>>((acc, item) => {
        acc[item.trip.id] = item.favorite_id;
        return acc;
      }, {});
      setFavoriteIds(ids);
      setFavoriteMap(map);
      setFavorites(rows);
    } catch (error) {
      setFavoriteIds([]);
      setFavoriteMap({});
      setFavorites([]);
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    void refreshFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      favoriteMap,
      favorites,
      favoritesCount: favoriteIds.length,
      loadingFavorites,
      isFavorite: (tripId: string) => favoriteIds.includes(tripId),
      toggleFavorite: async (trip: Trip) => {
        if (!isAuthenticated) return;
        if (favoriteIds.includes(trip.id)) {
          const favoriteId = favoriteMap[trip.id];
          if (favoriteId) await removeFavorite(favoriteId);
        } else {
          await addFavorite(trip.id);
        }
        await refreshFavorites();
      },
      refreshFavorites,
    }),
    [favoriteIds, favoriteMap, favorites, loadingFavorites, isAuthenticated],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside FavoritesProvider.");
  }
  return ctx;
}
