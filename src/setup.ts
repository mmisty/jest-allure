import {
  Allure,
  AllureRuntime,
  AllureGroup,
  AllureTest,
  Stage,
  StepInterface,
  ContentType,
  Attachment,
  ExecutableItemWrapper,
  Status,
  Category,
  LabelName,
  TestResultContainer,
} from 'allure-js-commons';
import stripAnsi from 'strip-ansi';
import { Reporter } from './Reporter';
import { relative } from 'path';

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

enum SpecStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  BROKEN = 'broken',
  PENDING = 'pending',
  DISABLED = 'disabled',
  EXCLUDED = 'excluded',
  TODO = 'todo',
}

class AllureImpl extends Allure {
  runtime: AllureRuntime;
  private runningTest: AllureTest | null = null;
  private runningGroup: AllureGroup | null = null;
  public runningExecutable: ExecutableItemWrapper | null = null;
  private groupStack: AllureGroup[] = [];
  private groupNameStack: string[] = [];

  constructor(runtime: AllureRuntime) {
    super(runtime);
    this.runtime = runtime;
  }

  get currentTest(): AllureTest {
    if (this.runningTest === null) {
      throw new Error('No active test');
    }

    return this.runningTest;
  }

  get currentExecutable(): ExecutableItemWrapper {
    if (this.runningExecutable === null) {
      throw new Error('No active executable');
    }

    return this.runningExecutable;
  }

  startGroup(name: string) {
    this.runningGroup = this.runtime.startGroup(name);
    let nameGr = name;

    for (let i = 0; i < this.groupStack.length + 1; i++) {
      if (this.groupStack.length > i) {
        for (let j = 0; j <= i; j++) {
          nameGr = name.replace(this.groupStack[j].name, '');
        }
      }
    }

    this.groupNameStack.push(nameGr);
    this.groupStack.push(this.runningGroup);
  }

  startTest(name?: string) {
    if (!this.runningGroup) {
      throw new Error('No runningGroup');
    }

    this.runningTest = this.runningGroup.startTest(name);
  }
  endTest(spec: any) {
    if (!this.runningTest) {
      throw new Error('No runningTest');
    }

    if (spec.status === SpecStatus.PASSED) {
      this.runningTest.status = Status.PASSED;
      this.runningTest.stage = Stage.FINISHED;
    }

    if (spec.status === SpecStatus.BROKEN) {
      this.runningTest.status = Status.BROKEN;
      this.runningTest.stage = Stage.FINISHED;
    }

    if (spec.status === SpecStatus.FAILED) {
      this.runningTest.status = Status.FAILED;
      this.runningTest.stage = Stage.FINISHED;
    }

    if (
      spec.status === SpecStatus.PENDING ||
      spec.status === SpecStatus.DISABLED ||
      spec.status === SpecStatus.EXCLUDED ||
      spec.status === SpecStatus.TODO
    ) {
      this.runningTest.status = Status.SKIPPED;
      this.runningTest.stage = Stage.PENDING;
      this.runningTest.detailsMessage = spec.pendingReason || 'Suite disabled';
    }

    // Capture exceptions
    const exceptionInfo =
      this.findMessageAboutThrow(spec.failedExpectations) ||
      this.findAnyError(spec.failedExpectations);

    if (exceptionInfo !== null && typeof exceptionInfo.message === 'string') {
      let { message } = exceptionInfo;

      message = message;

      this.runningTest.detailsMessage = message;

      if (exceptionInfo.stack && typeof exceptionInfo.stack === 'string') {
        let { stack } = exceptionInfo;

        stack = stack;
        stack = stack.replace(message, '');

        this.runningTest.detailsTrace = stack;
      }
    }

    this.runningTest.addLink('http://test.com', 'BBB');
    this.runningTest.addLabel('label', 'dsdsd');
    this.runningTest.addParameter('param 1', spec.testPath);
    this.runningTest.addParameter('param 2', '5');
    this.runningTest.addParameter('param 3', 'minydas@ya.ru');
    this.runningTest.fullName = spec.fullName;
    this.feature('asdad');
    this.epic('asdasdsd');
    this.epic('asdasdsd444');

    this.applyGroupping();

    this.issue('issueID', 'http://minydas.ru');
    this.tag('TAGGG');

    this.runningTest.description =
      "desctiption test asdasdasd ```l,;l;l,;l,``` l,sa,s;das\\ndssadfa'";

    this.runningTest.endTest();
  }
  private substractSuiteName(groupStack: string[]): string[] {
    const stack = [...groupStack];
    for (let i = 0; i < groupStack.length; i++) {
      if (i > 0) {
        for (let j = 1; j < i; j++) {
          //stack[i].name = stack[i].name.substr(groupStack[j-1].name.length);
        }
      }
    }
    return stack;
  }

