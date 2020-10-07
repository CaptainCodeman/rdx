import { readable } from 'svelte/store'
import type { Store } from '../typings'

export function connect<S>(store: Store<S>) {
  const state = readable<S>(store.state, (set) => {
    const handler = () => {
      set(store.state)
    }
    store.addEventListener('state', handler)
    return () => store.removeEventListener('state', handler)
  })

  return {
    subscribe: state.subscribe,
    dispatch: store.dispatch,
  }
}
