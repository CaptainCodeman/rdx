'use strict';

import pkg from './package.json';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import size from 'rollup-plugin-size';

const plugins = [
  typescript({ typescript: require('typescript') }),
  terser(),
  size(),
]

export default [{
  input: {
    index: 'src/index.ts',
    combineReducers: 'src/combineReducers.ts',
    compat: 'src/compat.ts',
    connect: 'src/connect.ts',
    devtools: 'src/devtools.ts',
    persist: 'src/persist.ts',
    store: 'src/store.ts',
    thunk: 'src/thunk.ts',
  },
  output: {
    dir: 'lib',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/index.ts',
  output: [{
    file: pkg.main,
    format: 'cjs',
  }, {
    file: 'lib/index.min.js',
    format: 'esm',
    sourcemap: true,
  }],
  plugins,
}, {
  input: 'src/index.ts',
  output: {
    file: pkg.browser,
    format: 'umd',
    name: 'store',
    esModule: false
  },
  plugins,
}]
