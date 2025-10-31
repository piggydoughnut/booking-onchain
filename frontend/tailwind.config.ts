import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Times New Roman"', "serif"],
        display: ['"Cormorant Garamond"', '"Playfair Display"', "serif"],
      },
      colors: {
        border: "#8B7355",
        input: "#B8A082",
        ring: "#D4AF37",
        background: "#F5F0E8",
        foreground: "#2C1810",
        primary: {
          DEFAULT: "#6B2C2C",
          foreground: "#F5F0E8",
        },
        secondary: {
          DEFAULT: "#4A5D23",
          foreground: "#F5F0E8",
        },
        accent: {
          DEFAULT: "#D4AF37",
          foreground: "#2C1810",
        },
        burgundy: {
          DEFAULT: "#6B2C2C",
          light: "#8B4A4A",
          dark: "#4A1F1F",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E5C158",
          dark: "#B8941F",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          light: "#FFFBF5",
          dark: "#E8DFD4",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        victorian:
          "0 4px 6px -1px rgba(44, 24, 16, 0.1), 0 2px 4px -1px rgba(44, 24, 16, 0.06), inset 0 0 0 1px rgba(212, 175, 55, 0.1)",
        "victorian-lg":
          "0 10px 15px -3px rgba(44, 24, 16, 0.1), 0 4px 6px -2px rgba(44, 24, 16, 0.05), inset 0 0 0 1px rgba(212, 175, 55, 0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
