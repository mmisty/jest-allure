describe('simple-suite', () => {
  it('orange', () => {
    expect(10).toBe(10);
  });

  it('lemon-failure', () => {
    expect(10).toBe(9);
  });

  describe('nest', () => {
    it('first-level tomato', () => {
      expect(10).toBe(10);
    });

    describe('cucumber', () => {
      it('more cucmbers ', () => {
        expect(10).toBe(10);
      });
      describe('smaller cucumber', () => {
        it('pickle ', () => {
          expect(10).toBe(10);
        });

        it('blue pickle ', () => {
          expect(10).toBe(10);
        });
      });
    });
  });
});
