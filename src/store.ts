import { stateEvent, dispatchEvent } from "./const"
import { Action, Reducer } from "../typings"

export class Store<S> extends EventTarget {
  constructor(public state: S, public reducer: Reducer<S>) {
    super()
    this.state = this.reducer(this.state, {})
  }

  dispatch(action: Action) {
    const evt = new CustomEvent<Action>(dispatchEvent, {
      cancelable: true,
      detail: action,
    })

    if (this.dispatchEvent(evt)) {
      action = evt.detail
      this.state = this.reducer(this.state, action)
      this.dispatchEvent(new CustomEvent<Action>(stateEvent, {
        detail: action,
      }))
    }

    return action
  }
}
