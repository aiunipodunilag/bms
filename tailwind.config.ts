import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde8ff",
          200: "#c2d4ff",
          300: "#9db5ff",
          400: "#748aff",
          500: "#4f5fff",
          600: "#3b42f5",
          700: "#2f33d8",
          800: "#282cae",
          900: "#252b89",
          950: "#161851",
        },
        accent:     "#f97316",
        border:     "#e5e7eb",
        background: "#f9fafb",
        foreground: "#111827",
        input:      "#e5e7eb",
        ring:       "#4f5fff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  // Force JIT to always generate these classes even if they only appear
  // inside @apply in globals.css (JIT doesn't scan CSS files for class names)
  safelist: [
    "border-border",
    "bg-background",
    "text-foreground",
    "bg-foreground",
    "text-background",
    "ring-ring",
    "border-input",
  ],
  plugins: [
    // Explicitly register the ShadCN-style utility classes so @apply works
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".border-border":  { "border-color":      "#e5e7eb" },
        ".bg-background":  { "background-color":  "#f9fafb" },
        ".text-foreground":{ "color":             "#111827" },
        ".bg-foreground":  { "background-color":  "#111827" },
        ".text-background":{ "color":             "#f9fafb" },
        ".ring-ring":      { "--tw-ring-color":   "#4f5fff" },
        ".border-input":   { "border-color":      "#e5e7eb" },
      });
    }),
  ],
};

export default config;
