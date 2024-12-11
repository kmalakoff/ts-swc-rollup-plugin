import assert from 'assert';
import swc from 'ts-swc-rollup-plugin';

describe('exports .mjs', () => {
  it('swc', () => {
    assert.equal(typeof swc, 'function');
  });
});
