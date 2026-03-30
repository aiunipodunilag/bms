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
        // Electric indigo — the premium brand palette
        brand: {
          50:  "#EFEDFD",
          100: "#DDD8FB",
          200: "#BDB3F7",
          300: "#9D8DF3",
          400: "#7D67EF",
          500: "#5B4CF5",
          600: "#4C3DD4",
          700: "#3D2EAD",
          800: "#2D2186",
          900: "#1E165F",
          950: "#0F0B38",
        },
        cyan:  { DEFAULT: "#06b6d4", 400: "#22d3ee", 500: "#06b6d4", 300: "#67e8f9" },
        accent: "#06b6d4",
        // Light-mode semantic tokens
        border:     "rgba(0,0,0,0.07)",
        background: "#F8F9FB",
        foreground: "#0D0E12",
        input:      "rgba(0,0,0,0.07)",
        ring:       "#5B4CF5",
        glass:      "rgba(255,255,255,0.04)",
        "glass-hover": "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Orbitron", "monospace"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #5B4CF5 0%, #06b6d4 100%)",
        "gradient-radial-glow":
          "radial-gradient(ellipse at top, rgba(91,76,245,0.12) 0%, transparent 60%)",
      },
      boxShadow: {
        // Premium layered shadows — soft, low-opacity, realistic depth
        "sm":       "0 1px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "md":       "0 4px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
        "lg":       "0 8px 40px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
        "xl":       "0 20px 60px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)",
        "2xl":      "0 32px 80px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.08)",
        // Indigo glow states — for focus, active, hover lift
        "glow-sm":  "0 0 0 3px rgba(91,76,245,0.10)",
        "glow":     "0 0 0 3px rgba(91,76,245,0.12), 0 8px 32px rgba(91,76,245,0.14)",
        "glow-lg":  "0 0 0 4px rgba(91,76,245,0.15), 0 16px 48px rgba(91,76,245,0.18)",
        // Legacy dark glass shadow (landing page)
        "glass":    "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      animation: {
        "scroll-x":    "scroll-x 40s linear infinite",
        "pulse-glow":  "pulse-glow 3s ease-in-out infinite",
        "float":       "float 4s ease-in-out infinite",
      },
      keyframes: {
        "scroll-x": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 3px rgba(91,76,245,0.10), 0 4px 20px rgba(91,76,245,0.18)" },
          "50%":      { boxShadow: "0 0 0 4px rgba(91,76,245,0.18), 0 8px 36px rgba(91,76,245,0.28)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
    },
  },
  safelist: [
    "border-border", "bg-background", "text-foreground",
    "bg-foreground", "text-background", "ring-ring", "border-input",
  ],
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".border-border":   { "border-color":      "rgba(0,0,0,0.07)" },
        ".bg-background":   { "background-color":  "#F8F9FB" },
        ".text-foreground": { "color":             "#0D0E12" },
        ".bg-foreground":   { "background-color":  "#0D0E12" },
        ".text-background": { "color":             "#F8F9FB" },
        ".ring-ring":       { "--tw-ring-color":   "#5B4CF5" },
        ".border-input":    { "border-color":      "rgba(0,0,0,0.07)" },
        // Dark glass — for landing page only
        ".glass": {
          "background":              "rgba(255,255,255,0.04)",
          "backdrop-filter":         "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          "border":                  "1px solid rgba(255,255,255,0.08)",
        },
        ".glass-sm": {
          "background":              "rgba(255,255,255,0.03)",
          "backdrop-filter":         "blur(8px)",
          "-webkit-backdrop-filter": "blur(8px)",
          "border":                  "1px solid rgba(255,255,255,0.06)",
        },
        // Light glass — for light-mode overlays/dropdowns
        ".glass-light": {
          "background":              "rgba(255,255,255,0.92)",
          "backdrop-filter":         "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          "border":                  "1px solid rgba(0,0,0,0.07)",
        },
        // Gradient text — electric indigo → cyan
        ".gradient-text": {
          "background":              "linear-gradient(135deg, #7D67EF 0%, #06b6d4 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip":         "text",
        },
        ".gradient-border": {
          "border":     "1px solid transparent",
          "background": "linear-gradient(#F8F9FB, #F8F9FB) padding-box, linear-gradient(135deg, #5B4CF5, #06b6d4) border-box",
        },
        // Subtle grid bg — for landing page hero
        ".grid-bg": {
          "background-image":
            "linear-gradient(rgba(91,76,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(91,76,245,0.06) 1px, transparent 1px)",
          "background-size": "48px 48px",
        },
      });
    }),
  ],
};

export default config;
