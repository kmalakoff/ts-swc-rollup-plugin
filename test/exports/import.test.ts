import assert from 'assert';

// @ts-ignore
import swc from 'ts-swc-rollup-plugin';

describe('exports .ts', () => {
  it('swc', () => {
    assert.equal(typeof swc, 'function');
  });
});
