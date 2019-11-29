import { stateEvent, dispatchEvent } from "./const"
import { Action, Reducer, StoreEvent } from "../typings"

export class Store<S> extends EventTarget {
  constructor(public state: S, public reducer: Reducer<S>) {
    super()
    this.state = this.reducer(this.state, {})
  }

  dispatch(action: Action) {
    const evt = new CustomEvent<StoreEvent>(dispatchEvent, {
      cancelable: true,
      detail: { action },
    })

    if (this.dispatchEvent(evt)) {
      action = evt.detail.action
      this.state = this.reducer(this.state, action)
      this.dispatchEvent(new CustomEvent<StoreEvent>(stateEvent, {
        detail: { action },
      }))
    }

    return action
  }
}
