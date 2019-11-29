import { Store, StoreEvent, Action } from "./store";

export interface Options<S> {
  // name sets the state key to use, useful in development to avoid conflict
  // with other apps. Default is to use the app location hostname
  name: string
  // filter predicate allows control over whether to persist state based on 
  // the action. Default is to trigger persistence after all actions
  filter: (action: Action) => boolean
  // persist allows transforming the state to only persist part of it.
  // Default is to persist complete state
  persist: (state: S) => Partial<S>
  // delay introduces a delay before the save is performed. If another persist
  // is triggered before it expires, the previous persist is cancelled and a
  // new one scheduled. This can save doing too many persist operations by
  // debouncing the triggering. Default is 0 delay
  delay: number
  // TODO: version for updates, expiry etc...
}

// TODO: make storage plugable (localStorage, indexedDB etc...)
// TODO: plugin storage could be wrapped with lz-string for compression
//       or provide hooks to transform (before save / after load)
// TODO: provide methods to purge, clear, flush etc... (state / actions?)

export function persist<S>(store: Store<S>, options: Partial<Options<S>>) {
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

  store.addEventListener('state', e => {
    const ev = <CustomEvent<StoreEvent>>e
    const { action } = ev.detail

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
