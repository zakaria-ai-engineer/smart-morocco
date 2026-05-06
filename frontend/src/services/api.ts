import axios from "axios";
import type { AuthTokenResponse, ChatResponse, City, FavoriteWithTrip, RecommendResponse, Trip, User } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8001",
  timeout: 20000,
});

let accessToken: string | null = localStorage.getItem("smart-morocco-token");

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export function toAbsoluteMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8001").replace(/\/+$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export interface StandardResponse<T> {
  success: boolean;
  source: string;
  data: T;
}

export async function fetchCities(): Promise<City[]> {
  try {
    const response = await api.get<StandardResponse<City[]>>("/cities");
    const cities = response.data?.data || [];
    return cities.map((city) => ({ ...city, image: toAbsoluteMediaUrl(city?.image) ?? null }));
  } catch (error) {
    console.error("Failed to fetch cities:", error);
    return [];
  }
}

export async function fetchTrips(): Promise<Trip[]> {
  try {
    const response = await api.get<Trip[]>("/trips");
    return (response.data || []).map((trip) => ({ ...trip, image: toAbsoluteMediaUrl(trip?.image) ?? null }));
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return [];
  }
}

export async function recommendTrips(query: string): Promise<RecommendResponse | null> {
  try {
    const response = await api.post<RecommendResponse>("/ai/recommend", { query });
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to recommend trips:", error);
    return null;
  }
}

export async function fetchAITravelGuide(city: string, type: string): Promise<Array<{ name: string, description: string }>> {
  try {
    const response = await api.post("/ai/recommendations", { city, type });
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch AI travel guide:", error);
    return [];
  }
}

export async function chatWithAI(message: string): Promise<ChatResponse | null> {
  try {
    const response = await api.post<ChatResponse>("/ai/chat", { message });
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to chat with AI:", error);
    return { reply: "An error occurred while connecting to the AI service. Please try again.", trips: [] };
  }
}

export async function registerUser(email: string, password: string, fullName?: string): Promise<User> {
  const response = await api.post<User>("/auth/register", { email, password, full_name: fullName ?? null });
  return response.data;
}

export async function loginUser(email: string, password: string): Promise<AuthTokenResponse> {
  const response = await api.post<AuthTokenResponse>("/auth/login", { email, password });
  return response.data;
}

export async function fetchFavorites(): Promise<FavoriteWithTrip[]> {
  try {
    const response = await api.get<FavoriteWithTrip[]>("/favorites");
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    return [];
  }
}

export async function addFavorite(tripId: string) {
  await api.post("/favorites/add", { trip_id: tripId });
}

export async function removeFavorite(favoriteId: string) {
  await api.delete(`/favorites/${favoriteId}`);
}

export default api;
