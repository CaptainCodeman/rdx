# Store

The `Store` class is the low-level state store in Rdx. You won't normally use it directly but it is available if you just require a simple Redux-like state store in far fewer bytes.

TODO: handles dispatch, events, inherits from `EventTarget` (may require polyfill in older Safari)

## constructor

```ts
new Store(state: State | undefined, reducer: (state: State, action: Action) => State)
```

Create an instance, passing in the existing state to start with (if re-hydrating or including as server-rendered JSON) together with the root reducer functions to use (reducers can be combined with the `combineReducers` function)

```ts
const reducer = (state = 0, action) => {
  switch (action.type) {
    case 'add': 
      return state + action.payload
    default:
      return state
  }
}

const store = new Store(undefined, reducer)
```

## dispatch method

```ts
store.dispatch(action: Action)
```

The `dispatch` method is used to dispatch an action to the store. The store will raise an `action` event, that middleware subscribers can handle if required (either cancelling the action, or transforming it). If not cancelled, the store reducer is called to mutate the state and a `state` event is then raised. Any subscriber interested in state changes (e.g. UI components) can subscribe to this event to be notified that they should render updates.

## reducer property

```ts
store.reducer: Reducer<State>
```

The `reducer` function is available as a property of the store. It is only used to allow the reducer function to be replaced / augmented, such as when lazy-loading parts of the store. Rdx is so small, that this is rarely necessary.

## state property

```ts
store.state: State
```

The `state` property returns the current state of the store.
