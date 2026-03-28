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
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        cyan:  { DEFAULT: "#06b6d4", 400: "#22d3ee", 500: "#06b6d4", 300: "#67e8f9" },
        accent: "#06b6d4",
        // ShadCN-compatible aliases + dark glass surface tokens
        border:     "rgba(255,255,255,0.08)",
        background: "#09090f",
        foreground: "#f1f5f9",
        input:      "rgba(255,255,255,0.08)",
        ring:       "#7c3aed",
        glass:      "rgba(255,255,255,0.04)",
        "glass-hover": "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        sans:    ["Space Grotesk", "system-ui", "sans-serif"],
        display: ["Orbitron", "monospace"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
        "gradient-radial-glow":
          "radial-gradient(ellipse at top, rgba(124,58,237,0.15) 0%, transparent 60%)",
      },
      boxShadow: {
        "glow-sm":  "0 0 12px rgba(124,58,237,0.25)",
        "glow":     "0 0 24px rgba(124,58,237,0.35), 0 0 48px rgba(6,182,212,0.1)",
        "glow-lg":  "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(6,182,212,0.2)",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
          "50%":      { boxShadow: "0 0 40px rgba(124,58,237,0.6), 0 0 60px rgba(6,182,212,0.2)" },
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
    // Explicit utilities so @apply works even if JIT doesn't scan CSS files
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".border-border":   { "border-color":      "rgba(255,255,255,0.08)" },
        ".bg-background":   { "background-color":  "#09090f" },
        ".text-foreground": { "color":             "#f1f5f9" },
        ".bg-foreground":   { "background-color":  "#f1f5f9" },
        ".text-background": { "color":             "#09090f" },
        ".ring-ring":       { "--tw-ring-color":   "#7c3aed" },
        ".border-input":    { "border-color":      "rgba(255,255,255,0.08)" },
        // Glass helpers
        ".glass": {
          "background":             "rgba(255,255,255,0.04)",
          "backdrop-filter":        "blur(16px)",
          "-webkit-backdrop-filter":"blur(16px)",
          "border":                 "1px solid rgba(255,255,255,0.08)",
        },
        ".glass-sm": {
          "background":             "rgba(255,255,255,0.03)",
          "backdrop-filter":        "blur(8px)",
          "-webkit-backdrop-filter":"blur(8px)",
          "border":                 "1px solid rgba(255,255,255,0.06)",
        },
        ".gradient-text": {
          "background":                "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)",
          "-webkit-background-clip":   "text",
          "-webkit-text-fill-color":   "transparent",
          "background-clip":           "text",
        },
        ".gradient-border": {
          "border":     "1px solid transparent",
          "background": "linear-gradient(#09090f, #09090f) padding-box, linear-gradient(135deg, #7c3aed, #06b6d4) border-box",
        },
        ".grid-bg": {
          "background-image":
            "linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)",
          "background-size": "48px 48px",
        },
      });
    }),
  ],
};

export default config;
