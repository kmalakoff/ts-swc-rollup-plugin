import type { TsConfigResult } from 'get-tsconfig-compat';
import type { Plugin } from 'rollup';
export type { TsConfigResult } from 'get-tsconfig-compat';
export interface SWCOptions {
    cwd?: string;
    tsconfig?: TsConfigResult | string;
}
export default function swc(options?: SWCOptions): Plugin<SWCOptions>;
