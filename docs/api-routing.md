# routingPlugin

The `routingPlugin` factory function creates a plugin for integrating [@captaincodeman/router](https://github.com/CaptainCodeman/js-router).

```ts
import { routingPlugin } from '@captaincodeman/rdx'
// ...
export const routing = routingPlugin(matcher, options)
```

- `matcher` is a matcher object from the `@captaincodeman/router` package.
- `options` is optional and provides additional configuration for the plugin. See [Routing Options](api-routing?id=routing-options).

You need to register the plugin when [creating the store](api-createStore?id=plugins):

```ts
import { createStore } from '@captaincodeman/rdx'
import * as models from './models'
import { routing } from './routing'

const config = { models, plugins: { routing }}
export const store = createStore(config)
```

## Routing Model

The routing plugin will integrate itself with Rdx by providing its own model. The model will be registered under the name that was provided as the key to the `plugins` section of the `config` option. (In the previous example this name is `routing`.)

### Routing State Branch

The routing model provides state in the following shape:

```ts
interface RoutingState {
  page: any
  params: { [key: string]: any}
  queries?: { [key: string]: string | string[] }
}
```

- `page` will hold what ever value the router's matcher resolved.
- `params` will hold any named parameters, that were taken from the URL.
- `queries` is optional and may hold additional parameters, that were taken from the query string part of the URL. See [withQuerystring](api-routing?id=withquerystring).

### Routing Reducers

The routing model provides the following reducer:

```ts
type RoutingReducers = {
  change: (state: any, payload: RoutingState) => RoutingState
}
```

You can use this to [integrate routing into your own models](advanced?id=models-integration).

### Routing Effects

The routing model provides effects for triggering navigation through the browser's [`History` interface](https://developer.mozilla.org/en-US/docs/Web/API/History):

```ts
type RoutingEffects = {
  back: () => void
  forward: () => void
  go: (payload: number) => void
  push: (href: string) => void
  replace: (href: string) => void
}
```

## Routing Options

```ts
interface RoutingOptions {
  transform: (result: Result) => RoutingState
}
```

- `transform` is a callback that is used to transform the "raw" `result` from the router into the full `RoutingState` for the model.

### withQuerystring

If your application needs to access parameters provided through query strings, you can register the `withQuerystring` function as a `transform` on the `RoutingOptions`:

```ts
// other imports and code omitted
import { routingPlugin, withQuerystring } from '@captaincodeman/rdx'

const options = { transform: withQuerystring }
const routing = routingPlugin(matcher, options)
```

This is provided as _opt-in_, as the code for parsing the query string increases the bundle size of your application and not every application actually needs it.
