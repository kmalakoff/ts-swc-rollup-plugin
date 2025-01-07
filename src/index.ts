import * as getTS from 'get-tsconfig-compat';
import type { Plugin } from 'rollup';
import { createMatcher, resolveFileSync, transformSync } from 'ts-swc-transform';
import { sync as ensureBindings } from './bindings/ensure.cjs';
import { typeFileRegEx } from './constants';

export type { TsConfigResult } from 'get-tsconfig-compat';
export interface SWCOptions {
  cwd?: string;
  tsconfig?: getTS.TsConfigResult | string;
}

export const ensureBindingsSync = () => ensureBindings('rollup', `${process.platform}-${process.arch}`);

export default function swc(options: SWCOptions = {}): Plugin<SWCOptions> {
  const tsconfig = typeof options.tsconfig === 'object' ? options.tsconfig : getTS.getTsconfig(options.cwd || process.cwd(), options.tsconfig || 'tsconfig.json');
  if (!tsconfig) throw new Error(`tsconfig not found in: ${options.cwd || process.cwd()} named: ${options.tsconfig || 'tsconfig.json'}`);

  const matcher = createMatcher(tsconfig);
  return {
    name: 'ts-swc',
    transform(code: string, id: string) {
      return transformSync(code, id, tsconfig);
    },

    resolveId(specifier: string, parentPath?: string) {
      const context = { parentPath };
      const filePath = resolveFileSync(specifier, context);
      if (!filePath) return null;
      if (!matcher(filePath)) return null;
      if (typeFileRegEx.test(filePath)) return null;
      return filePath;
    },
  };
}
