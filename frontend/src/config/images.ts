/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRAL IMAGE CONFIGURATION - SMART MOROCCO (FINAL VERSION)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const IMAGES = {

  // ── 1. التصاور الكبار (Hero Backgrounds) ──
  homeHero: '/images/hero-bg.jpg',       // خلفية مسجد الحسن الثاني
  aboutHero: '/images/about-hero.jpg',   // خلفية صفحة About Us
  placeholderCity: '/images/placeholder-city.jpg',

  // ── 2. الكارطات اللي كيطيرو فـ الجناب (Floating Grid) ──
  card1: '/images/about-riad.jpg',
  card2: '/images/about-chefchaouen.jpg',
  card3: '/images/about-camel.jpg',
  card4: '/images/about-mint-tea.jpg',
  card5: '/images/about-souk.jpg',
  card6: '/images/about-atlas.jpg',
  card7: '/images/about-mosque.jpg',
  card8: '/images/about-tagine.jpg',

  // ── 3. الميديا والطقس (Media & Weather) ──
  weatherSky: '/images/weather-sky.jpg',
  weatherVideo: '/images/weather-bg.mp4',
  promoVideo: '/videos/promo-morocco.mp4',

  // ── 4. الرحلات والأنشطة (The 8 Tours/Experiences) ──
  // هادو هما الـ 8 اللي عندك فـ السيت
  expQuad: '/images/exp-quad.jpg',
  expSurf: '/images/exp-surf.jpg',
  expSouk: '/images/exp-souk.jpg',
  expCooking: '/images/exp-cooking.jpg',
  expHammam: '/images/exp-hammam.jpg',
  expBalloon: '/images/exp-balloon.jpg',
  expHike: '/images/exp-hike.jpg',
  expCamel: '/images/exp-camel.jpg',

  // ── 5. الشات (Chat Bot) ──
  chatBotFallback: '/images/chat-bot-fallback.jpg',

} as const;

export type ImageKey = keyof typeof IMAGES;