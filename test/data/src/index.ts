import type { Plugin } from 'rollup';
import loadConfigSync, { type TSConfig } from 'read-tsconfig-sync';
import { resolveFileSync, transformSync } from 'ts-swc-transform';
import match from 'test-match';
import { typeFileRegEx } from './constants.ts';

export interface SWCOptions {
  cwd?: string;
  tsconfig?: TSConfig | string;
}

export default function swc(options: SWCOptions = {}): Plugin<SWCOptions> {
  const tsconfig = typeof options.tsconfig === 'object' ? options.tsconfig : loadConfigSync(options.cwd || process.cwd(), options.tsconfig || 'tsconfig.json');
  if (!tsconfig) throw new Error(`tsconfig not found in: ${options.cwd || process.cwd()} named: ${options.tsconfig || 'tsconfig.json'}`);

  const matcher = match({ cwd: path.dirname(tsconfig.path), include: tsconfig.config.include as string[], exclude: tsconfig.config.exclude as string[] });
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
