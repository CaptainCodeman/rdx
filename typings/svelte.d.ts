import type { Dispatch, Store } from './store'

export declare function connect<S>(store: Store<S>): {
  subscribe: (run: (value: S) => void, invalidate?: (value?: S) => void) => () => void
  dispatch: Dispatch
}
