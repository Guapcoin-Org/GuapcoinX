/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        guap: {
          // Explorer-matched gold palette
          gold: "#FFD700",
          "gold-light": "#FFED4E",
          "gold-dark": "#FFAA00",
          // Backgrounds
          black: "#000000",
          "dark-1": "#0A0A0A",
          "dark-2": "#111111",
          "dark-3": "#1A1A1A",
          "dark-4": "#222222",
          // Borders
          border: "rgba(255,255,255,0.05)",
          "border-gold": "rgba(255,215,0,0.2)",
          "border-gold-hover": "rgba(255,215,0,0.4)",
          // Text
          text: "#FFFFFF",
          secondary: "rgba(255,255,255,0.8)",
          muted: "rgba(255,255,255,0.6)",
          dim: "rgba(255,255,255,0.4)",
          placeholder: "rgba(255,255,255,0.3)",
          // Status
          green: "#00FF00",
          orange: "#FFA500",
          red: "#FF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Orbitron", "Inter", "sans-serif"],
        mono: ["Inter", "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FFD700, #FFED4E)",
        "dark-radial": "radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 100%)",
        "gold-line": "linear-gradient(90deg, transparent, #FFD700, transparent)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        float: "float 20s linear infinite",
        spin: "spin 1s linear infinite",
        glow: "glow 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%": { transform: "translateY(100vh) translateX(0)", opacity: "0" },
          "10%": { opacity: "0.3" },
          "90%": { opacity: "0.3" },
          "100%": { transform: "translateY(-100px) translateX(100px)", opacity: "0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,215,0,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255,215,0,0.6)" },
        },
      },
      letterSpacing: {
        brand: "2px",
        wide: "1px",
      },
      boxShadow: {
        gold: "0 0 20px rgba(255,215,0,0.3)",
        "gold-lg": "0 0 40px rgba(255,215,0,0.4)",
      },
    },
  },
  plugins: [],
};
