import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ff7a00", // Primary Logo Brand Orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          DEFAULT: "#ff7a00",
        },
        surface: {
          DEFAULT: "#121215",
          muted: "#18181c",
          elevated: "#222228",
          card: "#151519",
          border: "#27272f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(255, 122, 0, 0.35)",
        "glow-lg": "0 0 40px -5px rgba(255, 122, 0, 0.5)",
      },
      animation: {
        "shutter-spin": "spin 20s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
