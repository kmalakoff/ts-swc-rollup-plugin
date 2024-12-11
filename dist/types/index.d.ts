import type { TsConfigResult } from 'get-tsconfig';
import type { TransformResult } from 'rollup';
export type { TsConfigResult } from 'get-tsconfig';
export type { TransformResult } from 'rollup';
export interface SWCOptions {
    cwd?: string;
    tsconfig?: TsConfigResult | string;
}
export default function swc(options?: SWCOptions): {
    name: string;
    transform(code: string, id: string): TransformResult;
};
