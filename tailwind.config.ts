import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Aptos",
          "Segoe UI",
          "Arial",
          "sans-serif"
        ]
      },
      colors: {
        // Dark Purple Galaxy Theme
        "galaxy-950": "#0a0314",
        "galaxy-900": "#0f051c",
        "galaxy-800": "#1a0f35",
        "galaxy-700": "#2d1b4e",
        "galaxy-600": "#3d2563",
        "galaxy-500": "#6d28d9",
        "galaxy-400": "#7c3aed",
        "galaxy-300": "#a78bfa",
        "galaxy-200": "#c4b5fd",
        "galaxy-100": "#ede9fe",
        "galaxy-accent": "#d946ef",
        "galaxy-light": "#f5f3ff",
        "text-primary": "#f8f6ff",
        "text-secondary": "#d8d4ff",
        "text-muted": "#9492b3",
        paper: "#0a0314",
        surface: "#1a0f35",
        ink: "#f8f6ff",
        muted: "#9492b3",
        teal: "#06b6d4",
        amber: "#f59e0b",
        violet: "#d946ef"
      },
      backgroundImage: {
        "gradient-galaxy": "linear-gradient(135deg, #0a0314 0%, #1a0f35 50%, #2d1b4e 100%)",
        "gradient-purple": "linear-gradient(135deg, #6d28d9 0%, #a855f7 50%, #d946ef 100%)"
      }
    }
  },
  plugins: []
};

export default config;
