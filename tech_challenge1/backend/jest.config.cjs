module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Enable ES modules
  preset: null,
  transform: {},

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Coverage settings
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!jest.config.js',
    '!index.js' // Exclude main entry point from coverage
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Verbose output
  verbose: false,

  // Max workers for CI
  maxWorkers: 1, // Run sequentially to avoid DB conflicts

  // Test timeout
  testTimeout: process.env.CI ? 30000 : 10000,

  // Force exit to prevent hanging
  forceExit: true,

  // Detect open handles in CI
  detectOpenHandles: process.env.CI ? true : false,

  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(mongodb-memory-server)/)'
  ]
};
