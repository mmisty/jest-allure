module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '((\\.|/)(test|spec))\\.(ts)x?$',
  setupFilesAfterEnv: [
    './config/jest.setup.ts',
    './src/setup.ts',
    //    '../dist/setup'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  reporters: ['jest-allure-mmisty'],
};
