module.exports = {
  extends: [
    "react-app",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "plugin:react-hooks/recommended"
  ],
  settings: {
    react: {
      version: "999.999.999"
    }
  },
  rules: {
    "react/react-in-jsx-scope": "off"
  }
};
