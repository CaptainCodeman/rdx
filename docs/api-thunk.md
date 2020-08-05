# thunk

_NOTE:_ Support for _thunks_ is provided as a compatibility feature for learning or migration purposes. We strongly suggest, you use the [async effects plugin](advanced?id=effects) built-in with Rdx instead.

The `thunk` store decorator adds support for 'thunks'. A thunk allows a function to be dispatched to the store instead of a regular action. This decorator acts as middleware, intercepting `thunk` actions and executing them.

When a thunk is executed, it is passed the store `dispatch` function and a `getState` function so it can make decisions about the current state of the store and dispatch other actions if required.

It's typically used as a lightweight, cheap-as-chips, asynchronous middleware, which can be useful for learning the basics of state containers, simple use-cases and early prototyping. It's easy to quickly outgrow what it provides and Rdx contains a more powerful [async effect middleware](advanced?id=effects) built-in, so it's not recommended, other than for learning or code migration purposes.

```ts
import { createStore, thunk } from '@captaincodeman/rdx'
import { config } from './config'

export const store = thunk(createStore(config))
```