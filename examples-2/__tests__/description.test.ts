describe('check description', () => {
  it('html description', () => {
    reporter.descriptionHtml(
      '<h1>Test about desc</h1></br><h2>Heading2</h2><p>some teext</p>',
    );
  });

  it('one line description', () => {
    reporter.description('Some text');
  });
  it('one line markdown description', () => {
    reporter.description('Some **strong** text');
  });

  it('multiline markdown description (not work)', () => {
    reporter.description('one line\nsecond line </br>');
  });

  it('multiline description (no markdown)', () => {
    reporter.description(`
      asdasd
      asdasd
      asd
      __tests__
      `);
  });
});
