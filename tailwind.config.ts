import type { Config } from "tailwindcss";

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
        accent: "#f97316",
        // ShadCN-compatible aliases — makes @apply border-border / bg-background / text-foreground valid
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
  plugins: [],
};

export default config;
