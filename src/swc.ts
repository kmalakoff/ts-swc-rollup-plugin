import getTS from 'get-tsconfig-compat';
import { createMatcher, transformSync } from 'ts-swc-transform';
// @ts-ignore
import processCWD from './processCWD.cjs';

import type { TsConfigResult } from 'get-tsconfig';
import type { TransformResult } from 'rollup';
export interface SWCOptions {
  cwd?: string;
  tsconfig?: TsConfigResult | string;
}

export default function swc(options: SWCOptions = {}) {
  const tsconfig = typeof options.tsconfig === 'object' ? options.tsconfig : getTS.getTsconfig(options.cwd || processCWD(), options.tsconfig || 'tsconfig.json');
  const matcher = createMatcher(tsconfig);
  return {
    name: 'ts-swc',
    transform(code: string, id: string): TransformResult {
      if (!matcher(id)) return null;
      return transformSync(code, id, tsconfig);
    },
  };
}
