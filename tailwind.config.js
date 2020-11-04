module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: [
    "./src/**/*.css",
    "./src/**/*.jsx",
    "./src/**/*.tsx",
    "./pages/**/*.tsx",
  ],
  theme: {
    inset: {
      "0": 0,
      auto: "auto",
      full: "100%",
    },
    cursor: {
      auto: "auto",
      default: "default",
      pointer: "pointer",
      wait: "wait",
      text: "text",
      move: "move",
      "not-allowed": "not-allowed",
      crosshair: "crosshair",
      "zoom-in": "zoom-in",
      crosshair: "crosshair",
    },
    extend: {},
  },
  variants: {},
  plugins: [],
};
