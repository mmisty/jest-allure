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
import { types } from 'util';

enum SpecStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  BROKEN = 'broken',
  PENDING = 'pending',
  DISABLED = 'disabled',
  EXCLUDED = 'excluded',
  TODO = 'todo',
}

export class AllureImpl extends Allure {
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
  get currentGroup(): AllureGroup {
    if (this.runningGroup === null) {
      throw new Error('No active group');
    }

    return this.runningGroup;
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
    this.groupStack.push(this.currentGroup);
  }

  startTest(name?: string) {
    this.runningTest = this.currentGroup.startTest(name);
  }

  endTest(spec: any) {
    if (spec.status === SpecStatus.PASSED) {
      this.currentTest.status = Status.PASSED;
      this.currentTest.stage = Stage.FINISHED;
    }

    if (spec.status === SpecStatus.BROKEN) {
      this.currentTest.status = Status.BROKEN;
      this.currentTest.stage = Stage.FINISHED;
    }

    if (spec.status === SpecStatus.FAILED) {
      this.currentTest.status = Status.FAILED;
      this.currentTest.stage = Stage.FINISHED;
    }

    if (
      spec.status === SpecStatus.PENDING ||
      spec.status === SpecStatus.DISABLED ||
      spec.status === SpecStatus.EXCLUDED ||
      spec.status === SpecStatus.TODO
    ) {
      this.currentTest.status = Status.SKIPPED;
      this.currentTest.stage = Stage.PENDING;
      this.currentTest.detailsMessage = spec.pendingReason || 'Suite disabled';
    }

    // Capture exceptions
    const exceptionInfo =
      this.findMessageAboutThrow(spec.failedExpectations) ||
      this.findAnyError(spec.failedExpectations);

    if (exceptionInfo !== null && typeof exceptionInfo.message === 'string') {
      let { message } = exceptionInfo;

      message = stripAnsi(message);

      this.currentTest.detailsMessage = message;

      if (exceptionInfo.stack && typeof exceptionInfo.stack === 'string') {
        let { stack } = exceptionInfo;

        stack = stripAnsi(stack);
        stack = stack.replace(message, '');

        this.currentTest.detailsTrace = stack;
      }
    }
    const relativePath = relative(process.cwd(), spec.testPath);
    this.currentTest.addParameter('Test Path', relativePath);
    this.currentTest.fullName = spec.fullName;

    this.applyGroupping();
    this.currentTest.addLabel(LabelName.PACKAGE, relativePath);

    this.currentTest.endTest();
  }

  /*addIssue(url: string, name: string, type?: string) {
        this.issue(name, url);
    }

    addTms(url: string, name?: string) {
        this.tms(name, url);
    }
*/

  private applyGroupping() {
    const groups = this.groupNameStack;
    if (groups.length > 0) {
      this.parentSuite(groups[0]);
    }

    if (groups.length > 1) {
      this.suite(groups[1]);
    }

    if (groups.length > 2) {
      this.subSuite(groups.slice(2).join(' > '));
    }
  }

  writeCategoriesDefinitions(categories: Category[]) {
    super.writeCategoriesDefinitions(categories);
  }

  endGroup() {
    if (!this.currentGroup) {
      throw new Error('No runningGroup');
    }

    this.runtime.writeGroup({
      name: this.currentGroup.name,
      uuid: this.currentGroup.uuid,
      befores: [],
      afters: [],
      children: [],
    });
    this.groupStack.pop();
    this.groupNameStack.pop();
    this.currentGroup.endGroup();
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

    this.currentTest.addAttachment(name, type, file);
  }
}
