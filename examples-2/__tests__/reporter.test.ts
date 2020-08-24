import { Label, Severity } from '../../src/Reporter';

describe('reporter-suite', () => {
  it('sim', () => {
    //reporter.step('expect? ', () => expect(10).toBe(10));
    expect(10).toBe(10);
    reporter.startStep('sdfsdf');
    reporter.addLabel(Label.PACKAGE, 'some package');
    reporter.addLabel(Label.AS_ID, 'IDDDD');
    reporter.addEnvironment({ bvdd: 'sfsd' });
    reporter.addLink('http://test.com', 'BBB', 'type mmm');
    reporter.addLink('http://test.com', 'BBB', 'type 2');
    reporter.addIssue('http://test.com', 'BBB');
    reporter.addTms('http://test.com', 'BBB');
    reporter.severity(Severity.Blocker);
    //reporter.description('SOME DESC');
    reporter.description('Some desc 1 ');
    reporter.tag('#testRunnerTag');
    reporter.tag('#testRunnerTag2');
  });

  it('sim 2', () => {
    reporter.step('expect? ', () => expect(10).toBe(10));
    reporter.startStep('sdfsdf');
    reporter.descriptionHtml('</br></br><h1>SSASASAS</h1>');
    reporter.descriptionHtml('</br></br><h1>SSASASAS4241421</h1>');
    expect(10).toBe(10);
  });
});
