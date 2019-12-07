import { Store as ReduxStore, Reducer as ReduxReducer, MiddlewareAPI, AnyAction } from 'redux'
import { Store, ActionEvent, Reducer } from "../typings"
import { dispatchEvent, stateEvent } from "./const"

// compatibility wrapper to make store provide the Redux API
export function compat<S>(store: Store<S>): ReduxStore<S> {
  return {
    dispatch<A extends AnyAction>(action: A) {
      return store.dispatch(action)
    },
    subscribe(listener) {
      store.addEventListener(stateEvent, listener)
      return () => store.removeEventListener(stateEvent, listener)
    },
    getState() {
      return store.state
    },
    replaceReducer(reducer: ReduxReducer<S>) {
      store.reducer = reducer as Reducer<S>
    }
  }
}

export function middlewareAdaptor<S>(store: Store<S>, middleware: (api: MiddlewareAPI) => any) {
  const compatStore = compat(store)
  const api = middleware(compatStore)

  store.addEventListener(dispatchEvent, e => {
    const evt = <CustomEvent<ActionEvent>>e
    const { action } = evt.detail
    const next = api(action => action)
    const result = next(action)
    if (result) {
      evt.detail.action = result
    } else {
      e.stopImmediatePropagation()
      e.preventDefault()
    }
  })

  return store
}