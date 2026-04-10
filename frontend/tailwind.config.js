/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        mist: "#F8FAFC",
        fake: "#DC2626",
        real: "#16A34A",
        ember: "#F97316",
        sand: "#F8FAFC"
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 24px 60px rgba(15, 23, 42, 0.12)"
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(37,99,235,0.16), transparent 32%), radial-gradient(circle at top right, rgba(6,182,212,0.12), transparent 20%), radial-gradient(circle at bottom right, rgba(15,23,42,0.08), transparent 38%)"
      }
    }
  },
  plugins: []
};
