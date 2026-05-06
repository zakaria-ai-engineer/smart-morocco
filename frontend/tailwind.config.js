/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        morocco: {
          primary: "#0B1C2C",
          secondary: "#1E3A5F",
          accent: "#D4AF37",
          dark: "#000000",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        blink: {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.35" },
          "40%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.7s ease-out both",
        "fade-in": "fadeIn 0.6s ease-out both",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 1.8s infinite",
        "blink": "blink 1.1s infinite",
      },
      boxShadow: {
        gold: "0 0 30px rgba(212,175,55,0.25)",
        "gold-lg": "0 0 60px rgba(212,175,55,0.35)",
        glass: "0 8px 32px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
