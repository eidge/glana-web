module.exports = {
  extends: [
    "react-app",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: [],
  settings: {
    react: {
      version: "999.999.999",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/no-unknown-property": [2, { ignore: ["jsx"] }],
  },
};
