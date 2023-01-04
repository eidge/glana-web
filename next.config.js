const withTM = require("next-transpile-modules")(["glana", "ol"]);

module.exports = withTM({
  reactStrictMode: true,
  env: {
    rollbarClientToken: process.env.ROLLBAR_CLIENT_TOKEN,
    noTiles: process.env.NO_TILES,
  },
});
