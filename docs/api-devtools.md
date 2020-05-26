# devtools

The `devtools` store decorator adds Redux DevTools integration to the store.

```ts
import { createStore, devtools } from '@captaincodeman/rdx'
import { config } from './config'

export const store = devtools(createStore(config))
```

Because it's a decorator, it can be combined with other decorators to add functionality to the store:

```ts
import { createStore, devtools, persist } from '@captaincodeman/rdx'
import { config } from './config'

export const store = devtools(persist(createStore(config)))
```