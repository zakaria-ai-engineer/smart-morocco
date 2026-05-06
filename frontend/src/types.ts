export type TripTag = "beach" | "desert" | "culture" | "nature";

export interface City {
  id: string;
  slug: string;
  name: string;
  region: string;
  image: string | null;
  images?: string[];
  description: string;
  coordinates: { lat: number; lng: number };
  category: string;
  highlights?: string[];
}

export interface Trip {
  id: string;
  title: string;
  city: string;
  price: number;
  duration: number;
  tags: TripTag[];
  description: string;
  image?: string | null;
}

export interface RecommendResponse {
  extracted: {
    budget: number | null;
    duration: number | null;
    preferences: string[];
  };
  trips: Trip[];
  message?: string;
}

export interface ChatResponse {
  reply: string;
  trips: Trip[];
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
}

export interface FavoriteWithTrip {
  favorite_id: string;
  trip: Trip;
}
