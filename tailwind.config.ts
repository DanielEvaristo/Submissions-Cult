import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#121212", // Base dark background
          surface: "#1C1C1E", // Slightly elevated for sidebar/main cards
          elevated: "#2C2C2E", // Higher elevation for interactive/hover
        },
        border: {
          DEFAULT: "#3A3A3C", // Clear visible borders
          subtle: "#2C2C2E",  // Soft borders
          hover: "#48484A",   // Border hover state
        },
        "cm-text": {
          primary: "#FAFAFA",   // High contrast white
          secondary: "#A1A1AA", // zinc-400 for secondary text
          muted: "#71717A",     // zinc-500 for muted text (much more legible now)
        },
        accent: {
          red: "#E8341C",
          "red-hover": "#F05641", // Softer hover
        },
        ok: "#10B981",    // emerald-500
        warn: "#F59E0B",  // amber-500
        danger: "#EF4444",// red-500
      },
      fontFamily: {
        mono: ["var(--font-space-mono)", "monospace"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
