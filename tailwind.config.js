const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{tsx,jsx,css}", "./pages/**/*.tsx"],
  theme: {
    colors: {
      gray: colors.slate,
      white: colors.white,
      black: colors.black,
      primary: { ...colors.teal, DEFAULT: colors.teal["500"] },
      failure: { ...colors.red, DEFAULT: colors.red["600"] },
      success: { ...colors.green, DEFAULT: colors.green["600"] },
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
