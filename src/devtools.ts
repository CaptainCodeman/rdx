import { Store, ActionEvent } from '../typings/store'
import { stateEvent } from './const'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any
  }
}

const isJumpToState = (action: any) => action.type === 'DISPATCH'

export function devtools<T extends Store>(store: T, options?: any) {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__

  if (extension) {
    const devtools = extension.connect(options)

    store.addEventListener(stateEvent, e => {
      const { action } = (<CustomEvent<ActionEvent>>e).detail
      if (!isJumpToState(action)) {
        devtools.send(action, store.state)
      }
    })

    devtools.subscribe((action: any) => {
      if (isJumpToState(action)) {
        store.state = JSON.parse(action.state)
        store.dispatchEvent(new CustomEvent<ActionEvent>(stateEvent, { detail: { action } }))
      }
    })

    devtools.init(store.state)
  }

  return store
}