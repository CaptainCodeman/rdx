import { Store, ActionEvent } from "../typings"
import { stateEvent } from "./const"

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any
  }
}

export function devtools<T extends Store>(store: T) {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__
  
  if (extension) {
    const devtools = extension.connect()

    let ignoreState = false

    store.addEventListener(stateEvent, e => {
      const { action } = (<CustomEvent<ActionEvent>>e).detail
      if (ignoreState) {
        ignoreState = false
      } else {
        devtools.send(action, store.state)
      }
    })

    devtools.subscribe((message: any) => {
      if (message.type === 'DISPATCH' && message.state) {
        ignoreState = true
        store.state = JSON.parse(message.state)
        // trigger state change for connected components
        store.dispatch({})
      }
    })
    
    devtools.init(store.state)
  }
  
  return store
}