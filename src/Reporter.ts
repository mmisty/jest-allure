import Allure, {
  AllureRuntime,
  ContentType,
  LabelName,
  StepInterface,
} from 'allure-js-commons';
import { AllureImpl } from './AllureImpl';
import { relative } from 'path';
import { IAllureConfig } from 'allure-js-commons/dist/src/AllureConfig';

export const Label = LabelName;

export enum Status {
  Passed = 'passed',
  Pending = 'pending',
  Skipped = 'skipped',
  Failed = 'failed',
  Broken = 'broken',
}

export enum Severity {
  Blocker = 'blocker',
  Critical = 'critical',
  Normal = 'normal',
  Minor = 'minor',
  Trivial = 'trivial',
}

declare namespace jasmine {
  function getEnv(): any;
  interface CustomReporter {
    jasmineStarted?(suiteInfo: any): void;
    suiteStarted?(result: CustomReporterResult): void;
    specStarted?(result: CustomReporterResult): void;
    specDone?(result: CustomReporterResult): void;
    suiteDone?(result: CustomReporterResult): void;
    jasmineDone?(runDetails: any): void;
  }
  interface CustomReporterResult {
    description: string;
    failedExpectations?: any[];
    fullName: string;
    id: string;
    passedExpectations?: any[];
    pendingReason?: string;
    status?: string;
  }
}

export interface ReporterApi {
  description(description: string): void;
  tag(name: string): void;
}
export class Reporter implements jasmine.CustomReporter, ReporterApi {
  private allure: AllureImpl;

  constructor(config: any) {
    const runtime = new AllureRuntime(config.allureConfig);
    this.allure = new AllureImpl(runtime);
  }

  suiteStarted(suite?: jasmine.CustomReporterResult) {
    if (suite) {
      this.allure.startGroup(suite.fullName);
    } else {
      // case for tests without suite
      this.allure.startGroup(
        relative(process.cwd(), (expect as any).getState().testPath),
      );
    }
  }

  jasmineDone() {}

  suiteDone() {
    this.allure.endGroup();
  }

  specStarted(spec: jasmine.CustomReporterResult) {
    this.allure.startTest(spec.description);
  }

  specDone(spec: jasmine.CustomReporterResult) {
    this.allure.endTest(spec);
  }

  public description(description: string) {
    const desc = this.allure.currentTest.description;
    this.allure.currentTest.description = description;
    return this;
  }

  public descriptionHtml(description: string) {
    const desc = this.allure.currentTest.descriptionHtml;
    this.allure.currentTest.descriptionHtml = !desc
      ? description
      : desc + description;
    return this;
  }

  public severity(severity: Severity) {
    this.addLabel(LabelName.SEVERITY, severity);
    return this;
  }

  public epic(epic: string) {
    this.addLabel('epic', epic);
    return this;
  }

  public feature(feature: string) {
    this.addLabel('feature', feature);
    return this;
  }

  public story(story: string) {
    this.addLabel('story', story);
    return this;
  }

  public testId(testId: string) {
    this.addLabel('testId', testId);
    return this;
  }

  public startStep(name: string) {
    this.allure.currentTest.startStep(name);
    return this;
  }

  public step(name: string, body: (step: StepInterface) => any) {
    this.allure.step(name, body);
    return this;
  }

  // done
  public addEnvironment(envInfo: Record<string, string>) {
    this.allure.writeEnvironmentInfo(envInfo);
    return this;
  }

  public addLink(url: string, name?: string, type?: string) {
    this.allure.currentTest.addLink(url, name, type);
  }
  public addIssue(url: string, name: string) {
    this.allure.issue(name, url);
  }

  public addTms(url: string, name: string) {
    this.allure.tms(name, url);
  }
  public addAttachment(name: string, buffer: any, type: ContentType) {
    this.allure.attachment(name, buffer, type);
    return this;
  }

  public addLabel(name: string, value: string) {
    this.allure.currentTest.addLabel(name, value);
    return this;
  }

  public addPackage(value: string) {
    this.allure.currentTest.addLabel(LabelName.PACKAGE, value);
    return this;
  }

  tag(name: string) {
    this.allure.tag(name);
  }

  public addParameter(name: string, value: string) {
    this.allure.parameter(name, value);
    return this;
  }
}
