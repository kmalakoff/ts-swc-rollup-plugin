## ts-swc-rollup-plugin

A rollup plugin for swc using ts-swc-transform.

Pass tsconfig name
```
// rollup.config.js
import swc from 'ts-swc-rollup-plugin';

export default {
  input: 'ABC',
  output: {},
  plugins: [
    swc({
      // All options are optional
      cwd: process.cwd(), // default
      tsconfig: 'tsconfig.json', // default
    }),
  ];
}
```

Pass tsconfig object
```
// rollup.config.js
import swc from 'ts-swc-rollup-plugin';
import { getTsconfig } from 'get-tsconfig';

export default {
  input: 'ABC',
  output: {},
  plugins: [
    swc({
      // All options are optional
      cwd: process.cwd(), // default
      tsconfig: getTsconfig(), // custom
    }),
  ];
}
```

### Documentation

[API Docs](https://kmalakoff.github.io/ts-swc-rollup-plugin/)
