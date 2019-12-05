import { Store, Reducer, Action } from "../typings"
import { stateEvent } from "./const"

// compatibility wrapper to make store provide the Redux API
export function compat<S>(store: Store<S>) {
  return {
    dispatch(action: Action) {
      return store.dispatch(action)
    },
    subscribe(listener) {
      store.addEventListener(stateEvent, listener)
      return () => store.removeEventListener(stateEvent, listener)
    },
    getState() {
      return store.state
    },
    replaceReducer(reducer: Reducer<S>) {
      store.reducer = reducer
    }
  }
}
