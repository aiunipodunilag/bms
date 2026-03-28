/**
 * fix-css.js
 * Runs before `npm run build` on Vercel.
 * Replaces app/globals.css with a clean version that has no @apply directives,
 * which avoids the PostCSS "class does not exist" error from ShadCN leftovers.
 */

const fs = require("fs");
const path = require("path");

const TARGET = path.join(__dirname, "..", "app", "globals.css");

const CLEAN_CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  background-color: #f9fafb;
  color: #111827;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Inter', system-ui, sans-serif;
}

.text-balance {
  text-wrap: balance;
}

@keyframes scroll-x {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-scroll-x {
  animation: scroll-x 40s linear infinite;
}
`;

fs.writeFileSync(TARGET, CLEAN_CSS, "utf8");
console.log("✓ app/globals.css patched — all @apply directives removed.");
