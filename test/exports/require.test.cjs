const assert = require('assert');
const { swc } = require('ts-swc-rollup-plugin');

describe('exports .ts', () => {
  it('swc', () => {
    assert.equal(typeof swc, 'function');
  });
});
