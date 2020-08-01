# Advanced Usage

Assuming you've read through the [quick start](quickstart) you should know the basics of defining models and creating a store.

Let's expand on what else you need to create an application. We'll assume that the app is split into two main parts, the state will be in the `src/state` folder and the UI will be in the `src/ui` folder.

## Store Configuration

Some of the advanced cases need to know the 'type' of the store, which contains two things - the structure of the `state`, and the properties and methods available on the `dispatch` function. This can be inferred from the configuration passed to the `createStore` function, so it's helpful to create a `const` to make re-using this config easier. As you add additional plugins, such as routing, it's also useful to have a separate place to put the setup for those, too, and it helps to keep the config of the store separated from the instantiation of it.

### src/state/config.ts

Our config object is initially very simple. Don't worry, we'll add more to it later!

```ts
import * as models from './models'

export const config = { models }
```

### src/state/store.ts

We now use this in the store setup and also define the type of the store `State` and `Dispatch`. These can be useful if you need to use them as parameters with strict typing enabled, and again, we'll make more use of them later, so just go along with it for now.

```ts
import { createStore, StoreState, StoreDispatch } from '@captaincodeman/rdx'
import { config } from './config'

export const store = createStore(config)

export interface State extends StoreState<typeof config> {}
export interface Dispatch extends StoreDispatch<typeof config> {}
```

## Connected UI Components

While a state store may be the "engine" of our application, what most people think of an app is usually the user interface (UI), that they see. So we want to be able to reflect the state in the UI.

Rdx is designed for the modern web, not web frameworks of yesteryear. The web platform now has a well supported and inbuilt UI component system in the form of *web components*. There's no need to include any component system in our app bundle which is just additional unnecessary bloat although there are some lightweight libraries such as [lit-element](https://lit-element.polymer-project.org/), which can be useful to make creating web components (or *custom elements*) easier.

Not _every_ component needs to be connected to the state store, but you are free to connect them as needed. You may be familiar with the patterns in React known as "Higher Order Components" or Smart vs Dumb components. The difference is that some components are aware of the state store, routing, and other concerns, while others are just plain UI widgets.

