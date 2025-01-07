import assert from 'assert';
import Module from 'module';
import path from 'path';
import url from 'url';
import commonjs from '@rollup/plugin-commonjs';
import * as getTS from 'get-tsconfig-compat';
import home from 'homedir-polyfill';
import removeBindings from '../lib/removeBindings.cjs';

// @ts-ignore
import swc, { ensureBindingsSync } from 'ts-swc-rollup-plugin';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const input = path.join(DATA_DIR, 'src', 'index.ts');

describe('plugin', () => {
  it('no overrides', async () => {
    removeBindings('rollup', '@rollup/rollup-');
    ensureBindingsSync();
    const rollup = _require('rollup').rollup;
    const bundle = await rollup({
      input,
      plugins: [commonjs({ extensions: ['.cts'] }), swc({ cwd: DATA_DIR })],
    });
    const res = await bundle.generate({ exports: 'auto' });
    assert.ok(res.output[0].code.indexOf('function swc(options = {})') >= 0, 'swc function');
    assert.ok(res.output[0].code.indexOf('export { swc as default }') >= 0, 'esm exports');
  });

  it('option tsconfig tsconfig.es5.json', async () => {
    const rollup = _require('rollup').rollup;
    const bundle = await rollup({
      input,
      plugins: [commonjs({ extensions: ['.cts'] }), swc({ cwd: DATA_DIR, tsconfig: 'tsconfig.es5.json' })],
    });
    const res = await bundle.generate({ exports: 'auto' });
    assert.ok(res.output[0].code.indexOf('function swc()') >= 0, 'swc function');
    assert.ok(res.output[0].code.indexOf('export { swc as default }') >= 0, 'esm exports');
  });

  it('option tsconfig loaded', async () => {
    const tsconfig = getTS.getTsconfig(DATA_DIR);
    tsconfig.config.compilerOptions = { ...tsconfig.config.compilerOptions, target: 'ES5', module: 'commonjs' };

    const rollup = _require('rollup').rollup;
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
