// jest.config.ts
import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['dist', 'mocks', 'integration'],
  collectCoverage: true,
  collectCoverageFrom: ['./test/*.ts'],
  testEnvironment: 'node',
  coverageReporters: ['json', 'lcov', 'text', 'clover'], // "text-summary"
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;
