// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import path from 'path';
import url from 'url';
import commonjs from '@rollup/plugin-commonjs';
import * as getTS from 'get-tsconfig-compat';
import home from 'homedir-polyfill';
import { rollup } from 'rollup';

// @ts-ignore
import swc from 'ts-swc-rollup-plugin';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const input = path.join(DATA_DIR, 'src', 'index.ts');

describe('plugin', () => {
  it('no overrides', async () => {
    const bundle = await rollup({
      input,
      plugins: [commonjs({ extensions: ['.cts'] }), swc({ cwd: DATA_DIR })],
    });
    const res = await bundle.generate({ exports: 'auto' });
    assert.ok(res.output[0].code.indexOf('function swc(options = {})') >= 0, 'swc function');
    assert.ok(res.output[0].code.indexOf('export { swc as default }') >= 0, 'esm exports');
  });

  it('option tsconfig tsconfigES5.json', async () => {
    const bundle = await rollup({
      input,
      plugins: [commonjs({ extensions: ['.cts'] }), swc({ cwd: DATA_DIR, tsconfig: 'tsconfigES5.json' })],
    });
    const res = await bundle.generate({ exports: 'auto' });
    assert.ok(res.output[0].code.indexOf('function swc()') >= 0, 'swc function');
    assert.ok(res.output[0].code.indexOf('export { swc as default }') >= 0, 'esm exports');
  });

  it('option tsconfig loaded', async () => {
    const tsconfig = getTS.getTsconfig(DATA_DIR);
    tsconfig.config.compilerOptions = { ...tsconfig.config.compilerOptions, target: 'ES5', module: 'commonjs' };

    const bundle = await rollup({
      input,
      plugins: [commonjs({ extensions: ['.cts'] }), swc({ cwd: DATA_DIR, tsconfig })],
    });
    const res = await bundle.generate({ exports: 'auto' });
    assert.ok(res.output[0].code.indexOf('function swc()') >= 0, 'swc function');
    assert.ok(res.output[0].code.indexOf('Object.defineProperty(exports, "default"') >= 0, 'esm exports');
  });

  describe('errors', () => {
    it('no tsconfig.json', () => {
      try {
        swc({ cwd: home() });
        assert.ok(false, 'this should fail');
      } catch (err) {
        assert.ok(err);
      }
    });
  });
});
