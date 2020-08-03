# createStore

```ts
function createStore(config: Config): Store
```

The `createStore` function creates a store based on the config object provided.

The config object can contain the following properties:

## models

The `models` property should contain a map of all the models to be used by the store. Putting the models in their own modules can help keeping things tidy and all the code for your store state separate from the store setup code.

## plugins

Rdx supports the concept of plugins which can augment the store functionality and add to the state of the models. The `Dispatch` and `Effects` functionality is implemented as plugins that are _always_ loaded. The Routing is a separate, optional plugin, that you can chose to include in your app or not. It should be possible to create additional plugins, such as a simple redux-saga-like middleware if you like the JavaScript Generators approach.

The `plugins` property is a map of plugins to use. Each plugin can define its own optional `model` (using the [`createModel` function](api-createModel)) and has the following optional lifecycle methods, to allow it to hook into the store:

```ts
onModel<Model>(store: ModelStore, name: string, model: Model): void
```

Executes as each model for the store is initialized.

```ts
onStore(store: ModelStore): void
```

Executes when the store configuration is complete.

## state

The `state` property allows the initial state for the store to be set which is used when re-hydrating saved state or if initiating state from server-rendered JSON embedded in the page. The state can be partial - any state property that is undefined will use the initial state defined for the corresponding model instead.

## Example

Here's a simple but complete example of setting up a store to support devtools, persistence, routing and async effects with models separated into their own modules.

### Store

The store defines plugins to use, such as routing, and decorators to apply to the store. It does not really know about the models in the store.

#### state/store.ts

```ts
import { createStore, devtools, persist, StoreState, StoreDispatch, ModelStore } from '@captaincodeman/rdx'
import { config } from './config'

export const store = devtools(persist(createStore(config)))

export interface State extends StoreState<typeof config> {}
export interface Dispatch extends StoreDispatch<typeof config> {}
export interface Store extends ModelStore<Dispatch, State> {}
```

#### state/config.ts

```ts
import { routingPlugin } from '@captaincodeman/rdx'
import createMatcher from '@captaincodeman/router'
import * as models from './models'

// define application route / view mappings:
const routes = {
  '/':  'view-home',
  '/*': 'view-404',
}

const matcher = createMatcher(routes)
const routing = routingPlugin(matcher)

export const config = {
  models,
  plugins: {
    routing
  }
}
```

### Models

The models actually define the state and functionality for your store. This is where most of your app state code will be written.

#### state/models/index.ts

```ts
export { auth } from './auth'
export { todos } from './todos'
```

#### state/models/auth.ts

```ts
import { createModel } from '@captaincodeman/rdx`

export const auth = createModel({
  // ...
})
```

#### state/models/todos.ts

```ts
import { createModel } from '@captaincodeman/rdx`

export const todos = createModel({
  // ...
})
```
