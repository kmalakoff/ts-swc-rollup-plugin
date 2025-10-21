import assert from 'assert';

import plugin from 'ts-swc-rollup-plugin';

describe('exports .ts', () => {
  it('swc', () => {
    assert.equal(typeof plugin, 'function');
    const swc = plugin();
    assert.equal(typeof swc.transform, 'function');
    assert.equal(typeof swc.resolveId, 'function');
  });
});
