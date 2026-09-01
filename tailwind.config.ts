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
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1rem' }],
        xs: ['0.84rem', { lineHeight: '1.3rem' }],
        sm: ['0.96rem', { lineHeight: '1.45rem' }],
        base: ['1.08rem', { lineHeight: '1.7rem' }],
        lg: ['1.22rem', { lineHeight: '1.8rem' }],
        xl: ['1.35rem', { lineHeight: '1.9rem' }],
        '2xl': ['1.68rem', { lineHeight: '2.15rem' }],
        '3xl': ['2.1rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.65rem', { lineHeight: '3rem' }],
        '5xl': ['3.4rem', { lineHeight: '1.15' }],
        '6xl': ['4.2rem', { lineHeight: '1.1' }],
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
