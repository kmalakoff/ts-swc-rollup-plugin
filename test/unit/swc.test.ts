import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import getTS from 'get-tsconfig-compat';
import home from 'os-homedir';
import type { SourceDescription } from 'rollup';

// @ts-ignore
import swc from 'ts-swc-rollup-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(url.fileURLToPath(import.meta.url));
const cwd = path.resolve(dirname, '..', 'data');
const sourcePath = path.join(cwd, 'src', 'index.ts');
const sourceContent = fs.readFileSync(sourcePath, 'utf8');

describe('swc', () => {
  it('no overrides', () => {
    const plugin = swc({ cwd });
    assert.equal(typeof plugin.transform, 'function');
    const result = plugin.transform(sourceContent, sourcePath) as SourceDescription;
    assert.equal(typeof result.code, 'string');
    assert.equal(typeof result.map, 'string');
    assert.ok(result.code.indexOf('export default function swc') >= 0);
    assert.ok(result.code.indexOf('const tsconfig =') >= 0);
  });

  it('option tsconfig tsconfigES5.json', () => {
    const plugin = swc({ cwd, tsconfig: 'tsconfigES5.json' });
    assert.equal(typeof plugin.transform, 'function');
    const result = plugin.transform(sourceContent, sourcePath) as SourceDescription;
    assert.equal(typeof result.code, 'string');
    assert.equal(typeof result.map, 'string');
    assert.ok(result.code.indexOf('export default function swc') >= 0);
    assert.ok(result.code.indexOf('var tsconfig =') >= 0);
  });

  it('option tsconfig loaded', () => {
    const tsconfig = getTS.getTsconfig(cwd);
    tsconfig.config.compilerOptions = { ...tsconfig.config.compilerOptions, target: 'ES5', module: 'commonjs' };
    const plugin = swc({ cwd, tsconfig });
    assert.equal(typeof plugin.transform, 'function');
    const result = plugin.transform(sourceContent, sourcePath) as SourceDescription;
    assert.equal(typeof result.code, 'string');
    assert.equal(typeof result.map, 'string');
    assert.ok(result.code.indexOf('Object.defineProperty(exports, "default"') >= 0);
    assert.ok(result.code.indexOf('var tsconfig =') >= 0);
  });

  it('error', () => {
    try {
      swc({ cwd: home() });
      assert.ok(false, 'this should fail');
    } catch (err) {
      assert.ok(err);
    }
  });
});
