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
          DEFAULT: "#0D0D0D",
          surface: "#161616",
          elevated: "#1E1E1E",
        },
        border: {
          DEFAULT: "#2E2E2E",
          subtle: "#222222",
        },
        "cm-text": {
          primary: "#F0EDE6",
          secondary: "#9A9690",
          muted: "#5A5754",
        },
        accent: {
          red: "#E8341C",
          "red-hover": "#CC2D18",
        },
        ok: "#1D9E75",
        warn: "#EF9F27",
        danger: "#E24B4A",
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
