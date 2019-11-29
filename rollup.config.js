'use strict';

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
    connect: 'src/connect.ts',
    devtools: 'src/devtools.ts',
    persist: 'src/persist.ts',
    store: 'src/store.ts',
    thunk: 'src/thunk.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/index.ts',
  output: [{
    file: 'dist/index.cjs',
    format: 'cjs',
  }, {
    file: 'dist/index.min.js',
    format: 'esm',
    sourcemap: true,
  }],
  plugins,
}, {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'store',
    esModule: false
  },
  plugins,
}]

/*
export default [{
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/combineReducers.ts',
  output: {
    file: 'dist/combineReducers.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/compat.ts',
  output: {
    file: 'dist/compat.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/connect.ts',
  output: {
    file: 'dist/connect.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/devtools.ts',
  output: {
    file: 'dist/devtools.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/persist.ts',
  output: {
    file: 'dist/persist.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/store.ts',
  output: {
    file: 'dist/store.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}, {
  input: 'src/thunk.ts',
  output: {
    file: 'dist/thunk.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins,
}]
*/