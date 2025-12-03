import assert from 'assert';
import { typeFileRegEx } from '../../src/constants.ts';

describe('typeFileRegEx', () => {
  describe('matches declaration files', () => {
    it('.d.ts', () => {
      assert.ok(typeFileRegEx.test('types.d.ts'));
    });

    it('.d.mts', () => {
      assert.ok(typeFileRegEx.test('types.d.mts'));
    });

    it('.d.cts', () => {
      assert.ok(typeFileRegEx.test('types.d.cts'));
    });

    it('with dots in filename (foo.bar.d.ts)', () => {
      assert.ok(typeFileRegEx.test('foo.bar.d.ts'));
    });

    it('with multiple dots (react.component.d.ts)', () => {
      assert.ok(typeFileRegEx.test('react.component.d.ts'));
    });

    it('full path to .d.ts', () => {
      assert.ok(typeFileRegEx.test('/path/to/types.d.ts'));
    });

    it('full path with dots in filename', () => {
      assert.ok(typeFileRegEx.test('/path/to/foo.bar.d.ts'));
    });
  });

  describe('does not match regular files', () => {
    it('.ts files', () => {
      assert.ok(!typeFileRegEx.test('types.ts'));
    });

    it('.mts files', () => {
      assert.ok(!typeFileRegEx.test('types.mts'));
    });

    it('.cts files', () => {
      assert.ok(!typeFileRegEx.test('types.cts'));
    });

    it('.tsx files', () => {
      assert.ok(!typeFileRegEx.test('types.tsx'));
    });

    it('files with "d" in name (typed.ts)', () => {
      assert.ok(!typeFileRegEx.test('typed.ts'));
    });

    it('.js files', () => {
      assert.ok(!typeFileRegEx.test('types.js'));
    });

    it('full path to .ts', () => {
      assert.ok(!typeFileRegEx.test('/path/to/types.ts'));
    });
  });
});
