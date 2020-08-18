# connect

`connect` is a mixin that "connects" a web component to the store. It provides two methods:

## mapState

`mapState(state: State)` passes the current store state to the component to allow it to extract the state it needs. It should return an object who's properties will be applied to the instance. It's good practice to use a package such as [reselect](https://github.com/reduxjs/reselect) to avoid unnecessary updates and also act as a buffer to insulate components from changes to the store state.

## mapEvents

`mapEvents()` defines a mapping from events that the component will listen to, and actions that it can dispatch to the store. The method should return an object that maps the event names to listen to, to the functions that will be called (usually to dispatch an action to the store using details from the event).

## Example

This example shows a simple counter component using [lit-element](https://lit-element.polymer-project.org/) connected to the store to display the current counter state and automatically dispatch actions to increment or decrement it. Not shown: the custom buttons would raise the `increment-counter` and `decrement-counter` custom events, or regular `@click` [lit-html event handlers](https://lit-html.polymer-project.org/) could be used to dispatch actions directly.

```ts
import { LitElement } from 'lit-element'
import { connect } from '@captaincodeman/rdx'
import { store, State } from './store'

export class CounterElement extends connect(store, LitElement) {
  @property({ type: Number })
  count

  mapState(state: State) {
    return {
      count: state.counter
    }
  }

  mapEvents() {
    return {
      'increment-counter': (e: CustomEvent) => store.dispatch.counter.increment(),
      'decrement-counter': (e: CustomEvent) => store.dispatch.counter.decrement(),
    }
  }

  render() {
    return html`
      <increment-button></increment-button>
      <span>${this.count}</span>
      <decrement-button></decrement-button>
    `
  }
}
```
