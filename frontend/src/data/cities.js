import { IMAGES } from '../config/images';

export const cities = [
  {
    id: 'marrakech',
    name: 'Marrakech',
    description: 'The vibrant Red City, known for its bustling souks, beautiful palaces, and lush gardens.',
    imageUrl: IMAGES.cityMarrakech,
    topAttractions: ['Jemaa el-Fnaa', 'Majorelle Garden', 'Bahia Palace'],
    bestHotels: ['La Mamounia', 'Royal Mansour', 'El Fenn']
  },
  {
    id: 'fez',
    name: 'Fez',
    description: 'The cultural and spiritual center of Morocco, featuring the world\'s oldest university and a massive ancient medina.',
    imageUrl: IMAGES.cityFez,
    topAttractions: ['Chouara Tannery', 'Bou Inania Madrasa', 'Fes el Bali'],
    bestHotels: ['Riad Fes', 'Hotel Sahrai', 'Karawan Riad']
  },
  {
    id: 'chefchaouen',
    name: 'Chefchaouen',
    description: 'The Blue Pearl of Morocco, nestled in the Rif Mountains with its striking blue-washed streets and relaxed atmosphere.',
    imageUrl: IMAGES.cityChefchaouen,
    topAttractions: ['Kasbah Museum', 'Ras Elma', 'Spanish Mosque'],
    bestHotels: ['Lina Ryad & Spa', 'Dar Echchaouen', 'Riad Cherifa']
  },
  {
    id: 'casablanca',
    name: 'Casablanca',
    description: 'Morocco\'s modern metropolis and economic hub, blending stunning Art Deco architecture with contemporary lifestyle.',
    imageUrl: IMAGES.cityCasablanca,
    topAttractions: ['Hassan II Mosque', 'Corniche', 'Morocco Mall'],
    bestHotels: ['Four Seasons', 'Hyatt Regency', 'Le Doge']
  }
];
