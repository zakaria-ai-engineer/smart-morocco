import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Cpu, ShieldCheck, Leaf, MapPin, Star, Clock } from 'lucide-react';
import { IMAGES } from '../config/images';
import SafeImage from '../components/SafeImage';

// ── Moroccan image bank — now mapped to local /public/images/ paths ───────────
const IMG = {
  hero: IMAGES.aboutHero,
  card1: IMAGES.card1,
  card2: IMAGES.card2,
  card3: IMAGES.card3,
  card4: IMAGES.card4,
  card5: IMAGES.card5,
  card6: IMAGES.card6,
  card7: IMAGES.card7,
  card8: IMAGES.card8,
};

const floatingImages = [
  { src: IMG.card2, top: '8%', left: '5%', delay: 0 },
  { src: IMG.card1, top: '10%', right: '6%', delay: 1.2 },
  { src: IMG.card5, bottom: '14%', left: '7%', delay: 0.7 },
  { src: IMG.card4, bottom: '16%', right: '5%', delay: 0.4 },
  { src: IMG.card6, top: '43%', left: '0.5%', delay: 1.6 },
  { src: IMG.card3, top: '47%', right: '1.5%', delay: 2.0 },
];

const VALUES = [
  {
    Icon: Users,
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Authentic Connections',
    body: 'We link you directly with local guides, artisans, and family-owned riads so every moment is rooted in the real Morocco — not a tourist script.',
  },
  {
    Icon: Cpu,
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Smart Tech',
    body: 'Our AI itinerary engine adapts in real time — balancing budgets, optimising routes, and surfacing hidden gems that no standard guidebook will ever mention.',
  },
  {
    Icon: ShieldCheck,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Safe Travel',
    body: 'Every operator is verified. 24/7 support and optional group-tracking keep you confident from arrival to departure.',
  },
  {
    Icon: Leaf,
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    title: 'Sustainable Tourism',
    body: "We champion eco-riads, responsible desert camps, and community initiatives that protect Morocco's extraordinary heritage for future generations.",
  },
];

// Reusable fade-in-up variant
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.75, delay },
});

