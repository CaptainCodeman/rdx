import { Store, StoreEvent } from "./store";
import { stateEvent } from "const";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any
  }
}

export function devtools(store: Store<any>) {
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__
  
  if (extension) {
    const devtools = extension.connect()

    let ignoreState = false

    store.addEventListener(stateEvent, e => {
      const { action } = (<CustomEvent<StoreEvent>>e).detail
      if (ignoreState) {
        ignoreState = false
      } else {
        devtools.send(action, store.state)
      }
    })

    devtools.subscribe(message => {
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