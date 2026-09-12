# ts-swc-rollup-plugin

A Rollup plugin that transforms TypeScript with SWC. It reads `tsconfig.json` by default and requires Node.js 16 or newer.

## Install

```bash
npm install --save-dev rollup ts-swc-rollup-plugin
```

## Use

```js
// rollup.config.js
import swc from 'ts-swc-rollup-plugin';

export default {
  input: 'src/index.ts',
  output: { dir: 'dist', format: 'esm' },
  plugins: [swc()],
};
```

Pass `cwd` to find a config in another directory, or pass the parsed config object as `tsconfig`. The plugin skips declaration files and files outside the configured TypeScript include/exclude patterns.

## Documentation

[API docs](https://kmalakoff.github.io/ts-swc-rollup-plugin/)