export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden font-sans">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Slow-zoom background image */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('${IMG.hero}')` }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, ease: 'easeOut' }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/80 z-10 pointer-events-none" />

        {/* Floating Moroccan cards — z-20 */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {floatingImages.map((img, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-28 md:w-40 md:h-56 rounded-2xl overflow-hidden
                         bg-white/5 backdrop-blur-xl border border-white/15
                         shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
              style={{ top: img.top, bottom: img.bottom, left: img.left, right: img.right }}
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: img.delay }}
            >
              <SafeImage src={img.src} alt="Morocco" className="w-full h-full object-cover opacity-90" />
            </motion.div>
          ))}
        </div>

        {/* Headline — z-30 */}
        <div className="relative z-30 max-w-4xl px-6 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1 }}
            className="text-6xl md:text-8xl font-black leading-[1.08] drop-shadow-2xl"
          >
            Realize your<br />Moroccan dreams.
          </motion.h1>

          {/* Inline image typography sub-line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9 }}
            className="mt-10 text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-2xl"
          >
            Book the best{' '}
            <span className="inline-block align-middle mx-1.5 w-10 h-10 md:w-12 md:h-12 overflow-hidden
                             rounded-full border border-white/25 shadow-lg flex-shrink-0">
              <SafeImage src={IMG.card1} alt="Riad" className="w-full h-full object-cover" />
            </span>{' '}
            riads, sip{' '}
            <span className="inline-block align-middle mx-1.5 w-10 h-10 md:w-12 md:h-12 overflow-hidden
                             rounded-full border border-white/25 shadow-lg flex-shrink-0">
              <SafeImage src={IMG.card4} alt="Mint Tea" className="w-full h-full object-cover" />
            </span>{' '}
            mint tea, and let AI plan every detail.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-semibold">Scroll</span>
            <div className="w-[1px] h-14 bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ── 2. ZIG-ZAG STORY SECTIONS ──────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto space-y-36">

        {/* ── Section 1 — Find what inspires you (Text left | Image right) ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-24">

          {/* Left: Text */}
          <motion.div {...fadeUp(0)} className="flex-1 min-w-0 space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">01 / Discover</p>
            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              Find what<br />inspires you
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Explore AI-curated ideas for every corner of Morocco — from the powder-blue alleys of
              Chefchaouen and the shifting Saharan dunes to the cedar forests of the Atlas and the
              crashing Atlantic at Essaouira.
            </p>
          </motion.div>

          {/* Right: Single large image */}
          <motion.div {...fadeUp(0.15)} className="flex-1 min-w-0 w-full">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden
                            border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] group">
              <SafeImage
                src={IMG.card2}
                alt="Chefchaouen"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md
                                 border border-white/15 rounded-full px-4 py-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-red-400" />
                  Chefchaouen, Morocco
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Section 2 — Refine your taste (Glass AI card left | Text right) ── */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-24">

          {/* Left: Glassmorphism AI card (replaces phone mockup) */}
          <motion.div {...fadeUp(0)} className="flex-1 min-w-0 w-full">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10
                            shadow-[0_24px_60px_rgba(0,0,0,0.4)] space-y-8">

              {/* Icon header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25
                                flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Smart Morocco AI</p>
                  <h3 className="text-2xl font-bold text-white leading-tight">Smart Itineraries</h3>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/8" />

              {/* Feature rows */}
              {[
                { Icon: MapPin, label: 'Destination', value: 'Marrakech → Merzouga → Fez' },
                { Icon: Clock, label: 'Duration', value: '8 days, 7 nights' },
                { Icon: Star, label: 'Experience', value: 'Luxury · Cultural · Adventure' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10
                                  flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-white truncate">{value}</p>
                  </div>
                </div>
              ))}

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Itinerary completion</span>
                  <span className="text-amber-400 font-bold">87%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: '87%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed">
                Our engine analyses thousands of routes, verified reviews, and real-time pricing so your
                Morocco itinerary is always perfectly balanced.
              </p>
            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div {...fadeUp(0.15)} className="flex-1 min-w-0 space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">02 / Personalize</p>
            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              Refine your<br />taste with AI
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Set your budget, travel style, and dates. Our AI Trip Planner dynamically assembles a
              perfect itinerary — surfacing hidden riads, local souks, and Saharan camps you'd never
              find on your own.
            </p>
          </motion.div>
        </div>

        {/* ── Section 3 — Bring your ideas to life (Text left | Grid right) ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-24">

          {/* Left: Text */}
          <motion.div {...fadeUp(0)} className="flex-1 min-w-0 space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">03 / Experience</p>
            <h2 className="text-5xl md:text-6xl font-black leading-tight">
              Bring your<br />ideas to life
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Go from dreaming to doing. Book verified local guides, reserve authentic riads,
              watch the sun rise over the Sahara, and explore labyrinthine medinas — all from one app.
            </p>
          </motion.div>

          {/* Right: 2-col image grid */}
          <motion.div {...fadeUp(0.15)} className="flex-1 min-w-0 w-full grid grid-cols-2 gap-4 h-[420px] md:h-[500px]">
            {/* Tall left image */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl h-full group">
              <SafeImage
                src={IMG.card5}
                alt="Marrakech Souk"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Two stacked right images */}
            <div className="grid grid-rows-2 gap-4 h-full">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl group">
                <SafeImage
                  src={IMG.card4}
                  alt="Mint Tea Ceremony"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl relative group cursor-pointer">
                <SafeImage
                  src={IMG.card3}
                  alt="Sahara Camel Trek"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center
                                  text-slate-900 font-bold text-lg shadow-xl
                                  -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    ↗
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ── 3. VALUES GRID ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-16 max-w-7xl mx-auto">

        <div className="text-center mb-20">
          <motion.p {...fadeUp(0)} className="text-sm font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
            Our Values
          </motion.p>
          <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-6xl font-black leading-tight">
            A positive place<br />for every traveler.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map(({ Icon, accent, bg, title, body }, i) => (
            <motion.div
              key={title}
              {...fadeUp(i * 0.1)}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-10
                         group hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 shadow-xl"
            >
              <div className={`w-16 h-16 rounded-2xl ${bg} border flex items-center justify-center mb-8
                              group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-8 h-8 ${accent}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{title}</h3>
              <p className="text-slate-400 leading-relaxed text-lg">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. SINGLE BOTTOM CTA — START ───────────────────────────────────── */}
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(220,38,38,0.14),transparent)] pointer-events-none" />
        <div className="absolute inset-0 border-t border-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-10 text-center">
          <motion.p
            {...fadeUp(0)}
            className="text-slate-400 text-xl max-w-md leading-relaxed"
          >
            Every hidden alley, every Saharan sunrise — one click away.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, type: 'spring', stiffness: 110 }}
          >
            <Link
              to="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold
                         text-2xl tracking-widest px-20 py-6 rounded-full
                         transition-transform duration-300 hover:scale-105
                         shadow-2xl shadow-red-600/25"
            >
              START
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