  private applyGroupping() {
    if (!this.runningGroup) {
      throw new Error('no runningGroup');
    }
    const groups = this.substractSuiteName(this.groupNameStack);
    if (groups.length > 0) {
      this.parentSuite(groups[0]);
      //this.runningTest.addLabel(LabelName.PARENT_SUITE, this.groupStack[0].name);
    }

    if (groups.length > 1) {
      this.suite(groups[1]);
      //this.runningTest.addLabel(LabelName.PARENT_SUITE, this.groupStack[0].name);
    }

    if (groups.length > 2) {
      this.subSuite(groups.slice(2).join('>>'));
      // this.runningTest.addLabel(LabelName.SUITE, this.groupStack[1].name);
    }

    if (groups.length > 3) {
      // this.subSuite(groups[3].name)
      //this.runningTest.addLabel(LabelName.SUB_SUITE, this.groupStack[2].name);
    }
  }
  writeCategoriesDefinitions(categories: Category[]) {
    super.writeCategoriesDefinitions(categories);
  }

  endGroup() {
    if (!this.runningGroup) {
      throw new Error('No runningGroup');
    }

    this.runtime.writeGroup({
      name: this.runningGroup.name,
      uuid: this.runningGroup.uuid,
      befores: [],
      afters: [],
      children: [],
    });
    this.groupStack.pop();
    this.groupNameStack.pop();
    this.runningGroup.endGroup();
  }
  private findMessageAboutThrow(expectations?: any[]): any | null {
    for (const expectation of expectations || []) {
      if (expectation.matcherName === '') {
        return expectation;
      }
    }

    return null;
  }

  private findAnyError(expectations?: any[]): any | null {
    expectations = expectations || [];
    if (expectations.length > 0) {
      return expectations[0];
    }

    return null;
  }

  public step<T>(name: string, body: (step: StepInterface) => any): any {
    console.log('step:', name);
    /*const wrappedStep = this.startStep(name);
        let result;

        try {
            result = wrappedStep.run(body);
        } catch (error) {
            wrappedStep.endStep();
            throw error;
        }

        if (isPromise(result)) {
            const promise = result as Promise<any>;
            return promise
                .then(a => {
                    wrappedStep.endStep();
                    return a;
                })
                .catch(error => {
                    wrappedStep.endStep();
                    throw error;
                });
        }

        if (!isPromise(result)) {
            wrappedStep.endStep();
            return result;
        }*/
  }

  public logStep(
    name: string,
    status: Status,
    attachments?: [Attachment],
  ): void {
    console.log('AllureImpl status:', status);

    /*const wrappedStep = this.startStep(name);

        if (attachments) {
            for (const {name, content, type} of attachments) {
                this.attachment(name, content, type);
            }
        }

        wrappedStep.logStep(status);
        wrappedStep.endStep();*/
  }

  public attachment(name: string, content: Buffer | string, type: ContentType) {
    const file = this.runtime.writeAttachment(content, type);

    this.currentExecutable.addAttachment(name, type, file);
  }
}

class JasmineAllureReporter implements jasmine.CustomReporter {
  private allure: AllureImpl;

  constructor(runtime: AllureRuntime) {
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
    /*let error;
    if (spec.status === "pending") {
      error = { message: spec.pendingReason };
    }
    if (spec.status === "disabled") {
      error = { message: "This test was disabled" };
    }
    const failure =
      spec.failedExpectations && spec.failedExpectations.length
        ? spec.failedExpectations[0]
        : undefined;
    if (failure) {
      error = {
        message: stripAnsi(failure.message),
        stack: stripAnsi(failure.stack),
      };
    }*/
    this.allure.endTest(spec);
    //this.allure.run
    //this.allure..endCase(spec.status as jest.Status, error);
  }
}

export function registerAllureReporter() {
  const config = {
    resultsDir: 'allure-results',
  };
  const runtime = new AllureRuntime(config);
  const reporter = ((global as any).reporter = new JasmineAllureReporter(
    runtime,
  ));
  jasmine.getEnv().addReporter(reporter);
}

registerAllureReporter();

declare global {
  export const reporter: Reporter;
}
