/**
 * Jest Setup File
 * Runs before each test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.BASE_URL = 'https://seasalt.ai';

// Global test timeout
jest.setTimeout(10000);

// Console warnings as errors in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  originalWarn(...args);
  throw new Error('Console warning in test: ' + args.join(' '));
};
