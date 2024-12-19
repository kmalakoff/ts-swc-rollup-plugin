import getTS from 'get-tsconfig-compat';
import type { TsConfigResult } from 'get-tsconfig-compat';
import type { Plugin } from 'rollup';
import { createMatcher, resolveFileSync, transformSync } from 'ts-swc-transform';
import { typeFileRegEx } from './constants.js';
// @ts-ignore
import process from './lib/process.cjs';

export type { TsConfigResult } from 'get-tsconfig-compat';
export interface SWCOptions {
  cwd?: string;
  tsconfig?: TsConfigResult | string;
}

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
