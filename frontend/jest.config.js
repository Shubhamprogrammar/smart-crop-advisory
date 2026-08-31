// Jest config for the Next.js frontend ("critical user-flow" unit tests).
// Tests the pure, framework-light pieces of the app shell: the auth store
// and the API-envelope unwrapper. Uses ts-jest with a CommonJS transform
// so the `@/` path alias and TS/graphql-free code run under Node.
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          jsx: "react-jsx",
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
  },
  clearMocks: true,
  verbose: true,
};
