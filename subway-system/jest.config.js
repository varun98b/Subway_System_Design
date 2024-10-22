module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ["**/*.test.ts"], // This finds all test files with .test.ts or .test.js
    transform: {
      '^.+\\.ts$': 'ts-jest', // Transforms TypeScript files using ts-jest
    },
  };
  