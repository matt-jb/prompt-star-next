import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/tests/unit/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^server/(.*)$": "<rootDir>/server/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ["server/**/*.ts", "!server/**/*.d.ts", "!**/*.test.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};

export default config;
