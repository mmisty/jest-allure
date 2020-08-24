import { ContentType } from 'allure-js-commons';

describe('check attachement', () => {
  it('type description', () => {
    const obj = { ff: { ffs: 1, ffds: 2 } };
    const uri = 'http://sdss.com/asdsad';
    const csv = 'hfdfd;dfdfd;\nsdsd;sdsd;';
    const csv2 = 'hfdfd,dfdfd,zsczx\nsdsd,zxzxc,sdsd';
    const csv3 =
      'hfdfd,dfdfd,zsczx,zsczx,zsczx,zsczx\nhfdfd,dfdfd,zsczx,zsczx,zsczx,zsczx\nhfdfd,dfdfd,zsczx,zsczx,zsczx,zsczx';
    reporter.addAttachment('JSON', JSON.stringify(obj), ContentType.JSON);
    reporter.addAttachment('TEXT', JSON.stringify(obj), ContentType.TEXT);
    reporter.addAttachment('csv', csv, ContentType.CSV);
    reporter.addAttachment('csv2', csv2, ContentType.CSV);
    reporter.addAttachment('csv3', csv3, ContentType.CSV);
    reporter.addAttachment('uri', uri, ContentType.URI);
    //reporter.addAttachment('log2', {'ff': {"ffs": 1, "ffds": 2}}, ContentType.TEXT);
  });
});
