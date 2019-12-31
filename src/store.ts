import { Action, ActionEvent, Reducer } from '../typings'
import { dispatchEvent, stateEvent } from './const'

export class Store<S> extends EventTarget {
  constructor(public state: S, public reducer: Reducer<S>) {
    super()
    this.state = this.reducer(this.state, {})
  }

  dispatch(action: Action) {
    const evt = new CustomEvent<ActionEvent>(dispatchEvent, {
      cancelable: true,
      detail: { action },
    })

    if (this.dispatchEvent(evt)) {
      action = evt.detail.action
      this.state = this.reducer(this.state, action)
      this.dispatchEvent(new CustomEvent<ActionEvent>(stateEvent, {
        detail: { action },
      }))
    }

    return action
  }
}
