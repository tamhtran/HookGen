/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Setup dotenv to load environment variables
  setupFilesAfterEnv: ['./jest.setup.js'],
  // Module name mapper to handle '@/' path aliases like in tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Optional: Increase test timeout if OpenAI calls are slow
  testTimeout: 30000, // 30 seconds
}; 