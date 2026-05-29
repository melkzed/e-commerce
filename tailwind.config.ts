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
        paper: "#f7f2e8",
        surface: "#fffaf1",
        ink: "#151712",
        muted: "#716c61",
        teal: "#0f766e",
        amber: "#b45309",
        violet: "#7c3aed"
      }
    }
  },
  plugins: []
};

export default config;
