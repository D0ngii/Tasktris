/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#363636",
        primary: "#161622",
        secondary: {
          gray: "#788E9A",
          green: "#AFE1AF",
          lgray: "#444D51",
          blue: "#7FCCF2",
          100: "#FF9001",
          200: "#FF8E01",
          new: "#79878E",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
        pnew: ["SuperPixel", "sans-serif"],
        mine: ["Minecraft", "sans-serif"],
        retro: ["Retro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
