import {
  Allure,
  AllureRuntime,
  AllureTest,
  StepInterface,
  ContentType,
  Attachment,
  ExecutableItemWrapper,
  Status,
} from "allure-js-commons";
import stripAnsi from "strip-ansi";
import { Reporter } from "./Reporter";
import { relative } from "path";

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
class AllureImpl extends Allure {
  runtime: AllureRuntime;
  private runningTest: AllureTest | null = null;
  public runningExecutable: ExecutableItemWrapper | null = null;
  constructor(runtime: AllureRuntime) {
    super(runtime);
    this.runtime = runtime;
  }

  get currentTest(): AllureTest {
    if (this.runningTest === null) {
      throw new Error("No active test");
    }

    return this.runningTest;
  }

  get currentExecutable(): ExecutableItemWrapper {
    if (this.runningExecutable === null) {
      throw new Error("No active executable");
    }

    return this.runningExecutable;
  }

  public step<T>(name: string, body: (step: StepInterface) => any): any {
    console.log("step:", name);
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
    attachments?: [Attachment]
  ): void {
    console.log("AllureImpl status:", status);

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
      this.allure.suite(suite.fullName);
    } else {
      // case for tests without suite
      this.allure.suite(
        relative(process.cwd(), (expect as any).getState().testPath)
      );
    }
  }

  jasmineDone() {
    // this.allure.suite();
  }

  suiteDone() {
    this.suiteDone();
  }

  specStarted(spec: jasmine.CustomReporterResult) {
    /*if (!this.currentExecutable) {
            this.suiteStarted();
        }
        this.allure..startCase(spec.description);*/
  }

  specDone(spec: jasmine.CustomReporterResult) {
    let error;
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
    }
    //this.allure.run
    //this.allure..endCase(spec.status as jest.Status, error);
  }
}

export function registerAllureReporter() {
  const config = {
    resultsDir: "allure-results",
  };
  const runtime = new AllureRuntime(config);
  const reporter = ((global as any).reporter = new JasmineAllureReporter(
    runtime
  ));
  // const reporter = new JasmineAllureReporter(allure);
  jasmine.getEnv().addReporter(reporter);
}

registerAllureReporter();

declare global {
  export const reporter: Reporter;
}
