import getTS from 'get-tsconfig-compat';
import process from 'process';
import { createMatcher, resolveFileSync, transformSync } from 'ts-swc-transform';
import { typeFileRegEx } from './constants.mjs';
export default function swc(options = {}) {
    const tsconfig = typeof options.tsconfig === 'object' ? options.tsconfig : getTS.getTsconfig(options.cwd || process.cwd(), options.tsconfig || 'tsconfig.json');
    if (!tsconfig) throw new Error(`tsconfig not found in: ${options.cwd || process.cwd()} named: ${options.tsconfig || 'tsconfig.json'}`);
    const matcher = createMatcher(tsconfig);
    return {
        name: 'ts-swc',
        transform (code, id) {
            return transformSync(code, id, tsconfig);
        },
        resolveId (specifier, parentPath) {
            const context = {
                parentPath
            };
            const filePath = resolveFileSync(specifier, context);
            if (!filePath) return null;
            if (!matcher(filePath)) return null;
            if (typeFileRegEx.test(filePath)) return null;
            return filePath;
        }
    };
}
