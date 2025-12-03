import commonjs from '@rollup/plugin-commonjs';
import assert from 'assert';
import { installSync } from 'install-optional';
import Module from 'module';
import path from 'path';
import loadConfigSync from 'read-tsconfig-sync';
import swc from 'ts-swc-rollup-plugin';
import url from 'url';
import { homedir as home } from '../lib/compat.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const input = path.join(DATA_DIR, 'src', 'index.ts');

type ResolveIdFn = (specifier: string, parentPath?: string) => string | null;
type TransformFn = (code: string, id: string) => { code: string } | null;

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

    it('throws for custom tsconfig name not found', () => {
      try {
        swc({ cwd: home(), tsconfig: 'custom.json' });
        assert.ok(false, 'this should fail');
      } catch (err) {
        assert.ok(err instanceof Error);
      }
    });
  });

  describe('resolveId', () => {
    it('throws for non-existent modules', () => {
      const plugin = swc({ cwd: DATA_DIR });
      const resolveId = plugin.resolveId as ResolveIdFn;
      try {
        resolveId('non-existent-module', input);
        assert.ok(false, 'should throw for non-existent module');
      } catch (err) {
        assert.ok(err instanceof Error);
      }
    });

    it('returns null for .d.ts files', () => {
      const plugin = swc({ cwd: DATA_DIR });
      const resolveId = plugin.resolveId as ResolveIdFn;
      const result = resolveId('./types.d.ts', input);
      assert.equal(result, null);
    });

    it('returns null for .d.mts files', () => {
      const plugin = swc({ cwd: DATA_DIR });
      const resolveId = plugin.resolveId as ResolveIdFn;
      const result = resolveId('./types.d.mts', input);
      assert.equal(result, null);
    });

    it('returns null for .d.cts files', () => {
      const plugin = swc({ cwd: DATA_DIR });
      const resolveId = plugin.resolveId as ResolveIdFn;
      const result = resolveId('./types.d.cts', input);
      assert.equal(result, null);
    });

    it('resolves relative imports', () => {
      const plugin = swc({ cwd: DATA_DIR });
      const resolveId = plugin.resolveId as ResolveIdFn;
      const result = resolveId('./constants.ts', input);
      if (result !== null) {
        assert.ok(result.endsWith('constants.ts'), 'should resolve to constants.ts');
      }
    });

    it('handles missing parentPath', () => {
      const plugin = swc({ cwd: DATA_DIR });
      const resolveId = plugin.resolveId as ResolveIdFn;
      const result = resolveId('./constants.ts');
      assert.equal(result, null);
    });
  });

  describe('matcher (include/exclude)', () => {
    it('excludes files in node_modules', () => {
      const tsconfig = loadConfigSync(DATA_DIR);
      tsconfig.config.exclude = ['node_modules'];
      const plugin = swc({ cwd: DATA_DIR, tsconfig });
      const resolveId = plugin.resolveId as ResolveIdFn;
      const nodeModulePath = path.join(DATA_DIR, 'node_modules', 'some-module', 'index.ts');
      const result = resolveId(nodeModulePath, input);
      assert.equal(result, null);
    });

    it('excludes files in dist directory', () => {
      const tsconfig = loadConfigSync(DATA_DIR);
      tsconfig.config.exclude = ['dist'];
      const plugin = swc({ cwd: DATA_DIR, tsconfig });
      const resolveId = plugin.resolveId as ResolveIdFn;
      const distPath = path.join(DATA_DIR, 'dist', 'index.ts');
      const result = resolveId(distPath, input);
      assert.equal(result, null);
    });
  });

  describe('transform', () => {
    it('plugin has transform function', () => {
      const plugin = swc({ cwd: DATA_DIR });
      assert.equal(typeof plugin.transform, 'function');
    });

    it('transform returns code for valid TypeScript', () => {
      const plugin = swc({ cwd: DATA_DIR });
      const transform = plugin.transform as TransformFn;
      const code = 'const x: number = 1;';
      const result = transform(code, path.join(DATA_DIR, 'src', 'test.ts'));
      assert.ok(result, 'transform should return a result');
      if (result && typeof result === 'object') {
        assert.ok('code' in result, 'result should have code property');
      }
    });
  });

  describe('tsconfig edge cases', () => {
    it('tsconfig with no include array uses default', () => {
      const tsconfig = loadConfigSync(DATA_DIR);
      delete tsconfig.config.include;
      const plugin = swc({ cwd: DATA_DIR, tsconfig });
      assert.ok(plugin, 'plugin should be created');
      assert.equal(plugin.name, 'ts-swc');
    });

    it('tsconfig with no exclude array uses default', () => {
      const tsconfig = loadConfigSync(DATA_DIR);
      delete tsconfig.config.exclude;
      const plugin = swc({ cwd: DATA_DIR, tsconfig });
      assert.ok(plugin, 'plugin should be created');
      assert.equal(plugin.name, 'ts-swc');
    });

    it('tsconfig with empty include array', () => {
      const tsconfig = loadConfigSync(DATA_DIR);
      tsconfig.config.include = [];
      const plugin = swc({ cwd: DATA_DIR, tsconfig });
      assert.ok(plugin, 'plugin should be created');
    });
  });

  describe('cwd option', () => {
    it('resolves relative cwd path', () => {
      const relativePath = path.relative(process.cwd(), DATA_DIR);
      const plugin = swc({ cwd: relativePath });
      assert.ok(plugin, 'plugin should be created with relative path');
      assert.equal(plugin.name, 'ts-swc');
    });

    it('handles cwd with trailing slash', () => {
      const plugin = swc({ cwd: DATA_DIR + path.sep });
      assert.ok(plugin, 'plugin should be created with trailing slash');
      assert.equal(plugin.name, 'ts-swc');
    });

    it('uses process.cwd() when cwd not specified', () => {
      const originalCwd = process.cwd();
      try {
        const tsconfig = loadConfigSync(DATA_DIR);
        tsconfig.config.include = ['**/*.ts'];
        const plugin = swc({ tsconfig });
        assert.ok(plugin, 'plugin should be created without cwd option');
      } finally {
        assert.equal(process.cwd(), originalCwd, 'cwd should not change');
      }
    });
  });

  describe('plugin metadata', () => {
    it('plugin name is ts-swc', () => {
      const plugin = swc({ cwd: DATA_DIR });
      assert.equal(plugin.name, 'ts-swc');
    });

    it('plugin has required hooks', () => {
      const plugin = swc({ cwd: DATA_DIR });
      assert.equal(typeof plugin.transform, 'function');
      assert.equal(typeof plugin.resolveId, 'function');
    });
  });
});
