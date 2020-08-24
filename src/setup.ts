import { IAllureConfig } from 'allure-js-commons';
import { Reporter } from './Reporter';

// todo config
export function registerAllureReporter() {
  const config = {
    allureConfig: {
      resultsDir: 'allure-results',
    },
  };

  const reporter = ((global as any).reporter = new Reporter(config));
  (jasmine as any).getEnv().addReporter(reporter);
}

registerAllureReporter();

declare global {
  export const reporter: Reporter;
}
