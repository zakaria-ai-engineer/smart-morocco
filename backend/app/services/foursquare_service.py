"""Foursquare API service for fetching travel and destination data."""

import logging
import os
import httpx
from typing import Optional

logger = logging.getLogger(__name__)


class FoursquareService:
    """Service to interact with Foursquare Places API."""

    BASE_URL = "https://api.foursquare.com/v3"
    
    CATEGORY_IDS = {
        "restaurants": "13065",  # Restaurants
        "food": "13065",
        "hotels": "19014",  # Hotels
        "hotel": "19014",
        "experiences": "16000",  # Attractions
        "experience": "16000",
        "attraction": "16000",
    }

    MOROCCAN_CITIES = {
        "marrakech": "ChIJW6rQrFKRFBYRxQOSoGyZrCE",
        "casablanca": "ChIJE5QJnFKSFRYRrh8eygpXYxQ",
        "fez": "ChIJIQBpAFiQFBYRt5qe6l8eFPM",
        "tangier": "ChIJJQ5QJzqTFRYRqUbqJ2sBZXQ",
        "agadir": "ChIJvQxYHJcLFBYRhMUKsDTHpkc",
        "chefchaouen": "ChIJIQBpAFiQFBYRt5qe6l8eFPM",
        "essaouira": "ChIJvQxYHJcLFBYRhMUKsDTHpkc",
        "ouarzazate": "ChIJnZMj9UqvFBYRKPc3vMTDxEU",
        "imlil": "ChIJZcZoAAKTFBYRKPc3vMTDxEU",
        "merzouga": "ChIJ6d2d6U2SFBYRKPc3vMTDxEU",
    }

    def __init__(self):
        """Initialize Foursquare service with API key."""
        self.api_key = os.getenv("FOURSQUARE_API_KEY", "").strip()
        if not self.api_key:
            raise ValueError("FOURSQUARE_API_KEY is not set in environment variables")
        logger.info("Foursquare API Key loaded (prefix=%s...).", self.api_key[:10])

    async def search_places(
        self,
        city: str,
        place_type: str,
        limit: int = 10
    ) -> list[dict]:
        """
        Search for places in a specific city using Foursquare API.
        
        Args:
            city: City name (e.g., 'Marrakech')
            place_type: Type of place (restaurant, hotel, attraction, etc.)
            limit: Maximum number of results to return
            
        Returns:
            List of formatted place dictionaries
        """
        try:
            clean_city = city.split(",")[0].strip().lower()
            
            # Get category ID
            category_id = self.CATEGORY_IDS.get(place_type.lower(), "16000")
            
            # Get city coordinates - using simplified coordinates for Moroccan cities
            near = f"{clean_city}, Morocco"
            
            headers = {
                "accept": "application/json",
                "Authorization": self.api_key
            }
            
            params = {
                "query": self._get_query_string(place_type, clean_city),
                "near": near,
                "limit": limit,
                "categoryId": category_id
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.BASE_URL}/places/search",
                    headers=headers,
                    params=params
                )
                
                if response.status_code != 200:
                    logger.warning(
                        "Foursquare API error %s for city=%r type=%r — using fallback.",
                        response.status_code, clean_city, place_type,
                    )
                    return await self._get_fallback_data(place_type, clean_city)
                
                data = response.json()
                results = data.get("results", [])
                
                if not results:
                    logger.info("No results from Foursquare API for city=%r — using fallback.", clean_city)
                    return await self._get_fallback_data(place_type, clean_city)
                
                formatted_places = []
                for place in results:
                    formatted_places.append(self._format_place(place, clean_city))
                
                logger.info("Retrieved %d places from Foursquare API.", len(formatted_places))
                return formatted_places
                
        except Exception as e:
            logger.exception("Foursquare Service exception for city=%r type=%r: %s", city, place_type, e)
            return await self._get_fallback_data(place_type, city)

    async def search_nearby(self, lat: float, lng: float, query: Optional[str] = None, limit: int = 5) -> list[dict]:
        """Search nearby places by coordinates."""
        try:
            headers = {
                "accept": "application/json",
                "Authorization": self.api_key
            }
            params = {
                "ll": f"{lat},{lng}",
                "limit": limit
            }
            if query:
                params["query"] = query

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(f"{self.BASE_URL}/places/search", headers=headers, params=params)
                if response.status_code != 200:
                    return []
                data = response.json()
                results = data.get("results", [])
                
                # Basic AI-ready filtering: only top-rated if rating exists
                filtered = []
                for p in results:
                    rating = p.get("rating")
                    if rating is not None and rating <= 7:
                        continue
                    filtered.append(self._format_place(p, ""))
                return filtered
        except Exception as e:
            logger.exception("search_nearby error: %s", e)
            return []

    async def get_place_details(self, fsq_id: str) -> Optional[dict]:
        """Get details for a specific place."""
        try:
            headers = {
                "accept": "application/json",
                "Authorization": self.api_key
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(f"{self.BASE_URL}/places/{fsq_id}", headers=headers)
                if response.status_code != 200:
                    return None
                return response.json()
        except Exception as e:
            logger.exception("get_place_details error for fsq_id=%r: %s", fsq_id, e)
            return None

    async def get_place_photos(self, fsq_id: str) -> list[str]:
        """Get photos for a specific place."""
        try:
            headers = {
                "accept": "application/json",
                "Authorization": self.api_key
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(f"{self.BASE_URL}/places/{fsq_id}/photos", headers=headers)
                if response.status_code != 200:
                    return []
                photos = response.json()
                return [f"{photo.get('prefix')}original{photo.get('suffix')}" for photo in photos]
        except Exception as e:
            logger.exception("get_place_photos error for fsq_id=%r: %s", fsq_id, e)
            return []

    async def get_cities(self) -> list[dict]:
        """Get list of popular Moroccan cities with details."""
        cities_data = [
            {
                "id": "marrakech",
                "name": "Marrakech",
                "description": "The vibrant Red City, known for its bustling souks, beautiful palaces, and lush gardens.",
                "image": "https://images.unsplash.com/photo-1489749798305-4fea057b747f?w=600&h=400&fit=crop",
                "category": "Destination"
            },
            {
                "id": "fez",
                "name": "Fez",
                "description": "The cultural and spiritual center of Morocco, featuring the world's oldest university and a massive ancient medina.",
                "image": "https://images.unsplash.com/photo-1548013146-72d72207e568?w=600&h=400&fit=crop",
                "category": "Destination"
            },
            {
                "id": "chefchaouen",
                "name": "Chefchaouen",
                "description": "The Blue Pearl of Morocco, nestled in the Rif Mountains with its striking blue-washed streets.",
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
                "category": "Destination"
            },
            {
                "id": "casablanca",
                "name": "Casablanca",
                "description": "Morocco's modern metropolis and economic hub, blending stunning Art Deco architecture with contemporary lifestyle.",
                "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
                "category": "Destination"
            },
            {
                "id": "agadir",
                "name": "Agadir",
                "description": "A seaside resort city with pristine beaches and a laid-back atmosphere perfect for relaxation.",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
                "category": "Destination"
            },
            {
                "id": "essaouira",
                "name": "Essaouira",
                "description": "A charming coastal town famous for fresh seafood, artisan crafts, and windy beaches.",
                "image": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&h=400&fit=crop",
                "category": "Destination"
            }
        ]
        
        return cities_data

    async def get_attractions(self) -> list[dict]:
        """Get list of popular attractions and experiences."""
        attractions = [
            {
                "id": "exp-quad",
                "title": "Quad Biking in Merzouga",
                "duration": "2 Hours",
                "price": 750,
                "category": "Adventure",
                "city": "Merzouga",
                "description": "An adrenaline-filled adventure across the high dunes of Erg Chebbi.",
                "image": "https://images.unsplash.com/photo-1552543865-83a8bc6f3a66?w=600&h=400&fit=crop",
                "rating": 4.9
            },
            {
                "id": "exp-surf",
                "title": "Taghazout Surf Lessons",
                "duration": "1 Day",
                "price": 500,
                "category": "Sport",
                "city": "Agadir",
                "description": "Ride the famous Atlantic waves in the surfing capital of Morocco.",
                "image": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&h=400&fit=crop",
                "rating": 4.7
            },
            {
                "id": "exp-souk",
                "title": "Personal Souk Shopper",
                "duration": "3 Hours",
                "price": 300,
                "category": "Shopping",
                "city": "Marrakech",
                "description": "A local expert to help you find the best rugs, leather, and spices.",
                "image": "https://images.unsplash.com/photo-1555427920-ab7b9c7a91b5?w=600&h=400&fit=crop",
                "rating": 4.8
            },
            {
                "id": "exp-cooking",
                "title": "Fes Cooking Class",
                "duration": "5 Hours",
                "price": 650,
                "category": "Culinary",
                "city": "Fes",
                "description": "Learn to cook traditional Moroccan tagine in the heart of the Medina.",
                "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
                "rating": 4.9
            },
            {
                "id": "exp-hammam",
                "title": "Luxury Hammam Spa",
                "duration": "2 Hours",
                "price": 1200,
                "category": "Relaxation",
                "city": "Marrakech",
                "description": "The ultimate relaxation experience with black soap scrub and argan oil massage.",
                "image": "https://images.unsplash.com/photo-1583900362580-dcac9f8551d9?w=600&h=400&fit=crop",
                "rating": 5.0
            },
            {
                "id": "exp-balloon",
                "title": "Hot Air Balloon Marrakech",
                "duration": "1 Hour",
                "price": 2500,
                "category": "Adventure",
                "city": "Marrakech",
                "description": "Witness the sunrise over the Atlas Mountains and palm groves from above.",
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
                "rating": 4.9
            },
            {
                "id": "exp-hike",
                "title": "Atlas Mountains Hiking",
                "duration": "1 Day",
                "price": 800,
                "category": "Nature",
                "city": "Imlil",
                "description": "A guided trek through Berber villages and stunning mountain valleys.",
                "image": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
                "rating": 4.7
            },
            {
                "id": "exp-camel",
                "title": "Sahara Camel Trekking",
                "duration": "3 Hours",
                "price": 450,
                "category": "Adventure",
                "city": "Merzouga",
                "description": "A classic desert experience into the golden dunes as the sun sets.",
                "image": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop",
                "rating": 4.8
            }
        ]
        return attractions

    def _format_place(self, place: dict, city: str) -> dict:
        """Format a Foursquare place response to our internal schema."""
        fsq_id = place.get("fsq_id", "")
        name = place.get("name", "Unknown Place")
        address = place.get("location", {})
        
        formatted_address = ", ".join(filter(None, [
            address.get("address", ""),
            address.get("city", city),
            "Morocco"
        ]))
        
        # Default image from Unsplash
        image_url = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop"
        
        # Try to use Foursquare's photo if available
        photos = place.get("photos", [])
        if photos:
            image_url = photos[0].get("prefix", "") + "300x300" + photos[0].get("suffix", "")
        
        return {
            "id": fsq_id or name.lower().replace(" ", "-"),
            "name": name,
            "address": formatted_address,
            "image": image_url,
            "category": "Experience"
        }

    def _get_query_string(self, place_type: str, city: str) -> str:
        """Generate appropriate query string based on place type."""
        queries = {
            "restaurant": "restaurants",
            "food": "restaurants and cafes",
            "hotel": "hotels",
            "hotels": "hotels",
            "attraction": "attractions and landmarks",
            "attractions": "attractions and landmarks",
            "experience": "tours and activities",
            "experiences": "tours and activities",
        }
        base_query = queries.get(place_type.lower(), "attractions")
        return f"{base_query} in {city}"

    async def _get_fallback_data(self, place_type: str, city: str) -> list[dict]:
        """Return fallback data when API fails."""
        fallback_data = {
            "restaurants": [
                {"name": "Dar Anika", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1604521270917-0f0cd5a6b73a?w=600"},
                {"name": "Le Jardin", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1504674900306-672821e3eb98?w=600"},
                {"name": "Café Arabe", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1445521458279-0994a64fc481?w=600"}
            ],
            "attractions": [
                {"name": "Sahara Desert Tour", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"},
                {"name": "Medina Walking Tour", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"},
                {"name": "Mountain Trekking", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1434694686117-3616d7d6d328?w=600"}
            ],
            "hotels": [
                {"name": "Riad Karmela", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1551632786-de41ec042138?w=600"},
                {"name": "La Mamounia", "address": f"{city}, Morocco", "image": "https://images.unsplash.com/photo-1542314503-37143f932c30?w=600"}
            ]
        }
        
        base_type = "restaurants" if place_type in ["restaurant", "food"] else \
                    "hotels" if place_type in ["hotel", "hotels"] else "attractions"
        
        return fallback_data.get(base_type, fallback_data["attractions"])
