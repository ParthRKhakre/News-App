/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        mist: "#F8FAFC",
        fake: "#EF4444",
        real: "#22C55E",
        ember: "#F97316",
        sand: "#FFF7ED"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"]
      },
      boxShadow: {
        card: "0 25px 60px rgba(15, 23, 42, 0.16)"
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(249,115,22,0.2), transparent 36%), radial-gradient(circle at bottom right, rgba(16,24,40,0.14), transparent 42%)"
      }
    }
  },
  plugins: []
};
