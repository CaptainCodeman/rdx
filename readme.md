# Rdx

Like Redux, but smaller ...

This is a simple immutable state store along the lines of Redux but significantly smaller - it helps to build apps with super-tiny JavaScript payloads. It provides all the basic features for creating a client-side app including:

* Redux-like state store (actions / reducers / middleware)
* Root reducer utility function (combineReducers)
* Handling of async actions (aka 'thunks')
* Mixin to connect custom elements to the store (map state to properties and events to store dispatch)

Total size: 1.5 Kb minified / 662 bytes gzipped

With additional enhancements:

* Redux DevTools integration for debug and time-travel
* State hydration & persistence with action filtering, debounce and pluggable storage + serialization (defaults to localStorage and JSON)

Total size: 2.22 Kb minified / 989 bytes gzipped

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

## Plans

To avoid the normal bloat of boiler-plate code that Redux can introduce I'm also working on making it easier to define the state, actions, reducers and async effects, all in a single object . This will make working with a stte store easier and allow your app code to be kept to a minimum. It's inspired by `redux-rematch` but simplified because it doesn't require the complexities that Redux introduces.

This will also include a store-integrated router module based on a tiny routing system, because if you're using a state store there's a high probability that you'll need client routing as well.

Together, this will make it possible to have everything you need for a fully functioning app complete with routing, async data fetching, persistence and UI components in approximately 8 Kb of minified JS, around 3.0 Kb compressed.

See the example app linked above for a working demonstration.