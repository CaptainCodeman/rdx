# persist

The `persist` store decorator adds state persistence and hyration to the store.

```ts
import { createStore, persist } from '@captaincodeman/rdx'
import { config } from './config'

export const store = persist(createStore(config))
```

The default persistence saves the entire state to `localStorage` using `JSON` serialization after each action dispatch and checks for it's existence at startup, rehyrating the state to restore it if found.

## Options

An optional parameters object allows control over when and how to persist state:

```ts
import { createStore, persist } from '@captaincodeman/rdx'
import { config } from './config'

const options = {
  // only perist when counter changes
  filter: (action) => action.type.startsWith('counter'),
  // only save the counter state
  persist: (state) => {
    const { counter, ...other } = state
    return { counter }
  },
}

export const store = persist(createStore(config), options)
```

```ts
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
}
```