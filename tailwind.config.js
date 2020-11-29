const colors = require("tailwindcss/colors");

module.exports = {
  purge: [
    "./src/**/*.css",
    "./src/**/*.jsx",
    "./src/**/*.tsx",
    "./pages/**/*.tsx",
  ],
  darkMode: false,
  theme: {
    colors: {
      gray: colors.blueGray,
      white: colors.white,
      black: colors.black,
      primary: { ...colors.teal, DEFAULT: colors.teal["500"] },
    },
    extend: {
      cursor: {
        crosshair: "crosshair",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
