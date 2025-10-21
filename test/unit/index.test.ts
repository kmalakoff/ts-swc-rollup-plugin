import commonjs from '@rollup/plugin-commonjs';
import assert from 'assert';
import home from 'homedir-polyfill';
import { installSync } from 'install-optional';
import Module from 'module';
import path from 'path';
import loadConfigSync from 'read-tsconfig-sync';
import swc from 'ts-swc-rollup-plugin';
import url from 'url';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const input = path.join(DATA_DIR, 'src', 'index.ts');

describe('plugin', () => {
  before(() => {
    installSync('rollup', `${process.platform}-${process.arch}`);
  });
  it('no overrides', async () => {
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
    const tsconfig = loadConfigSync(DATA_DIR);
    tsconfig.config.compilerOptions = { ...tsconfig.config.compilerOptions, target: 'es5', module: 'commonjs' };

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
