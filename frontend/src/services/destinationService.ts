/**
 * Service for fetching destination, city, and attraction data from the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export interface Place {
  id: string;
  name: string;
  address: string;
  image: string;
  category?: string;
}

export interface City {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
}

export interface Attraction {
  id: string;
  title: string;
  duration: string;
  price: number;
  category: string;
  city: string;
  description: string;
  image: string;
  rating: number;
}

/**
 * Search for places by city and type
 */
export async function searchPlaces(city: string, type: string): Promise<Place[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/places/search?city=${encodeURIComponent(city)}&type=${encodeURIComponent(type)}`
    );

    if (!response.ok) {
      console.error(`Failed to search places: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

/**
 * Get all Moroccan cities
 */
export async function getCities(): Promise<City[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cities`);

    if (!response.ok) {
      console.error(`Failed to fetch cities: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

/**
 * Get all attractions and experiences
 */
export async function getAttractions(): Promise<Attraction[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`);

    if (!response.ok) {
      console.error(`Failed to fetch attractions: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return [];
  }
}

/**
 * Get a combination of cities and attractions for the initial data load
 */
export async function getDestinationData() {
  try {
    const [cities, attractions] = await Promise.all([
      getCities(),
      getAttractions()
    ]);

    return {
      cities,
      attractions,
      allItems: [...attractions, ...cities.map(city => ({
        ...city,
        title: city.name,
        price: 0,
        duration: "Multiple Days",
        rating: 4.5
      }))]
    };
  } catch (error) {
    console.error('Error fetching destination data:', error);
    return {
      cities: [],
      attractions: [],
      allItems: []
    };
  }
}
