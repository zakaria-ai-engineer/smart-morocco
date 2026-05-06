import api from "./api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  image: string | null;
  address?: string;
  rating?: number;
  category: string;
  coordinates: PlaceLocation;
}

export interface AIRecommendation {
  name: string;
  description: string;
  image: string | null;
  category: string;
  coordinates: PlaceLocation;
}

/** Shape returned by GET /places/city */
interface CityPlacesResponse {
  city: string;
  hotels: RawPlace[];
  restaurants: RawPlace[];
  activities: RawPlace[];
}

/** Raw place object as returned by the backend */
interface RawPlace {
  name: string;
  address: string;
  image: string;
}

import { StandardResponse } from "./api";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Map a raw backend place → our internal Place interface */
function mapRawPlace(raw: RawPlace, category: string, city: string): Place {
  return {
    id: Math.random().toString(36).slice(2),
    name: raw.name || "Unknown Spot",
    description: `A great ${category} in ${city}.`,
    category,
    image:
      raw.image ||
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
    address: raw.address || city,
    rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
    coordinates: {
      // Coordinates are not returned by the new backend; default to city centre
      lat: 0,
      lng: 0,
    },
  };
}

// ─────────────────────────────────────────────
// API — /places/search  (single category)
// ─────────────────────────────────────────────

/**
 * Fetch places for a city + type using the legacy /search endpoint.
 * `type` must match one of: food | restaurants | hotels | activities | experiences
 */
export async function getPlacesSearch(
  city: string,
  type: string
): Promise<Place[]> {
  try {
    const response = await api.get<RawPlace[]>("/places/search", {
      params: { city, type },
    });

    const rawData: RawPlace[] = Array.isArray(response.data)
      ? response.data
      : (response.data as any)?.data ?? [];

    return rawData.map((p) => mapRawPlace(p, type, city));
  } catch (error) {
    console.error(`[placesService] getPlacesSearch(${city}, ${type}):`, error);
    return [];
  }
}

// ─────────────────────────────────────────────
// API — /places/city  (all three categories)
// ─────────────────────────────────────────────

/**
 * Fetch hotels, restaurants, and activities for a city in one request.
 */
export async function getCityPlaces(city: string): Promise<{
  hotels: Place[];
  restaurants: Place[];
  activities: Place[];
}> {
  try {
    const response = await api.get<CityPlacesResponse>("/places/city", {
      params: { city },
    });

    const data = response.data;

    return {
      hotels: (data.hotels ?? []).map((p) => mapRawPlace(p, "hotel", data.city ?? city)),
      restaurants: (data.restaurants ?? []).map((p) =>
        mapRawPlace(p, "restaurant", data.city ?? city)
      ),
      activities: (data.activities ?? []).map((p) =>
        mapRawPlace(p, "activity", data.city ?? city)
      ),
    };
  } catch (error) {
    console.error(`[placesService] getCityPlaces(${city}):`, error);
    return { hotels: [], restaurants: [], activities: [] };
  }
}

// ─────────────────────────────────────────────
// Convenience wrappers (used elsewhere in the app)
// ─────────────────────────────────────────────

export async function getRestaurants(city: string): Promise<Place[]> {
  return getPlacesSearch(city, "restaurants");
}

export async function getHotels(city: string): Promise<Place[]> {
  return getPlacesSearch(city, "hotels");
}

export async function getAttractions(city: string): Promise<Place[]> {
  return getPlacesSearch(city, "activities");
}

/**
 * Returns 6 mixed places (2 restaurants + 2 hotels + 2 activities).
 * Uses the new /city endpoint for a single network round-trip.
 */
export async function getTopPlaces(city: string): Promise<Place[]> {
  try {
    const { hotels, restaurants, activities } = await getCityPlaces(city);
    return [
      ...restaurants.slice(0, 2),
      ...hotels.slice(0, 2),
      ...activities.slice(0, 2),
    ];
  } catch (error) {
    console.error(`[placesService] getTopPlaces(${city}):`, error);
    return [];
  }
}

// ─────────────────────────────────────────────
// AI Recommendations
// ─────────────────────────────────────────────

/** Map UI tab names → backend `type` query param */
const AI_TYPE_MAP: Record<string, string> = {
  food:       "restaurants",
  restaurant: "restaurants",
  hotel:      "hotels",
  experience: "activities",
  cities:     "cities", // handled separately below
};

export async function getAIRecommendations(
  city: string,
  type: string
): Promise<AIRecommendation[]> {
  try {
    if (type === "cities") {
      const response = await api.get<StandardResponse<any[]>>("/cities");
      const cities = response.data.data || [];
      return cities.map((c: any) => ({
        name: c.name,
        description: c.description || "A beautiful city in Morocco.",
        image: c.image ?? null,
        category: "city",
        coordinates: c.coordinates || c.location || { lat: 0, lng: 0 },
      }));
    }

    const backendType = AI_TYPE_MAP[type] ?? "activities";
    const places = await getPlacesSearch(city, backendType);

    return places.map((p) => ({
      name: p.name,
      description: p.description || `A great ${type} in ${city}.`,
      image: p.image,
      category: type,
      coordinates: p.coordinates,
    }));
  } catch (error) {
    console.error(
      `[placesService] getAIRecommendations(${city}, ${type}):`,
      error
    );
    return [];
  }
}
