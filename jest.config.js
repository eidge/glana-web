module.exports = {
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  moduleDirectories: [__dirname, "node_modules"],
  setupFilesAfterEnv: ["<rootDir>/config/jest/setupTests.js"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transform: {
    "^.+\\.(js|jsx|tsx)$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.(ts)$": "ts-jest",
    "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(glana)/.*)",
    "^.+\\.module\\.(css|sass|scss)$"
  ],
  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy"
  }
};
