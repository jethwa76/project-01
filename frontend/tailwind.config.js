/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#14B8A6",
        accent: "#F59E0B",
        canvas: "#F8FAFC",
        ink: "#0F172A"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};
