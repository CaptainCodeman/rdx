import { Store, StoreEvent, Dispatch } from "./store";
import { dispatchEvent } from './const'

export type ThunkAction = <S>(dispatch: Dispatch, getState: () => S) => void

export function thunk(store: Store<any>) {
  const dispatch = store.dispatch.bind(store)

  store.addEventListener(dispatchEvent, e => {
    const ev = <CustomEvent<StoreEvent>>e
    const { action } = ev.detail

    if (typeof action === 'function') {
      const thunk = <ThunkAction>action
      thunk(dispatch, store.state)

      // stop event going to other listeners (we've handled it)
      ev.stopImmediatePropagation()

      // stop action being dispatched to reducer (it's a function)
      ev.preventDefault()
    }
  })

  return store
}
