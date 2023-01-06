module.exports = {
  reactStrictMode: true,
  env: {
    rollbarClientToken: process.env.ROLLBAR_CLIENT_TOKEN,
    noTiles: process.env.NO_TILES,
  },
  transpilePackages: ["glana"],
};
