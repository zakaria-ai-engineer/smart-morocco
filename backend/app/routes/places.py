import logging
import os
import httpx
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Type mapping ──────────────────────────────────────────────────────────────
TYPE_MAP = {
    "food": "restaurants", "restaurant": "restaurants", "restaurants": "restaurants",
    "hotel": "hotels", "hotels": "hotels",
    "experiences": "activities", "experience": "activities",
    "activities": "activities", "attraction": "activities", "attractions": "activities",
    "sights": "activities", "museum": "activities",
    "transport": "transport"
}

# ── Mock data ─────────────────────────────────────────────────────────────────
MOCK_DATA = {
    "Casablanca": {
        "hotels": [
            {"name": "Four Seasons Hotel Casablanca", "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", "location": "Corniche"},
            {"name": "Hyatt Regency Casablanca",      "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "location": "City Centre"},
            {"name": "Sofitel Casablanca Tour Blanche","image": "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?w=800&q=80", "location": "Lusitania"},
        ],
        "restaurants": [
            {"name": "Rick's Café",  "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "location": "Old Medina"},
            {"name": "La Sqala",     "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", "location": "Old Medina"},
            {"name": "Le Cabestan",  "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "location": "Corniche"},
        ],
        "activities": [
            {"name": "Hassan II Mosque",    "image": "https://images.unsplash.com/photo-1582907462025-3e5a1c7b0c4c?w=800&q=80", "location": "Coastal Boulevard"},
            {"name": "Corniche Walk",       "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", "location": "Ain Diab"},
            {"name": "Habous Quarter Tour", "image": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", "location": "Habous"},
        ],
        "transport": [
            {"id": "trans_c1", "title": "Casa Tramway",        "description": "Lines T1 & T2 connecting the city",       "category": "transport", "icon": "Train", "estimated_cost": "6 - 8 MAD"},
            {"id": "trans_c2", "title": "ONCF Casa Voyageurs", "description": "Al Boraq High-Speed & Normal Trains",     "category": "transport", "icon": "Train", "estimated_cost": "Varies"},
            {"id": "trans_c3", "title": "InDrive / Yango",     "description": "VTC rides around Casablanca",             "category": "transport", "icon": "Car",   "estimated_cost": "20 - 60 MAD"},
        ],
    },
    "Marrakech": {
        "hotels": [
            {"name": "Royal Mansour",  "image": "https://images.unsplash.com/photo-1501117716987-c8e1ecb210f0?w=800&q=80", "location": "Medina"},
            {"name": "La Mamounia",    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", "location": "Hivernage"},
            {"name": "Amanjena Resort","image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "location": "Palmeraie"},
        ],
        "restaurants": [
            {"name": "Nomad",      "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", "location": "Place des Épices"},
            {"name": "Dar Yacout", "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", "location": "Medina"},
            {"name": "Le Jardin",  "image": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", "location": "Medina"},
        ],
        "activities": [
            {"name": "Hot Air Balloon Ride",   "image": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=80", "location": "Palmeraie"},
            {"name": "Majorelle Garden",       "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", "location": "Gueliz"},
            {"name": "Djemaa el-Fna Evening",  "image": "https://images.unsplash.com/photo-1553580556-3b2d6a45fc21?w=800&q=80", "location": "Medina"},
        ],
        "transport": [
            { "id": "trans_01", "title": "InDrive Ride (VTC)", "description": "Marrakech Local Ride", "category": "transport", "icon": "Car", "estimated_cost": "15 - 50 MAD" },
            { "id": "trans_02", "title": "ONCF Train Station", "description": "Marrakech Railway Station", "category": "transport", "icon": "Train", "estimated_cost": "150 - 200 MAD" },
            { "id": "trans_03", "title": "Petit Taxi Stand", "description": "Central Marrakech City", "category": "transport", "icon": "Taxi", "estimated_cost": "10 - 30 MAD" }
        ]
    },
    "Rabat": {
        "hotels": [
            {"name": "Fairmont La Marina",    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "location": "Salé Marina"},
            {"name": "Tour Hassan Palace",    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "location": "Hassan"},
            {"name": "Sofitel Rabat Jardin",  "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", "location": "Agdal"},
        ],
        "restaurants": [
            {"name": "Le Dhow",  "image": "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80", "location": "Bouregreg River"},
            {"name": "Dar Naji", "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80", "location": "Agdal"},
            {"name": "Ty Potes", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "location": "Hassan"},
        ],
        "activities": [
            {"name": "Kasbah of the Udayas", "image": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80", "location": "Medina"},
            {"name": "Chellah Ruins",        "image": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", "location": "Chellah"},
            {"name": "Mohammed V Mausoleum", "image": "https://images.unsplash.com/photo-1582907462025-3e5a1c7b0c4c?w=800&q=80", "location": "Hassan"},
        ],
        "transport": [
            {"id": "trans_r1", "title": "Rabat-Salé Tramway", "description": "Connects Rabat and Salé",               "category": "transport", "icon": "Train", "estimated_cost": "6 MAD"},
            {"id": "trans_r2", "title": "ONCF Rabat Agdal",  "description": "High-Speed Train (Al Boraq) Station",   "category": "transport", "icon": "Train", "estimated_cost": "Varies"},
            {"id": "trans_r3", "title": "Blue Petit Taxi",   "description": "Local city metered taxi",               "category": "transport", "icon": "Taxi",  "estimated_cost": "15 - 30 MAD"},
        ],
    },
    "Tangier": {
        "hotels": [
            {"name": "El Minzah Hotel",   "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80", "location": "City Centre"},
            {"name": "Villa de France",   "image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80", "location": "Grand Socco"},
            {"name": "Rif & Spa Tangier", "image": "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?w=800&q=80", "location": "Corniche"},
        ],
        "restaurants": [
            {"name": "El Morocco Club", "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", "location": "Kasbah"},
            {"name": "Cafe Hafa",       "image": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80", "location": "Marshane"},
            {"name": "Le Saveur du Poisson", "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "location": "Medina"},
        ],
        "activities": [
            {"name": "Caves of Hercules",   "image": "https://images.unsplash.com/photo-1605500057207-6cce0e808383?w=800&q=80", "location": "Cape Spartel"},
            {"name": "Kasbah Walking Tour", "image": "https://images.unsplash.com/photo-1553580556-3b2d6a45fc21?w=800&q=80", "location": "Old Kasbah"},
            {"name": "Cape Spartel Sunset", "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", "location": "Cape Spartel"},
        ],
        "transport": [
            {"id": "trans_t1", "title": "ONCF Tanger Ville",         "description": "Al Boraq High-Speed terminus",      "category": "transport", "icon": "Train", "estimated_cost": "Varies"},
            {"id": "trans_t2", "title": "CTM Bus Station",           "description": "Premium intercity bus travel",       "category": "transport", "icon": "Bus",   "estimated_cost": "120 - 250 MAD"},
            {"id": "trans_t3", "title": "Light Blue Petit Taxi",     "description": "Local Tangier metered taxi",         "category": "transport", "icon": "Taxi",  "estimated_cost": "10 - 25 MAD"},
        ],
    },
    "Agadir": {
        "hotels": [
            {"name": "Sofitel Agadir Royal Bay", "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "location": "Beachfront"},
            {"name": "Riu Palace Tikida",        "image": "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80", "location": "Agadir Bay"},
            {"name": "Atlantic Palace Resort",   "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", "location": "Secteur Balnéaire"},
        ],
        "restaurants": [
            {"name": "Pure Passion",     "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", "location": "Agadir Marina"},
            {"name": "O P'tit Bateau",  "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "location": "Port"},
            {"name": "Jour et Nuit",    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "location": "Promenade"},
        ],
        "activities": [
            {"name": "Taghazout Surfing",    "image": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80", "location": "Taghazout"},
            {"name": "Agadir Oufella Ruins", "image": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", "location": "Kasbah"},
            {"name": "Souk El Had Market",   "image": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80", "location": "City Centre"},
        ],
        "transport": [
            {"id": "trans_a1", "title": "ALSA City Bus",        "description": "Local public transit & airport line",  "category": "transport", "icon": "Bus",  "estimated_cost": "4 - 50 MAD"},
            {"id": "trans_a2", "title": "Supratours Station",   "description": "Intercity bus linked with ONCF",       "category": "transport", "icon": "Bus",  "estimated_cost": "100 - 300 MAD"},
            {"id": "trans_a3", "title": "Orange Petit Taxi",    "description": "Local Agadir metered taxi",            "category": "transport", "icon": "Taxi", "estimated_cost": "15 - 40 MAD"},
        ],
    },
    "Fes": {
        "hotels": [
            {"name": "Palais Faraj Suites & Spa",     "image": "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?w=800&q=80", "location": "Ziat"},
            {"name": "Riad Fes Relais & Châteaux",    "image": "https://images.unsplash.com/photo-1501117716987-c8e1ecb210f0?w=800&q=80", "location": "Medina"},
            {"name": "Sahrai Hotel Fes",               "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "location": "Dhar Mehraz"},
        ],
        "restaurants": [
            {"name": "Nur Restaurant",  "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", "location": "Medina"},
            {"name": "Dar Roumana",     "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80", "location": "Medina"},
            {"name": "Maison Bleue",    "image": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", "location": "Batha"},
        ],
        "activities": [
            {"name": "Chouara Tannery Tour",  "image": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80", "location": "Old Medina"},
            {"name": "Al Quaraouiyine Visit", "image": "https://images.unsplash.com/photo-1553580556-3b2d6a45fc21?w=800&q=80", "location": "Fes el Bali"},
            {"name": "Bab Bou Jeloud Gate",   "image": "https://images.unsplash.com/photo-1582907462025-3e5a1c7b0c4c?w=800&q=80", "location": "Fes el Bali"},
        ],
        "transport": [
            {"id": "trans_f1", "title": "ONCF Fes Station", "description": "Main railway connecting to Casa/Rabat",  "category": "transport", "icon": "Train", "estimated_cost": "100 - 150 MAD"},
            {"id": "trans_f2", "title": "Red Petit Taxi",   "description": "Local Fes metered taxi",                "category": "transport", "icon": "Taxi",  "estimated_cost": "10 - 20 MAD"},
            {"id": "trans_f3", "title": "CTM Fes",          "description": "Intercity premium bus station",          "category": "transport", "icon": "Bus",   "estimated_cost": "80 - 200 MAD"},
        ],
    },
    "Chefchaouen": {
        "hotels": [
            {"name": "Lina Ryad & Spa",    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", "location": "Medina"},
            {"name": "Dar Echchaouen",     "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "location": "Ras El Ma"},
            {"name": "Casa Hassan Riad",   "image": "https://images.unsplash.com/photo-1501117716987-c8e1ecb210f0?w=800&q=80", "location": "Medina"},
        ],
        "restaurants": [
            {"name": "Cafe Clock",   "image": "https://images.unsplash.com/photo-1541542684-4a3b5f3f3b1f?w=800&q=80", "location": "Medina"},
            {"name": "Bab Ssour",    "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", "location": "Medina"},
            {"name": "Restaurant Tissemane", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "location": "Blue Medina"},
        ],
        "activities": [
            {"name": "Blue City Photography Walk", "image": "https://images.unsplash.com/photo-1553580556-3b2d6a45fc21?w=800&q=80", "location": "Blue Medina"},
            {"name": "Akchour Waterfalls Hike",    "image": "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80", "location": "Talassemtane"},
            {"name": "Ras El Ma Spring",           "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", "location": "Medina"},
        ],
    },
    "Essaouira": {
        "hotels": [
            {"name": "Heure Bleue Palais",          "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", "location": "Medina"},
            {"name": "Le Médina Essaouira Hotel",   "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "location": "Beachfront"},
            {"name": "Riad Al Madina",              "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", "location": "Medina"},
        ],
        "restaurants": [
            {"name": "Taros Café",        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "location": "Place Moulay Hassan"},
            {"name": "Ocean Vagabond",    "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", "location": "Beach"},
            {"name": "Seafood at the Port","image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "location": "Port"},
        ],
        "activities": [
            {"name": "Kite Surfing Lesson",     "image": "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80", "location": "Main Beach"},
            {"name": "Skala de la Ville Walk",  "image": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80", "location": "Ramparts"},
            {"name": "Medina Arts & Crafts",    "image": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", "location": "Medina"},
        ],
    },
    "Merzouga": {
        "hotels": [
            {"name": "Desert Luxury Camp",  "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", "location": "Erg Chebbi"},
            {"name": "Kasbah Mohayut",      "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "location": "Dunes Edge"},
            {"name": "Dar Ahlam Tent Camp", "image": "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?w=800&q=80", "location": "Sahara"},
        ],
        "restaurants": [
            {"name": "Cafe Nora",              "image": "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80", "location": "Khamlia"},
            {"name": "Restaurant Sahara",      "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80", "location": "Merzouga Centre"},
            {"name": "Berber Desert Kitchen",  "image": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", "location": "Erg Chebbi"},
        ],
        "activities": [
            {"name": "Sunset Camel Trek",  "image": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=80", "location": "Sahara Dunes"},
            {"name": "4x4 Desert Safari",  "image": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", "location": "Erg Chebbi"},
            {"name": "Stargazing Night",   "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", "location": "Open Desert"},
        ],
    },
    "Ouarzazate": {
        "hotels": [
            {"name": "Le Berbère Palace",  "image": "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?w=800&q=80", "location": "City Centre"},
            {"name": "Dar Kamar Riad",     "image": "https://images.unsplash.com/photo-1501117716987-c8e1ecb210f0?w=800&q=80", "location": "Taourirt"},
            {"name": "Ksar Ighnda",        "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "location": "Airport Road"},
        ],
        "restaurants": [
            {"name": "Jardin des Arômes",        "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", "location": "Downtown"},
            {"name": "La Kasbah des Sables",     "image": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", "location": "Ait Benhaddou Road"},
            {"name": "Restaurant Chez Dimitri",  "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "location": "Mohammed V Avenue"},
        ],
        "activities": [
            {"name": "Atlas Film Studios Tour",   "image": "https://images.unsplash.com/photo-1582907462025-3e5a1c7b0c4c?w=800&q=80", "location": "Studio Road"},
            {"name": "Ait Benhaddou Excursion",   "image": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", "location": "Ait Benhaddou"},
            {"name": "Draa Valley Day Trip",      "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", "location": "Draa Valley"},
        ],
    },
    "Meknes": {
        "hotels": [
            {"name": "Château Roslane",   "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", "location": "El Hajeb Route"},
            {"name": "Riad Yacout",       "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", "location": "Medina"},
            {"name": "Palais Didi",       "image": "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?w=800&q=80", "location": "Medina"},
        ],
        "restaurants": [
            {"name": "Ya Hala",                  "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", "location": "Medina"},
            {"name": "Collier de la Colombe",    "image": "https://images.unsplash.com/photo-1541542684-4a3b5f3f3b1f?w=800&q=80", "location": "Ville Nouvelle"},
            {"name": "Restaurant Zitouna",       "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", "location": "Medina"},
        ],
        "activities": [
            {"name": "Volubilis Roman Ruins",    "image": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80", "location": "Volubilis"},
            {"name": "Bab Mansour Photography",  "image": "https://images.unsplash.com/photo-1553580556-3b2d6a45fc21?w=800&q=80", "location": "Lahdim Square"},
            {"name": "Heri es-Souani Granaries", "image": "https://images.unsplash.com/photo-1582907462025-3e5a1c7b0c4c?w=800&q=80", "location": "Royal Stables"},
        ],
    },
    "Tetouan": {
        "hotels": [
            {"name": "Blanco Riad",           "image": "https://images.unsplash.com/photo-1501117716987-c8e1ecb210f0?w=800&q=80", "location": "Medina"},
            {"name": "Barcelo Marina Smir",   "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "location": "M'diq"},
            {"name": "Sofitel Marina Smir",   "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80", "location": "Tamouda Bay"},
        ],
        "restaurants": [
            {"name": "Blanco Riad Restaurant", "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", "location": "Medina"},
            {"name": "La Esquina",             "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "location": "Ensanche"},
            {"name": "Restaurant Zerhoun",     "image": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", "location": "Medina"},
        ],
        "activities": [
            {"name": "Andalusian Medina Tour",  "image": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", "location": "UNESCO Medina"},
            {"name": "Archaeological Museum",   "image": "https://images.unsplash.com/photo-1582907462025-3e5a1c7b0c4c?w=800&q=80", "location": "City Centre"},
            {"name": "Cabo Negro Beach",        "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", "location": "Cabo Negro"},
        ],
    },
}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/search")
async def search_places(
    city: str = Query("Marrakech", description="City name"),
    type: str = Query("experiences", description="food | hotels | experiences"),
):
    """
    Fetches live place data from the Foursquare API.
    Falls back to MOCK_DATA if the key is missing or the API returns no results.
    """
    clean_city = city.strip().title()
    clean_type = type.strip().lower()
    category   = TYPE_MAP.get(clean_type, "activities")

    logger.debug("[places] /search city=%r type=%r → category=%r", clean_city, clean_type, category)

    # ── Transport: always served from mock data (no FSQ category) ──
    if category == "transport":
        items = MOCK_DATA.get(clean_city, {}).get("transport", [])
        return items

    # ── Foursquare category IDs ──
    FSQ_CATEGORIES: dict[str, str] = {
        "restaurants": "13065",   # Restaurants (top-level)
        "hotels":      "19014",   # Hotels
        "activities":  "16000",   # Landmarks & Outdoors
    }
    fsq_category_id = FSQ_CATEGORIES.get(category, "16000")

    # ── Read API key ──
    fsq_key = os.getenv("FSQ_API_KEY", "").strip()
    if not fsq_key:
        logger.warning("[places] FSQ_API_KEY missing — falling back to mock data.")
        return _serve_mock(clean_city, category)

    # ── Call Foursquare Places API v3 ──
    url = "https://api.foursquare.com/v3/places/search"
    params = {
        "near":        f"{clean_city}, Morocco",
        "categories":  fsq_category_id,
        "limit":       6,
        "fields":      "name,location,rating,description",
    }
    headers = {
        "Authorization": fsq_key,
        "Accept":        "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as exc:
        logger.warning("[places] Foursquare HTTP error %s: %s", exc.response.status_code, exc.response.text)
        return _serve_mock(clean_city, category)
    except Exception as exc:
        logger.exception("[places] Foursquare request failed: %s", exc)
        return _serve_mock(clean_city, category)

    results = data.get("results", [])
    if not results:
        logger.info("[places] Foursquare returned 0 results for %r — falling back to mock.", clean_city)
        return _serve_mock(clean_city, category)

    # ── Standardise response ──
    parsed = []
    for place in results:
        loc = place.get("location", {})
        address_parts = filter(None, [
            loc.get("address"),
            loc.get("locality") or clean_city,
            "Morocco",
        ])
        parsed.append({
            "name":        place.get("name", "Unknown"),
            "description": place.get("description") or f"{category.capitalize()} in {clean_city}",
            "address":     ", ".join(address_parts),
            "rating":      str(place.get("rating", "N/A")),
            "image":       None,  # FSQ free tier does not include photos in this endpoint
        })

    logger.info("[places] Foursquare returned %d results for %r.", len(parsed), clean_city)
    return parsed


def _serve_mock(city: str, category: str) -> list:
    """Return mock data formatted as the standardized response shape.

    IMPORTANT: All external Unsplash image URLs are intentionally stripped here.
    We return None for image so the frontend FallbackImage component will display
    the real local static city image instead of random internet photos.
    """
    city_slug = city.lower().replace(" ", "-")
    city_image = f"/static/images/{city_slug}.jpg"
    items = MOCK_DATA.get(city, {}).get(category, [])
    return [
        {
            "name":        item["name"],
            "description": f"{category.capitalize()} in {city}",
            "address":     f"{item.get('location', city)}, {city}, Morocco",
            "rating":      "N/A",
            "image":       city_image,   # use real local city image — never Unsplash
        }
        for item in items
    ]


@router.get("/city")
async def get_city_places(
    city: str = Query(..., description="City name"),
):
    """
    Returns {city, hotels, restaurants, activities} — all categories at once.
    """
    clean_city = city.strip().title()
    logger.debug("[places] /city requested for: %r", clean_city)

    city_data = MOCK_DATA.get(clean_city, {})
    city_slug = clean_city.lower().replace(" ", "-")
    city_image = f"/static/images/{city_slug}.jpg"

    def _format(items: list, cat: str) -> list:
        return [
            {
                "name":    item["name"],
                "address": f"{item.get('location', clean_city)}, {clean_city}, Morocco",
                "image":   city_image,   # real local static image — never Unsplash
            }
            for item in items
        ]

    return {
        "city":        clean_city,
        "hotels":      _format(city_data.get("hotels", []),      "hotels"),
        "restaurants": _format(city_data.get("restaurants", []), "restaurants"),
        "activities":  _format(city_data.get("activities", []),  "activities"),
    }