Think about your app. You may use UI widgets in the form of a design system / component library such as [Material Web Components](https://material-components.github.io/material-components-web-components/demos/index.html). These are the basic UI pieces, manipulated entirely by setting attributes or properties on them, and they typically communicate any user interaction by raising DOM events. These UI widgets won't know about Rdx, state, routing and so on. You want as much of your UI to be built with these sorts of simple widgets, as it makes developing and testing them easier.

In your app you will then have some richer components, that render information from the state store and pass the data on to the simple UI widgets. These are "pages" or "views", and they need to be connected to the store and will translate the DOM events that happen as a result of user interactions into actions dispatched to the store. These actions mutate the store state which causes the affected parts of the UI to be re-rendered to reflect the changes.

Using a combination of the [reselect](https://github.com/reduxjs/reselect) package to memoize state changes<sup>1</sup> and a web component library such as [lit-element](https://lit-element.polymer-project.org/) which provides efficient DOM updates _without_ the [overhead of a virtual DOM (vdom)](https://svelte.dev/blog/virtual-dom-is-pure-overhead) approach, we get a very responsive and efficient UI.

<sup>1</sup> Reselect can _also_ insulate components from changes to the structure of the state store. So using it is good practice, as well as beneficial for performance, and is well under 1Kb when gzipped.

Connecting an element to the store is easy: Simply inherit from the `connect` mixin which accepts the `store` instance and the base element as parameters. Here's the direct approach for a single component:

```ts
import { LitElement, customElement, property, html } from 'lit-element'
import { connect } from '@captaincodeman/rdx'
import { store, State } from '../state'

@customElement("counter-view")
export class CounterViewElement extends connect(store, LitElement) {
  @property({ type: Number }) count = 0

  mapState(state: State) {
    return {
      count: state.counter
    }
  }

  render() {
    return html`
      <button @click=${store.dispatch.counter.decrement}>-</button>
      <span>${this.count}</span>
      <button @click=${store.dispatch.counter.increment}>+</button>
    `
  }
}
```

The `mapState` and `mapEvents` methods can be used to set the properties on the component and listen to DOM events, mapping them back to the store by dispatching actions. The example above utilizes [lit-html](https://lit-html.polymer-project.org/) event listeners to wire up the events directly. See the [connect API](api-connect) for full usage.

If you have more than a few connected components, you can save some code repetition by creating a connected base component that they inherit from. e.g.

### src/ui/connected.ts

```ts
import { LitElement } from 'lit-element'
import { connect } from '@captaincodeman/rdx'
import { store } from '../state'

// define a base class connected up to the state store
export class Connected extends connect(store, LitElement) {}

// export models and selectors for the state
export * from '../state'
```

### src/ui/counter.ts

Our counter element then doesn't need to import so much:

```ts
import { customElement, property, html } from 'lit-element'
import { Connected, State } from './connected'

@customElement("counter-view")
export class CounterElement extends Connected {
  // ...
}
```

## Effects

Beyond the basic principles of "predictable state" using actions and reducers, one of the key benefits of a state container is being able to hook into the state changes / action dispatches to run additional code, or "side effects". Effectively: "when this happens, I also want to do XYZ".

These are things that _shouldn't be done in a reducer_ because they are either asynchronous (such as calling a remote API to fetch data) or they depend on some external state (such as the browser `localStorage`) and so wouldn't be deterministic if it was done in the reducer (which needs to be pure functions).

An example would be when an item in a list is clicked and becomes 'selected'. We might dispatch an action to set the selected state in our store and _then_ we want to fetch the data to render it. The fetch is a remote API call and asynchronous so it can't be done inside the reducer because we can't guarantee whether it will be successful or not, and we don't know how long it will take to execute.

This is where *effects* come in. An `async` effect function converts these operations into synchronous dispatch calls to mutate the store state in a predictable manner.

Rdx comes with an inbuilt [effects plugin](plugin-effects), which is more powerful than the basic "thunk" plugin of Redux, and possibly easier to understand and simpler than something like redux-saga (and significantly smaller).

Effect functions create methods on the dispatch function for the model, just like the reducer functions do. If you have an effect function called `load` on a `todos` model then you can call it using `dispatch.todos.load()`. It will dispatch a `todos/load` action through the store that you can see with DevTools, it just wont mutate the state unless there is also a reducer with the same name. If there _is_ a reducer with the same name, then the reducer payload and the effect payload should match, and the reducer will _always_ be executed _before_ the effect function. At the point that the effect runs, the state has already been mutated.

### Effects Factory

Effects are defined in a similar way to reducers with the exception, that, instead of being declared as an object with reducer functions as properties, the effects property is a _factory method_, that returns an object with the effect function properties. This factory method takes a parameter, that provides access to the entire store state, and dispatch methods.

This requires a slight change to the store setup, with the introduction of an additional `Store` interface, which adds to the `State` and `Dispatch` already defined:

```ts
import { createStore, StoreState, StoreDispatch, ModelStore } from '@captaincodeman/rdx'
import { config } from './config'

export const store = createStore(config))

export interface State extends StoreState<typeof config> {}
export interface Dispatch extends StoreDispatch<typeof config> {}
export interface Store extends ModelStore<Dispatch, State> {}
```

The `Store` interface is necessary to allow the effects defined in any single model of the store to access the full typed state and dispatch methods of the entire store, with all the models combined. We need access to the full store definition inside something that itself makes up only a part of that definition. This is difficult to achieve, which is why the slight TypeScript indirection (magic?!) is necessary to make it work.

We can now define the `effects` factory function on a model. Let's start with an example where we want to use Rdx to access a list of Todo items. The data will come from a remote REST API and we will have a UI that can display the full list, and a detail page that shows an individual item. Someone could navigate to an individual item from the list page or could land there directly, so when an item is selected, we _might_ have to load it, based on the current state of the store.

```ts
import { createModel } from '@captaincodeman/rdx';
import { Store } from '../store';

export interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

interface State {
  entities: { [key: number]: Todo }
  selected: number
  loading: boolean
}

const endpoint = 'https://jsonplaceholder.typicode.com/'

export default createModel({
  state: <State>{
    entities: {},
    selected: 0,
    fetching: false,
  },

  reducers: {
    select(state, selected: number) {
      return { ...state, selected }
    },

    request(state) {
      return { ...state, fetching: true };
    },

    received(state, todo: Todo) {
      return { ...state,
        entities: { ...state.entities,
          [todo.id]: todo,
        },
        fetching: false,
      };
    },

    receivedList(state, todos: Todo[]) {
      return { ...state,
        entities: todos.reduce((map: any, todo) => {
          map[todo.id] = todo
          return map
        }, {}),
        fetching: false,
      };
    },
  },

  effects(store: Store) {
    // we want to dispatch actions in multiple effects so we can
    // capture the typed dispatch method from the store here instead
    // of repeating it
    const dispatch = store.dispatch()

    // this is also a great place to put other variables that may
    // need to be accessed from multiple effects such as firestore
    // subscriptions

    return {
      // select has the same name as the select reducer above which
      // means it will run after that reducer has completed but will
      // be passed the same payload
      async select(selected: number) {
        // we need the _current_ state each time this effect is run
        // which is why we get it here instead of with the dispatch
        // above
        const state = store.getState()

        // check if the selected todo entity has already been loaded
        if (!state.todos.entities[selected]) {
          // if not, notify the store that we are requesting something
          // this will set the fetching flag to 'true' which could be
          // used to display a loading spinner in the UI
          dispatch.todos.request()
          
          // make the REST API using async await syntax
          const resp = await fetch(`${endpoint}todos/${selected}`)
          const todo: Todo = await resp.json()

          // tell the store that we received the data
          dispatch.todos.received(todo)

          // NOT SHOWN: this could be wrapped in a try / catch block
          // to handle exceptions and dispatch the error message to
          // the store
        }
      },

      async load() {
        // load can be called using dispatch.todos.load() and doesn't
        // have a matching reducer - it will still dispatch an action
        // called `todos/load` which we'll see in the DevTools but it
        // doesn't mutate any state (in this model)
        dispatch.todos.request()
        const resp = await fetch(`${endpoint}todos`)
        const todos: Todo[] = await resp.json()
        dispatch.todos.receivedList(todos)
      }
    }
  }
})
```

### init() Effect

The example above includes a standalone (non-reducing) `load` effect, which could be called using `dispatch.todos.load()`. That might be something you do based on some UI interaction or due to a route change. Sometimes you may have an effect that you want to kick-start automatically when your app runs. While you _could_ just call the dispatch action yourself anytime after the store is initiated, Rdx will automatically run any effect called `init` when the store is created. This can be an ideal place to initialize external listeners that need to interact with the store or to trigger data fetches as soon as the store is initialized.

There is also the factory method itself, but remember: At the point the `effects` factory method is called, and until the function returns the effects object, the store has _not_ been fully initialized so the state and dispatch should not be used directly.

## Inter-Model Communication

Because models typically deal with one 'slice' of state in the overall store, it's easy to develop a blinkered view and imagine that there is always a 1:1 mapping between each model's actions (reducers + effects) and that model's state.

But sometimes you will need one model to respond to actions defined and dispatched by a _different_ model. You could, for instance, have a "todos" model that loads data based on the current authenticated user, with "auth" in it's own model, and when a user signs out you want to clear the list of todo items from memory. There are two ways to approach this.

### Using Reducers

Remember that each reducer function for a model automatically produces the type name for the dispatched action to call it by combining the model name and the function name. So the `signedOut` reducer in an `auth` model will produce an action with the typename `auth/signedOut`. Simple.

If we want to respond to _another_ models action we can simply create a reducer in our model with a string name matching that full action type name. For example:

```ts
export default createModel({
  state: <State>{
    entities: {},
    selected: 0,
    fetching: false,
  },

  reducers: {
    request(state) {
      return { ...state, fetching: true };
    },

    receivedList(state, todos: Todo[]) {
      return { ...state,
        entities: todos.reduce((map: any, todo) => { map[todo.id] = todo; return map }, {}),
        fetching: false,
      };
    },

    // this will be called in the same 'reduce' operation as the auth model itself
    // so DevTools will show both the auth.user being set to null AND the todo entities
    // being cleared.
    //
    // NOTE: that the state we're dealing with is always the state of the model we're
    // in, the payload is available (if the source reducer defines one) but each model
    // can only ever mutate it's _own_ state
    'auth/signedOut'(state) {
      return { ...state
        entities: {},
      }
    }
  }
}
```

Now, whenever the `auth/signedOut` action is dispatched, the `todos` model will know to clear it's own state.

This allows the `todos` model to "hook into" the reducer action defined in the auth model and update it's own state in response to it being dispatched. The `auth` model knows nothing of this integration and the state for both models will be updated together because the root reducer that Rdx creates for you (using `combineReducers` under-the-covers) passes each action dispatched to _all_ the model reducers as part of a single, immediate, 'state update' operation.

### Using Effects

Another way to coordinate work between models is to use an effect in one model to dispatch an action to another. With the auth / todos example, we have a `signedOut` reducer that clears the auth state, so we could add an identically named `signedOut` effect, that will run immediately after the reducer, which could then dispatch an action to clear the todos:

```ts
import { createModel } from '@captaincodeman/rdx'
import { Store } from '../store'
import { User } from '../firebase'

export interface AuthState {
  user: User | null
  statusKnown: boolean
}

export default createModel({
  state: <AuthState>{
    user: null,
    statusKnown: false,
  },

  reducers: {
    signedIn(state, user: User) {
      return { ...state, user, statusKnown: true }
    },

    signedOut(state) {
      return { ...state, user: null, statusKnown: true }
    },
  },

  effects(store: Store) {
    const dispatch = store.dispatch()

    return {
      async signedOut() {
        // user has been signed out, clear the todos
        dispatch.todos.clear()
      },
    }
  }
})
```

This adds the knowledge of the inter-model communication to the sender - the todos model wouldn't know anything about auth or _why_ it was being cleared, only that it had a `clear` action that it had to respond to.

The benefit of this approach is that it's strongly typed and you see the clear, separate, todos action in the DevTools. But the downside is that it's less immediate - there is a state immediately after the user being signed out where the `state.auth.user` is null but the `state.todos.items` is still populated. Although effects run almost immediately, any state update will likely trigger UI changes that could show that inconsistent state - an auth status may show 'anonymous visitor' while the todos are still shown.

If signing out the user has to dispatch multiple actions, then this causes multiple UI updates in a cascade, which may or may not be noticeable. One place where it can become more obvious is if you combine routing and use an effect, listening to the `route/change` action, to extract parameters and dispatch a `select` type reducer action. Suppose your router is looking at the routing state to chose which view to render. The user clicks a link to navigate to `/todos/123`. At this point the state has changed so any affected UI components will update which causes the `TodoDetail` view to render. It looks for the selected todo to display but the selected ID has not been set yet or is still set to a previously viewed ID. In this case the view could be showing the wrong thing. If you have a more elaborate scenario where you have summary data in a list and extra detail that loads when an item is selected, you could end up showing the title (from the summary) for one item and the detail (from the previously selected) from another.

The aim of a state container is to have predictable and _consistent_ state, so whenever you can update state in a reducer, this is _preferred_ over updating state through an effect, regardless of which model the effect is in.

Dispatching multiple actions when there is already an action that the model could respond to is really an _anti-pattern_ and _not recommended_.

See this excellent presentation ([slides](https://rangle.slides.com/yazanalaboudi/deck)) for a more in-depth explanation of why this approach can be wrong:

<iframe width="560" height="315" src="https://www.youtube.com/embed/K6OlKeQRCzo?start=2626" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Routing

Routing is usually an important part of any client-side app. The current view and parameters for it can be extracted from the browser address bar, and if you click a link within your app, the navigation should be intercepted to update the state. Because it's so common, Rdx provides an inbuilt and integrated router, which adds the routing information to the store. This way it can be used as a trigger within your models and also to drive the views in your UI.

The routing plugin for Rdx relies on a separate [ultra-tiny (370 byte) router library](https://www.npmjs.com/package/@captaincodeman/router) to perform the route matching. The plugin provides the browser navigation interception and integration of routing information into the store state.

### Routing Configuration

Remember the ridiculously simple config we created earlier? Let's add the routing config to it. Here's an example showing some routes defined and the config that we return expanded to include the routing plugin.

```ts
import { routingPlugin } from '@captaincodeman/rdx'
import createMatcher from '@captaincodeman/router'
import * as models from './models'

const routes = {
  '/':          'view-home',
  '/todos':     'view-todos',
  '/todos/:id': 'view-todo-detail',
  '/*':         'view-404',
}

const matcher = createMatcher(routes)
const routing = routingPlugin(matcher)

export const config = { models, plugins: { routing } }
```

The default plugin configuration handles parameters in the URL path, so navigating to `/todos/123` would result in the state containing:

```json
{
  "routing": {
    "page": "view-todo-detail",
    "params": {
      "id": "123"
    },
    "queries": {}
  }
}
```

The routing plugin intercepts any navigation links within your app ignoring download, external and targeted links plus keyboard-modified clicks to retain normal browser-behavior (e.g. of opening a link in a new tab). It also adds additional dispatch methods to the store to allow you to navigate programmatically using `dispatch.routing.back()` to go back, for instance.

See the [routing API](api-routing) for more details on the options available.

### Router Outlet

When you have the route information in the state store, you can use it to drive your application views. To do this you will typically have some kind of 'router outlet' which switches the UI shown based on the current route selected.

There are several ways to do this, see the [routing recipes](recipe-routing) for more alternatives and the nuances between them. Here is a simple router outlet as a web component:

```ts
import { RoutingState } from '@captaincodeman/rdx'
import { Connected, State } from '../connected'

class AppRouterElement extends Connected {
  // the page property is the _current_ page / view rendered
  private page: string

  // connected mapState method sets the route from the state
  mapState(state: State) {
    return {
      route: state.routing
    }
  }

  // route setter handles the route changing. If the page has
  // changed (not just a parameter) then we need to clear any
  // previous view and render the new one. In this case we're
  // assuming that a page called 'view-home' would correspond
  // to a web component with the same name
  set route(val: RoutingState) {
    if (val.page !== this.page) {
      const el = document.createElement(val.page)
      this.textContent = ''
      this.appendChild(el)
      this.page = val.page
    }
  }
}

customElements.define('app-router', AppRouterElement)
```

You can simply include this `<app-router>` element in your `index.html` page or the main app-shell component of your application and your app will then render the appropriate view as you navigate. If you include it in another connected component, you could remove the need for it to be connected to the store and do the `mapState` of the routing in the parent, passing it as a property to the router outlet.

The router outlet can also be an ideal place to code-split your UI, so code for views is only loaded when (and if) someone navigates to them.

### Models Integration

But changing the UI is just one part of what routing can be used for. One thing people often do is use UI components to trigger data fetching, but in my opinion this is an anti-pattern. Not only does it couple the UI components to non-UI concerns, making them more complex to develop and test, but it means that the data fetch doesn't happen _until_ the UI component has been rendered.

This initial render often means a relatively large UI framework has been loaded plus additional UI components and widgets. Waiting for all this to happen simply delays the fetch and adds latency to the time when your users see data on the screen.

Utilizing Rdx can make your code easier and faster. Because the state store part of your app can be so small and everything relies on it, it makes sense to load it sooner. When it loads, the models in your store can make use of the routing information to fetch data even though the views to render that data are themselves still being loaded. This ensures that rendering information is not the cumulative time for UI and data to load, but the time of whichever is the slowest.

If there's a single fetch based on the route (without parameters) then an effect can be setup to check the route and initiate the data fetching (if it hasn't already been done). This would load the todos only when someone navigated to the `todos-view` which would render the list when loaded.

```ts
import { createModel, RoutingState } from '@captaincodeman/rdx'

export default createModel({
  // state and reducers not shown

  effects(store: Store) {
    const dispatch = store.dispatch()

    return {
      async 'routing/change'(payload: RoutingState) {
        // check the page from routing
        switch (payload.page) {
          // if we're on the todos-view
          case 'todos-view':
            // check if we've already loaded them
            const state = store.getState()
            if (state.todos.ids.length === 0) {
              // if not, show the loading indicator
              dispatch.todos.request()
              // request them
              const resp = await fetch(`${endpoint}todos`)
              const todos: Todo[] = await resp.json()
              // and update the store
              dispatch.todos.receivedList(todos)
            }
            break
        }
      }
    }
  }
})
```

If the data for a route depends on parameter values from the route, it's usually best to set any `selected` state property in a reducer and then use the effect to load the data. As you saw in the [Inter-Model Communication Using Effects](advanced?id=using-effects) section, setting the selected item in the effect _can_ lead to inconsistent state as at that point, the UI could be attempting to render something based on the reducer state, with the model state that relies on the reducer state not yet reflecting it and needing another action dispatch to synchronize it.

Here's how it might look:

```ts
import { createModel, RoutingState } from '@captaincodeman/rdx'

export default createModel({
  // state and other reducers not shown

  reducers: {
    'routing/change'(state, payload: RoutingState) {
      return {
        ...state,
        selected: payload.params.id
      }
    }
  },

  effects(store: Store) {
    const dispatch = store.dispatch()

    return {
      async 'routing/change'(payload: RoutingState) {
        // check the page from routing
        switch (payload.page) {
          // if we're on the todos-detail-view
          case 'todos-detail-view':
            // check if we've already loaded it
            const state = store.getState()
            const id = payload.params.id
            if (state.todos.items[id] === undefined) {
              // if not, show the loading indicator
              dispatch.todos.request()
              // request it
              const resp = await fetch(`${endpoint}todos/${id}`)
              const todo: Todo = await resp.json()
              // and update the store
              dispatch.todos.received(todo)
            }
            break
        }
      }
    }
  }
})
```

Note that we still do the fetching in an effect (and we're checking if we really need to fetch it first), but the actual state update of which item is currently selected is done in the reducer.

Although re-dispatching in an effect in response to route changes does, in some ways, seem to provide more "informative" explicit actions in the store (i.e. you might see `todo/selected` instead of `routing/change`) the drawbacks and extra UI complications it can create far outweigh this slight benefit.

## Polyfills

We've built Rdx to use modern web standards and if you're using a modern browser such as Chrome then Rdx will work directly. Some platform features that it relies on have been added at later times in different browsers, so sometimes a polyfill may be required if you want to support those browsers. Best practice is to leave the loading of polyfills as an application concern, rather than force them on users that don't need them, have them duplicated by different packages, and to provide flexibility for [fast and efficient polyfill loading](https://www.captaincodeman.com/2020/03/10/eternal-polyfilling-of-the-legacy-browser).

Here are the features that may require polyfills:

### queueMicrotask

The [`queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask) method of the `window` object queues a microtask to be executed at the end of the current event loop.

A polyfill for this is very small and should be inlined if your target browsers don't support it.

```ts
if (typeof window.queueMicrotask !== 'function') {
  window.queueMicrotask = callback => Promise.resolve().then(callback)
}
```

### EventTarget

The underlying `Store` implementation acts as an [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget), using the browsers inbuilt `addEventListener` for subscriber functionality used internally and available if you want to subscribe to store state changes or implement your own middleware.

Unfortunately, the [`EventTarget` constructor()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/EventTarget) is not currently supported in WebKit, so if you want to support Safari users, an additional small (589 byte) polyfill is needed, which can be loaded only when required:

```html
<script>try{new EventTarget}catch(e){document.write('<script src="https://unpkg.com/@ungap/event-target@0.1.0/min.js"><\x2fscript>')}</script>
```

Once support for `EventTarget` is added, this polyfill will stop loading automatically, at which point it can be removed.

Because it's so small you might chose to include it in your bundle to avoid the additional request and possible effect that having a `document.write` statement has on Chrome optimizations. The [demo project](https://github.com/CaptainCodeman/rdx-demo/) demonstrates how to do this.
