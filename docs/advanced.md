# Advanced Usage

Assuming you've read through the [quick start](quickstart) you should know the basics of defining models and creating a store.

Let's expand on what else you need to create an application.

## Strong Typing

The store is strongly typed but sometimes you want to access the state or dispatch types to define as parameters. Rdx provides type helpers to create these type definitions which can be exported together with the store.

```ts
import { createStore, StoreState, StoreDispatch } from '@captaincodeman/rdx'
import { config } from './config'

const store = createStore(config)

export interface State extends StoreState<typeof config> {}
export interface Dispatch extends StoreDispatch<typeof config> {}
```

## Connecting UI

While a state store may be the "engine" of our application, what most people think of an app is usually the User Interface that they see. So we want to be able to reflect the state in the UI.

Rdx is designed for the modern web, not web frameworks of yesteryear. The web platform now has a well supported and inbuilt UI component system in the form of WebComponents. There's no need to include any component system in our app bundle which is just additional unnecessary bloat although there are some lightweight template libraries such as [lit-element](https://lit-element.polymer-project.org/) which can be useful to make creating Custom Elements easier.

Not _every_ component needs to be connected to the state store but you are free to connect them as needed. You may be familiar with the patterns in React known as "High Order Components" or Smart vs Dumb components. The difference is that some components are aware of the state store, routing and other concerns and others are just plain UI widgets.

Think about your app. You may use UI widgets in the form of a design system / component library such as [Material Web Components](https://material-components.github.io/material-components-web-components/demos/index.html). These are the basic UI pieces manipulated entirely by setting attributed or properties on them and they typically communicate any user interaction by raising DOM events. These UI widgets won't know about Rdx, state, routing and so on. You want as much of your UI to be built with these sorts of simple widgets, as it makes developing and testing them easier.

In your app you will then have some richer components that render information from the state store and pass the data on to the simple UI widgets. These are pages or views and they need to be connected to the store and will translate the DOM events that happen as a result of user interactions into actions dispatched to the store. These actions mutate the store state which causes the affected parts of the UI to be re-rendered to reflect the changes.

Using a combination of the [reselect](https://github.com/reduxjs/reselect) package to memoize state changes<sup>1</sup> and a Web Component library such as [lit-element](https://lit-element.polymer-project.org/) which provides efficient DOM updates _without_ the [overhead of a Virtual DOM (vdom)](https://svelte.dev/blog/virtual-dom-is-pure-overhead) approach, we get a very responsive and efficient UI.

<sup>1</sup> Reselect can _also_ insulate components from changes to the structure of the state store so is good practice, as well as beneficial for performance, and is well under 1Kb when gzipped.

Connecting an element to the store is easy - simply inherit from the `connect` mixin which accepts the `store` instance and the base element as parameters, here's the direct approach for a single component:

```ts
import { LitElement, customElement, property, html } from 'lit-element'
import { connect } from '@captaincodeman/rdx'
import { store, State } from './store'

@customElement("counter-view")
export class CounterElement extends connect(store, LitElement) {
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

If you have more than a few connected components you can save some code repetition by creating a connected base component that they inherit from. e.g.

### src/connected.ts

```ts
import { LitElement } from 'lit-element'
import { connect } from '@captaincodeman/rdx'
import { store } from './store'

export class Connected extends connect(store, LitElement) {}
export * from './store'
```

### src/counter.ts

Our counter element then doesn't need to import so much:

```ts
import { customElement, property, html } from 'lit-element'
import { Connected, State } from './connected'

@customElement("counter-view")
export class CounterElement extends Connected {
  // ...
}
```

TODO: move this to recipes to keep this shorter as it's simply 'style'?

## Asynchronous Effects

Beyond the basic principles of "predictable state" using actions and reducers, one of the key benefits of a state container is being able to hook into the state changes / action dispatches to run additional code, or "side effects". Effectively "when this happens, I also want to do XYZ".

These are things that _shouldn't_ be done in a reducer because they are either asynchronous (such as calling a remote API to fetch data) or they depend on some external state (such as the browser `localStorage`) and so wouldn't be deterministic if it was done in the reducer (which need to be pure functions).

An example would be when an item in a list is clicked and becomes 'selected'. We might dispatch an action to set the selected state in our store and then we want to fetch the data to render it.

This is where Effects come in.

Rdx comes with an inbuilt [effects plugin](plugin-effects) which is more powerful than the basic "thunk" plugin of Redux but easier to use than something like redux-saga (and much smaller).

To use it we first define an extra type as part of our store setup:

```ts
import { createStore, StoreState, StoreDispatch, ModelStore } from '@captaincodeman/rdx'
import { config } from './config'

export const store = createStore(config))

export interface State extends StoreState<typeof config> {}
export interface Dispatch extends StoreDispatch<typeof config> {}
export interface Store extends ModelStore<Dispatch, State> {}
```

The `Store` interface is necessary to allow the effects defined in any one model of the store to access the full typed store state and dispatch method. Think about it - one of the individual models needs to access the full type of the model, so the definition is a little "circular". But it works to provide full type safety as you'll see.

TODO: example of effects, nuances (when to use reducer vs effects, esp with routing)

## Routing

TODO