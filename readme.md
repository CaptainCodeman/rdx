# Rdx

Like Redux, but smaller ...

This is a simple immutable state store along the lines of Redux but significantly smaller - it helps to build apps with super-tiny JavaScript payloads. It provides all the basic features for creating a client-side app including:

* Redux-like state store (actions / reducers / middleware)
* Root reducer utility function (combineReducers)
* Handling of async actions (aka 'thunks')
* Mixin to connect custom elements to the store (map state to properties and events to store dispatch)

Total size: 1.47 Kb minified / 640 bytes gzipped

With additional enhancements:

* Redux DevTools integration for debug and time-travel
* State hydration & persistence with action filtering, debounce and pluggable storage + serialization (defaults to localStorage and JSON)

Total size: 2.19 Kb minified / 969 bytes gzipped

See a fully functional [example app](https://github.com/CaptainCodeman/rdx-example) built using this.

## Compatibility

While the aim isn't to be 100% compatible with Redux, it can work with the Redux DevTools Extension and there is an _experimental_ `compat` module to simulate the Redux API and adapt existing Redux middleware.

## Usage

To create your state store:

```ts
import { Store, combineReducers, connect, thunk, persist, devtools} from '@captaincodeman/rdx'

// a very simple reducer state
const counter = (state = 0, action) => {	
  switch (action.type) {	
    case 'counter/inc':	
      return state + 1	
    case 'counter/dec':	
      return state - 1	
    default:	
      return state	
  }	
}

// more complex state for data loading
const todos = (state = {	
  data: {},	
  loading: false,	
  err: '',	
}, action) => {	
  switch (action.type) {	
    case 'todos/request':	
      return {...state, loading: true }	
    case 'todos/receive':	
      return {...state, loading: false, data: action.payload }	
    case 'todos/failure':	
      return {...state, loading: false, err: action.payload }	
    default:	
      return state	
  }	
}

// create root reducer
const reducer = combineReducers({ counter, todos })

// initial state could come from SSR string
const initial = undefined

// create the store - this will persist state to localStorage,
// support async actions (thunks) and allow time-travel debug
// using the Redux devtools extension
const store = devtools(persist(thunk(new Store(initial, reducer))))
```

## Approach

I've tried to re-think a few things to keep the size down because a lot of what Redux does is very clever but not necessary for what I need. The flexible "currying everywhere" approach to configuration may be very extensible but is more complex than required and confusing to use. The checks, warnings and error messages are not required when using TypeScript and in fact a simpler configuration reduces the requirement for it anyway.

Wherever possible we can also take advantage of existing web platform features instead of including additional JS code that simply replicates them. The ability to subscribe to something to receive events for instance is very common in the browser so for notification of state changes and dispatched actions we rely on the inbuilt [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget).

Unfortunately, the `EventTarget` _constructor()_ is not currently supported on WebKit so if you want to support Safari users, an additional small (589 byte) polyfill is needed which can be loaded only when required:

```html
<script>try{new EventTarget}catch(e){document.write('<script src="https://unpkg.com/@ungap/event-target@0.1.0/min.js"><\x2fscript>')}</script>
```

Once [support is added](https://bugs.webkit.org/show_bug.cgi?id=174313) this polyfill can be removed and will stop loading automatically.

## Models

But it's not "just" a Redux implementation, it makes it much easier to develop your app.

I really liked the approach of [redux-rematch](https://rematch.github.io/rematch/) to reduce the boilerplate required when using redux. For more background and the motivation behind this approach
see [redesigning-redux](https://hackernoon.com/redesigning-redux-b2baee8b8a38).

This brings that same approach to `rdx` and allows you to define your state models in a very small and compact way, without verbose boilerplate code by providing helpers to create the store for you and plugins to add common functionality such as routing.

See a [live example](https://captaincodeman.github.io/rdx-example/) or checkout the [source code](https://github.com/CaptainCodeman/rdx-example). The usage example below is based on this example.

### createStore

This helps create a store instance for you and wires up dispatch and async effects for yor models. It starts like this, we'll see where the `models` come from later:

#### store/index.ts

```ts
import { createStore } from '@captaincodeman/rdx'
import * as models from './models'

export const store = createStore({ models })
```

The store that is created is a regular `rdx` store with some additional, auto-generated actionCreator-type methods added to the `dispatch` method to make using the store easier ... we'll get to those later.

### plugins and extensions

If we require additional store functionality, that can be added by wrapping the store or providing plugins. Lets add state persistence and hydration using `localStorage` and also wire up the redux devtools extension  (both provided by `rdx`) plus add routing using a plugin provided by this package.

First, we'll define our store configuration, including routes, in a separate file using a [tiny client-side router package](https://github.com/CaptainCodeman/js-router):

#### store/config.ts

```ts
import createMatcher from '@captaincodeman/router'
import { routingPluginFactory } from '@captaincodeman/rdx'
import * as models from './models'

const routes = {
  '/':          'home-view',
  '/todos':     'todos-view',
  '/todos/:id': 'todo-view',
  '/*':         'not-found',
}

const matcher = createMatcher(routes)
const routing = routingPluginFactory(matcher)

export const config = { models, plugins: { routing } }
```

We'll import the exported `config` and use the `createStore` helper to create an instance of the `rdx` store and this time we'll decorate it with the `devtools` and `persist` enhancers that the `rdx` package provides so we get the integration with Redux DevTools plus state persistence using `localStorage`. It's only slightly more complex than the first example:

#### store/index.ts

```ts
import { createStore, StoreState, StoreDispatch, EffectStore } from '@captaincodeman/rdx'
import { devtools, persist} from '@captaincodeman/rdx'
import { config } from './config'

export const store = devtools(persist(createStore(config)))

export interface State extends StoreState<typeof config> {}
export interface Dispatch extends StoreDispatch<typeof config> {}
export interface Store extends EffectStore<Dispatch, State> {}
```

Note the `State`, `Dispatch` and `Store` interfaces provide strongly-typed access to the store.

### createModel

So what about the models that are imported? That's really where all the 'action' is or actions _are_, it's a Redux pun see ... oh, nevermind, anyway let's focus on those. All the models are in a separate `/models` module which simply re-exports and names the individual state branches. This makes it easy to manage as the state in your app grows.

#### store/models/index.ts

```ts
export { counter } from './counter'
export { todos } from './todos'
```

The state branches are then defined in their own files. A simple counter state is, well, simple ... because why should it _need_ to be complicated?

#### store/models/counter.ts

```ts
import { createModel } from '@captaincodeman/rdx'

export const counter = createModel({
  state: { 
    value: 0,
  },
  reducers: {
    inc(state) {
      return { ...state, value: state.value + 1 };
    },
    add(state, payload: number) {
      return { ...state, value: state.value + payload };
    },
  },
})
```

The state can be as simple or complex as needed. For this example we could have made the state be the numeric value directly, but that isn't typical in a real app. Likewise, the payload passed to a reducer method can be more than just a single value, it would be the same type of payload that an action typically has. Hmmn ... can you see where this is going?

The `createModel` helper is really there just to aid typing. It not only defines the initial state but also infers the state type, so it doesn't need to be defined in each reducer function. Each reducer must accept the state as the first parameter and then an optional payload as a second parameter. Why this 'restriction'? Because these reducer methods are transformed into actionCreator-type functions that both _create_ and _dispatch_ an action in a single call.

Take the `add` reducer method on the `counter` state model above. This is converted into a strongly typed method on the store dispatch which allows you to call strongly typed methods to dispatch actions such as:

```ts
dispatch.counter.add(5)
```

To be clear - we're still using a state store and are dispatching actions that go through any middleware and eventually may hit the reducer, we are not just calling the reducer directly as it may appear. We still have immutable and predictable state, just without all the boilerplate code.

The action type is created automatically based on the name of the model and the name of the reducer function, so the example above would cause an action to be dispatched with the type `counter/add` (which is the naming convention Redux now recommends).

If we were using Redux we might have code that looks more like this:

```ts
export enum CounterTypes {
  COUNTER_INC: 'COUNTER_INC'
  COUNTER_ADD: 'COUNTER_ADD'
}

export interface CounterInc {
  readonly type: COUNTER_INC
}

export interface CounterAdd {
  readonly type: COUNTER_ADD
  readonly payload: number
}

export type CounterActions = CounterInc | CounterAdd

export const createCounterInc = () => {
  return <CounterInc>{
    type: COUNTER_INC,
  }
}

export const createCounterAdd = (value: number) => {
  return <CounterAdd>{
    type: COUNTER_ADD,
    payload: value,
  }
}

export interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0,
};

export const counterReducer = (state: CounterState = initialState, action: CounterActions) => {
  switch (action.type) {
    case CounterTypes.COUNTER_INC:
      return {
        ...state,
        value: state.value + 1
      };

    case CounterTypes.COUNTER_ADD:
      return {
        ...state,
        value: state.value + action.payload
      };

    default:
      return state
  }
}

// to call:
store.dispatch(createCounterAdd(2))
```

How many times should we have to type 'counter', _really_? So many potential gotchas to make a mistake. That's just one simple state branch - imagine what happens when we have a large application and multiple actions in multiple state branches? This is where people might say Redux isn't worth it and is overkill - but what Redux _does_ is definitely worthwhile, it's just that it does it in a complex way.

Yes, some of this is deliberately verbose to make the point and there are various helpers that can be used to reduce some of the pain points (at the cost of extra code), but Redux definitely has some overhead - it's not simple to use and the extra code doesn't really add any value and it becomes complex to work with as it's often spread across multiple files, sometimes even multiple folders.

### async effects

A counter is the simplest canonical example of a reducer. Often you need to have a combination of state and reducers plus some 'side-effects' - async functions can can be dispatched (thunks) or that can execute in response to the synchronous actions that go through the store, often as middleware. We have that covered! Oh, and there's no middleware to add, all the functionality is baked into the `createStore` that we saw earlier.

Let's look at something more complex, the state for a 'todo' app which needs to handle async fetching of data from a REST API. We want to only fetch data when we don't already have it and what we need to fetch will depend on the route we're on - if we go from a list view to a single-item view, we don't need to fetch that single item as we already have it, but if our first view is the single item we want to fetch just that, and then fetch the list if we navigate in the other direction.

Also, we want to be able to display loading state in the UI so we need to be able to indicate when we've requested data and when it's loaded. This is where the redux approach shines - converting asynchronous changes to predictable and replayable synchonous state updates

The state part of this example is just a more complex but still typical example of immutable, redux-like, state. But as well as defining actions as reducers, we can also define effects. These can also be dispatched just like the reducer-generated actions, but they also act as hooks so that when an action has been dispatched, if an effect exists with the same name, that will be called automatically.

#### store/models/todos.ts

```ts
import { createModel, RoutingState } from '@captaincodeman/rdx';
import { Store } from '../store';

// we're going to use a test endpoint that provides some ready-made data
const endpoint = 'https://jsonplaceholder.typicode.com/'

// this is the shape of a single TODO item that the endpoint provides
export interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

// this is the shape of our todos state in the store, having it strongly 
// typed saves some mistakes when we access or update it
export interface TodosState {
  entities: { [key: number]: Todo }
  ids: number[]
  selected: number
  loading: boolean
}

export default createModel({
  // our initial model state
  state: <TodosState>{
    entities: {},
    ids: [],
    selected: 0,
    loading: false,
  },

  // our state reducers
  reducers: {
    // select indicates the selected todo id, it will be called when we go
    // to a route such as /todos/123
    select(state, payload: number) {
      return { ...state, selected: payload }
    },

    // request indicates that we are requesting data, so it sets the loading 
    // flag to true
    request(state) {
      return { ...state, loading: true };
    },

    // received is called when we have recieved a single todo item, it adds
    // it to the state and clears the loading flag
    received(state, payload: Todo) {
      return { ...state,
        entities: { ...state.entities,
          [payload.id]: payload,
        },
        loading: false,
      };
    },

    // receivedList updates the state with the full list of todos, as well
    // as adding the todos to the entities it also stores their order in
    // the ids state, for listing them in the UI
    receivedList(state, payload: Todo[]) {
      return { ...state,
        entities: payload.reduce((map, todo) => {
          map[todo.id] = todo
          return map
        }, {}),
        ids: payload.map(todo => todo.id),
        loading: false,
      };
    },
  },

  // our async effects
  effects(store: Store) {
    // reference the dispatch method, which is used in multiple effects
    const dispatch = store.dispatch()

    // return the effect methods so they are wired up by the middleware
    return {
      // after a todo is selected, we check if it is loaded or not
      // if it isn't loaded we dispatch the 'request' action followd by
      // the 'received' action. In real life we'd handle failures using a
      // 'failed' action to record the error message (for use in the UI).
      async select(payload) {
        const state = store.getState()
        if (!state.todos.entities[state.todos.selected]) {
          dispatch.todos.request()
          const resp = await fetch(`${endpoint}todos/${payload}`)
          const json = await resp.json()
          dispatch.todos.received(json)
        }
      },

      // load is called to load the full list, whenever we hit the list
      // view URL but we avoid re-requesting them if we already have the
      // data
      async load() {
        const state = store.getState()
        if (!state.todos.ids.length) {
          dispatch.todos.request()
          const resp = await fetch(`${endpoint}todos`)
          const json = await resp.json()
          dispatch.todos.receivedList(json)
        }
      },

      // not only can we listen for our own dispatched actions (such as
      // the 'select' effect above) but we can also listen for actions from
      // other store state branches. In this case, we are interested in the
      // route changing and for the views that affects todos, we can then
      // dispatch the appropriate actions which will cause data to be loaded
      // if required (see effect methods above)
      'routing/change': async function(payload: RoutingState) {
        switch (payload.page) {
          case 'todos-view':
            dispatch.todos.load()
            break
          case 'todo-view':
            dispatch.todos.select(parseInt(payload.params.id))
            break
        }
      }
    }
  })
})
```

Yes, it's more code than the counter model, but it's a lot less code to write than the Redux equivalent and it contributes less to the JS bundle for your app.

Note that the effects are dispatchable just like the reducers and they show up in the devtools just the same. In the example above, calling `dispatch.todos.select(123)` would dispatch an action that would hit the reducer and _then_ the effect of the same name. Whereas calling `dispatch.todos.load()` would still dispatch an action but only run the effect (as there is no matching reducer).

We can also listen for actions dispatched from other state models, in both the reducers and effects functions. We've seen how this is done to listen for route changes but there are often cases where we may want to act on our local state based on some other dispatched action. As an example, we could clear data from the store when the auth model dispatches a signout action:

```ts
export default createModel({
  state,
  reducers: {
    // ... existing model reducers

    // when user signs out, remove data from state
    'auth/signout': (state) => {
      return { ...state, data: [] }
    }
  }
})
```