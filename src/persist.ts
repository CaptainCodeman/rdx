import { Store, Action, PersistOptions } from "../typings"
import { stateEvent } from "./const"

// TODO: make storage plugable (localStorage, indexedDB etc...)
// TODO: plugin storage could be wrapped with lz-string for compression
//       or provide hooks to transform (before save / after load)
// TODO: provide methods to purge, clear, flush etc... (state / actions?)

export function persist<S>(store: Store<S>, options?: Partial<PersistOptions<S>>) {
  const opt = {
    name: location.hostname,
    filter: (_action: Action) => true,
    persist: (state: S) => state,
    delay: 0,
    ...options
  }

  const state = localStorage.getItem(opt.name)
  if (state) {
    store.state = { ...store.state, ...JSON.parse(state) }
  }

  let task = 0

  store.addEventListener(stateEvent, e => {
    const action = (<CustomEvent<Action>>e).detail

    if (opt.filter(action)) {
      if (task) {
        window.clearTimeout(task)
      }
      task = window.setTimeout(() => {
        localStorage.setItem(opt.name, JSON.stringify(opt.persist(store.state)))
        task = 0
      }, opt.delay)
    }
  })

  return store
}
