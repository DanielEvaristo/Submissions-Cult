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
        // Strict Cult Machine Palette
        black: "#0A0A0A",
        white: "#FFFFFF",
        "cult-yellow": "#F5E000",
        
        // Semantic overrides for the platform
        bg: {
          DEFAULT: "#0A0A0A", // Black base for dark mode
          surface: "#111111",
          elevated: "#1A1A1A",
          light: "#FFFFFF",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.1)", // Subtle white borders
          subtle: "rgba(255,255,255,0.05)",
          hover: "rgba(255,255,255,0.2)",
          black: "#000000",
        },
        "cm-text": {
          primary: "#FFFFFF",
          secondary: "rgba(255,255,255,0.6)",
          muted: "rgba(255,255,255,0.4)",
          inverted: "#0A0A0A",
        },
        accent: {
          red: "#FF4444",
          yellow: "#F5E000",
        },
        ok: "#00FF00",
        warn: "#F5E000", 
        danger: "#FF0000",
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "0",
      },
      borderWidth: {
        DEFAULT: "1px",
        "2": "2px",
        "3": "3px",
        "4": "4px",
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
