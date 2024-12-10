import getTS from 'get-tsconfig-compat';
import { createMatcher, transformSync } from 'ts-swc-transform';
// @ts-ignore
import processCWD from './processCWD.cjs';
export default function swc(options = {}) {
    const tsconfig = typeof options.tsconfig === 'object' ? options.tsconfig : getTS.getTsconfig(options.cwd || processCWD(), options.tsconfig || 'tsconfig.json');
    if (!tsconfig) throw new Error(`tsconfig not found in: ${options.cwd || processCWD()} named: ${options.tsconfig || 'tsconfig.json'}`);
    const matcher = createMatcher(tsconfig);
    return {
        name: 'ts-swc',
        transform (code, id) {
            if (!matcher(id)) return null;
            return transformSync(code, id, tsconfig);
        }
    };
}
