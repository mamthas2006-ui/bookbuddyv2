/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F52BA",
        secondary: "#0077B6",
        accent: "#00B4D8",
        bg: "#F5FBFF",
        cardbg: "#FFFFFF",
        textdark: "#1A202C",
        textmuted: "#5A6B7A",
        success: "#38B000",
        warning: "#F9C74F",
        error: "#E63946",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
      },
      backgroundImage: {
        ocean: "linear-gradient(135deg, #0F52BA 0%, #0077B6 55%, #00B4D8 100%)",
      },
      keyframes: {
        drift: {
          "0%,100%": { transform: "translate(0,0)" },
          "33%": { transform: "translate(14px,-18px)" },
          "66%": { transform: "translate(-10px,10px)" },
        },
      },
      animation: {
        drift: "drift 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
