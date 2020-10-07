'use strict';

import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import size from 'rollup-plugin-size';

export default {
  input: {
    index: 'src/index.ts',
    combineReducers: 'src/combineReducers.ts',
    compat: 'src/compat.ts',
    components: 'src/components.ts',
    const: 'src/const.ts',
    createModel: 'src/createModel.ts',
    createStore: 'src/createStore.ts',
    devtools: 'src/devtools.ts',
    persist: 'src/persist.ts',
    routing: 'src/routingPlugin.ts',
    store: 'src/store.ts',
    thunk: 'src/thunk.ts',
  },
  output: {
    dir: 'lib',
    format: 'esm',
    sourcemap: 'hidden',
  },
  plugins: [
    typescript({ typescript: require('typescript') }),
    terser(),
    size(),
  ]
}
