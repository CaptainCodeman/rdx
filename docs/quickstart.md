# Quickstart

Using Rdx is easy. Here's how to get started.

TODO: This isn't intended to show you how to build and develop and app in general, only the specifics of how to use Rdx. It assumes you know how to use NPM, rollup etc...

For a complete ready-made example, see the [demo project](https://github.com/CaptainCodeman/rdx-demo/)

## Install Package

Rdx is available as a package on NPM for use with a bundler / build tool. 

```bash
npm install -D @captaincodeman/rdx
```

## Define Models

We'll create a state branch for a basic counter. In Rdx we call these state branches 'models'.

### src/state/models/counter.ts

We use the `createModel` function which accepts the inital default state and the reducer methods that can mutate it. It automatically checks that the state type used in each function matches. Reducers can include an optional property that becomes the `payload` in an Action.

```ts
import { createModel } from '@captaincodeman/rdx'

export const counter = createModel({
  state: 0,
  reducers: {
    increment(state) {
      return state + 1
    },
    decrement(state) {
      return state - 1
    },
    add(state, value: number) {
      return state + number
    },
    subtract(state, value: number) {
      return state - number
    }
  }
})
```

We want to be able to import all the models that we add, so we re-export them in an `index.ts` file. As we add additional models, we'll just need to reference them in this file to make them appear as part of the store.

### src/state/models/index.ts
```ts
export { counter } from './counter.ts'
```

## Create Store

To create a basic store we use the `createStore` function, passing it a configuration object. The only required property is the `models` that we want to use.

```ts
import { createStore } from '@captaincodeman/rdx'
import * as models from './models'

export const store = createStore({ models })
```

## Using the Store
That's all that is required for a basic store - much simpler than Redux eh?!

```ts