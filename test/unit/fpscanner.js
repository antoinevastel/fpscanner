import fpscanner from '../../src/fpscanner';

describe('fpscanner', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(fpscanner, 'greet');
      fpscanner.greet();
    });

    it('should have been run once', () => {
      expect(fpscanner.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(fpscanner.greet).to.have.always.returned('hello');
    });
  });
});
