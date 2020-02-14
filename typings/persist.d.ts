import { Action, Store } from './store'

export interface PersistOptions<S> {
  // name sets the state key to use, useful in development to avoid conflict
  // with other apps. Default is to use the app location hostname
  name: string

  // provide a hook where the serialization could be provided, e.g. by using
  // something like https://github.com/KilledByAPixel/JSONCrush. Default is
  // the JSON serializer
  serializer: {
    parse(text: string): any
    stringify(value: any): string
  }

  // provide a hook where the storage can be replaced. Default is localStorage
  storage: {
    getItem(name: string): string | null
    setItem(name: string, value: string): void
  }

  // filter predicate allows control over whether to persist state based on 
  // the action. Default is to trigger persistence after all actions
  filter: (action: Action) => boolean

  // persist allows transforming the state to only persist part of it.
  // Default is to persist complete state
  persist: (state: S) => Partial<S>

  // delay introduces a delay before the save is performed. If another persist
  // is triggered before it expires, the previous persist is cancelled and a
  // new one scheduled. This can save doing too many persist operations by
  // debouncing the triggering. Default is 0ms
  delay: number

  // TODO: version for updates, expiry etc...
}

export declare function persist<S, T extends Store>(store: T, options?: Partial<PersistOptions<S>>): T