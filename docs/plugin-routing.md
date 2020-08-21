# Routing Plugin

Rdx provides a plugin for integrating [@captaincodeman/router](https://github.com/CaptainCodeman/js-router), a tiny routing library for use in SPAs / PWAs. The plugin [provides its own model](api-routing?id=routing-model), making it a first-class citizen of Rdx, and automatically hooks into the browser's navigation by [intercepting hyperlinks](plugin-routing?id=intercepting-hyperlinks) and [integrating with the browser history](plugin-routing?id=history-integration). So all your users' interactions that result in navigation, be it clicking on a link or using the back button, happen "in-band" of your app's state and your app can react accordingly. Also, if you programmatically trigger navigation, this integrates nicely with the browser's native navigation (i.e. it doesn't "break the back button"). All of this works towards a positive user experience.

## Browser Integration

Users don't like surprises. They expect the back button to go back to the last thing they were looking at, and they expect clicking on a link to take them somewhere else to look at. It's the fundamental way of how the web works, and users are well trained to expect this behaviour.

Browsers were originally built for loading and displaying an HTML page, and then possibly navigating to another page, loading and displaying that. But when writing an SPA (single page application), you break with this traditional approach; you want all URLs inside your app ("below your app's starting point") to be handled by your app's (JavaScript) code, instead of triggering network requests for different pages.

But, for a good user experience, you still want the back button and hyperlinks (i.e. `<a>` elements) to look and work like they always do. The fact, that you chose to implement your app as an SPA and not with multiple pages is an implementation detail the user should not be concerned with.

The routing plugin integrates with the browser to help you achieve this.

### Intercepting Hyperlinks

To prevent your user from accidentally navigating away from your app, the routing plugin registers a universal event handler for intercepting clicks on `<a>` elements. If the URL of a hyperlink points to a page inside your app, the default behaviour (i.e. sending a network request) is prevented and instead the router will be called. In many other cases though, the browser's native behaviour is preserved in order to not surprise or upset your users (or you).

Native behaviour means to _follow_ the link, which will occur if ...

- ...the link destination is not within the app.
- ...the hyperlink anchor has the `rel` attribute set and it contains `external`.
- ...the hyperlink anchor has the `download` attribute set.
- ...it's not just a regular click (i.e. not with the primary button, or with a modifier key held down).

### History Integration

The routing plugin integrates with browser history in both directions: When the user navigates, or when your app triggers navigation.

The plugin registers for changes to the browser history / navigation [through the popstate event](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event). So when your user navigates by using the browser history (e.g. the back button), the information about that goes to the router and, if the resulting routing state changed, the change gets recorded in your Rdx state store.

The plugin further allows you to programmatically navigate by using the [`History` interface](https://developer.mozilla.org/en-US/docs/Web/API/History). This is exposed through [effects on the model of the plugin](api-routing?id=routing-effects).

## Example

This is a short example how you would set-up the routingPlugin.

### src/state/config.ts

```ts
import createMatcher from '@captaincodeman/router'
import { routingPlugin } from '@captaincodeman/rdx'
import * as models from './models'

// map the URL pattern (optionally with named parameters)
// to any value. strings will do just fine.
const routes = {
  '/': 'home',
  '/todos': 'todo-list',
  '/todos/:id': 'todo-details',
  '/*': 'not-found',
}

const matcher = createMatcher(routes)
const routing = routingPlugin(matcher)

export const config = { models, plugins: { routing } }
```

### src/state/store.ts

```ts
import {
  createStore,
  ModelStore,
  StoreState,
  StoreDispatch,
} from '@captaincodeman/rdx'
import { config } from './config'

export const store = createStore(config)
export interface State extends StoreState<typeof config> {}
export interface Dispatch extends StoreDispatch<typeof config> {}
export interface Store extends ModelStore<Dispatch, State> {}
```

### Afterthoughts

Now that the routing plugin is set up, check out the advanced usage guide and see you how to [render different views in a router outlet](advanced?id=router-outlet) based on that routing information, and also how to [early start loading data](advanced?id=models-integration) (i.e. don't wait for the view to load, but start fetching data as soon as the route changes).

Some things were deliberately kept simple. E.g. if you have many routes, or need to [configure the router](api-routing?id=routing-options), you might want to extract the routing bits from the `config.ts` module into their own file.

Also, for simplicity, in this example the routes just resolve to simple string literals like `'home'`. If your app doesn't have many routes and only a single router outlet, this will do just fine. Should you want to add additional protection from typos as your app grows, and improve support for refactoring, consider using string `enum`s or `const`s instead.