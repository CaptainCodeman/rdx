# createModel

```ts
function createModel(model: Model): Model
```

The `createModel` function asserts that the model has the correct properties and consistent types (e.g. the state parameter of each reducer function matches the model state).

The properties defined on the model includes:

## state

The `state` property defines both the shape (TypeScript type) of the state and the initial state value to use if no predefined state is passed to the `createStore` function. So, the first time a store is initialized the value here will be used.

*NOTE:* If the store state is configured for [persistence and re-hydration](api-persist) (e.g. persisted to `localStorage`), then on the next app startup the state will be re-hydrated from there and will be used instead of the initial state.

The type of the model `state` can be a simple value, an array, or an object containing other properties that are values, arrays and objects. It is good practice to only include serializable values in the state.

Here's an example of a model with a rich state type:

```ts
import { createModel } from '@captaincodeman/rdx'
import { Todo } from '../schema'

interface State {
  entities: { [key: number]: Todo }
  selected: number
  loading: boolean
}

export default createModel({
  state: <State>{
    entities: {},
    selected: 0,
    fetching: false,
  }
})
```

Here's a much simpler model that only stores a single value, in this case a `number`:

```ts
import { createModel } from '@captaincodeman/rdx'

export default createModel({
  state: 0
})
```

## reducers

The `reducers` property returns a map of the reducer functions. Each function accepts a `state` property as it's first parameter, which must match the state type defined for the model, and then an optional payload (of any type). The state's (TypeScript) type can be inferred, so doesn't need to be defined in each reducer even if using strict mode in TypeScript.

Reducers must be pure functions. That means, they only use the parameters passed in to them. They must also return a new (mutated) state or can return the original state passed in if no change is to be applied.

The same familiar [immutable update patterns as used in Redux](https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns) should be applied.

Here's a simple example:

```ts
import { createModel } from '@captaincodeman/rdx'

export default createModel({
  state: 0,

  reducers: {
    inc(state) {
      return state + 1
    },

    add(state, value: number) {
      return state + value
    },

    // reset the count when the auth/signOut action is dispatched
    'auth/signOut'(state) {
      return 0
    }
  }
})
```

This will produce a dispatch type (which will be added to the store dispatch method) of:

```ts
interface counter {
  inc(): State
  add(value: number): State
}
```

Note the return values always match the type of the model `state`.

These dispatch methods will dispatch action types where the action type name is a combination of the model name and the function name, and the payload is the 2nd parameter (if used).

So, an auth model with a reducer function:

```ts
import { createModel } from '@captaincodeman/rdx'

interface User {
  id: number
  name: string
}

interface AuthState {
  user: User | null
  statusKnown: boolean
}

const initial: AuthState = {
  user: null,
  statusKnown: false,
}

export default createModel({
  state: initial,
  reducers: {
    signedIn(state, user: User) {
      return { ...state, user, statusKnown: true }
    }
  }
})
```

&hellip; would provide a strongly-typed dispatch method:

```ts
store.dispatch.auth.signedIn({ id: 1, name: 'CaptainCodeman' })
```

&hellip; which would dispatch the action:

```json
{
  "type": "auth/signedIn",
  "payload": {
    "id": 1,
    "name": "CaptainCodeman"
  }
}
```

Reducer functions with a string name containing a `'/'` character allow the model to listen to actions defined and dispatched by other models.

## effects

The `effects` property is a factory function that is passed a `store` parameter which provides access to the store's typed dispatch method and the current state. It should return a map of effect functions, which are similar to the reducers except the functions don't accept the state as the first property and they can be `async`.

Effect functions can use the same `model/function` string naming to listen to actions defined and dispatched by other models.

An effect function can match a reducer function of the same name and will be called _after_ the corresponding action has been dispatched to the store reducers and the state mutated. The effect will be passed the same payload originally passed to the reducer.

Effects that _don't_ have a corresponding reducer function can be dispatched as per the reducers and will create dispatched actions in the same way. It's possible for other models to listen for those actions in their reducers or effects.

```ts
import { createModel } from '@captaincodeman/rdx'
import { Store } from '../store'

interface User {
  id: number
  name: string
}

interface AuthState {
  user: User | null
  statusKnown: boolean
}

const initial: AuthState = {
  user: null,
  statusKnown: false,
}

export default createModel({
  state: initial,

  reducers: {
    signedIn(state, user: User) {
      return { ...state, user, statusKnown: true }
    }
  },

  effects(store: Store) {
    // this captures the strongly typed store dispatch
    // which effects can use to dispatch other actions
    const dispatch = store.dispatch()

    return {
      // this will be called _after_ the signedIn
      // reducer has mutated the store state. It
      // can call async functions
      async signedIn(user: User) {
        await logUserSignedIn(user)
      },

      // this has no matching reducer but can still be
      // dispatched from the store, call async functions
      // and dispatch actions back to the store. It can
      // also access the current state of the store (as
      // at the time it executes) to make decisions on
      // what to dp
      async signIn(credentials: { email: string, password: string }) {
        const state = store.getState()
        if (store.auth.user === null) {
          const resp = await fetch('/auth/signin')
          const user = await resp.json()
          dispatch.auth.signedIn(user)
        } else {
          // already signed in, ignore
        }
      },
    }
  }
})
```