// jest.config.js
export default {
    testEnvironment: "node",
    transform: { "^.+\\.js$": "babel-jest" },
    testMatch: ["<rootDir>/tests/**/*.test.js"],
    moduleFileExtensions: ["js", "json", "node"],
    transformIgnorePatterns: [
        "/node_modules/(?!(?:@netlify/blobs)/)"
    ],
    testPathIgnorePatterns: ["/node_modules/"]
};
