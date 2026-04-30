import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f3",
          100: "#dcece3",
          200: "#bbd9ca",
          300: "#8ebea8",
          400: "#5e9d82",
          500: "#3c7e64",
          600: "#2c6450",
          700: "#24503f",
          800: "#1a5c38",
          900: "#163d28",
          950: "#0c2318",
        },
        gold: {
          50: "#fdf9ec",
          100: "#faf0cc",
          200: "#f4df95",
          300: "#edc85a",
          400: "#e6b22e",
          500: "#c9960c",
          600: "#a97a09",
          700: "#875d0b",
          800: "#6f4a10",
          900: "#5e3d13",
        },
        cream: "#faf8f4",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        shake: "shake 0.5s ease-in-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,150,12,0)" },
          "50%": { boxShadow: "0 0 0 8px rgba(201,150,12,0.15)" },
        },
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(26,92,56,0.07)",
        "card-hover": "0 8px 32px 0 rgba(26,92,56,0.15)",
        gold: "0 4px 20px 0 rgba(201,150,12,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
