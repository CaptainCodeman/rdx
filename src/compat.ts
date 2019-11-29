import { Store, Reducer } from "./store";
import { stateEvent } from "const";

export function compat<S>(store: Store<S>) {
  let listeners: Function[] = []

  store.addEventListener(stateEvent, () => listeners.forEach(listener => listener()))

  return {
    ...store,
    subscribe(listener) {
      listeners.push(listener)
      return () => listeners = listeners.filter(l => l !== listener)
    },
    getState() {
      return store.state
    },
    replaceReducer(reducer: Reducer<S>) {
      store.reducer = reducer
    }
  }
}
