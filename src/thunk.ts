import { Store, ActionEvent, ThunkAction } from "../typings"
import { dispatchEvent } from './const'

export function thunk<T extends Store>(store: T) {
  const dispatch = store.dispatch.bind(store)

  store.addEventListener(dispatchEvent, e => {
    const { action } = (<CustomEvent<ActionEvent>>e).detail

    if (typeof action === 'function') {
      const thunk = <ThunkAction>action
      thunk(dispatch, () => store.state)

      // stop event going to other listeners (we've handled it)
      e.stopImmediatePropagation()

      // stop action being dispatched to reducer (it's a function)
      e.preventDefault()
    }
  })

  return store
}
