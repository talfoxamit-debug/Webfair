import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Deep purple / indigo, near-black backgrounds
        ink: {
          DEFAULT: "#1A0F2E", // page background (deepest)
          800: "#0F0A1F",
          700: "#140C28",
          600: "#1A1030", // card / panel
          500: "#241640", // raised card
          400: "#2E1C50",
        },
        // Electric chartreuse / lime — the single accent
        lime: {
          DEFAULT: "#CBFF3C",
          400: "#D6FF3E",
          500: "#C0F52F",
          600: "#A8E016",
        },
        // Violet used in the pricing bar + glows
        violet: {
          700: "#4C1D95",
          600: "#5B21B6",
          500: "#7C3AED",
          400: "#8B5CF6",
        },
        // Warm→cool gradient stops used in the abstract hero visual
        flare: {
          orange: "#FF7A18",
          red: "#FF2D6B",
          purple: "#A21CE0",
          blue: "#2E6BFF",
        },
      },
      fontFamily: {
        // Poster/display face — self-hosted Anton, falls back to condensed
        // system faces only if the woff2 ever fails to load.
        display: ["Anton", "Haettenschweiler", "Impact", "sans-serif"],
        // Clean UI/body face — the native Apple system font (San Francisco) on
        // Apple devices, graceful platform equivalents everywhere else.
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        "glow-lime": "0 0 40px -8px rgba(203,255,60,0.45)",
        "glow-violet": "0 0 60px -10px rgba(124,58,237,0.5)",
        card: "0 20px 50px -20px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        blink: {
          "0%, 45%, 100%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(-22px, -10px, 0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float-slow 10s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        drift: "drift 9s ease-in-out infinite",
        marquee: "marquee 26s linear infinite",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
