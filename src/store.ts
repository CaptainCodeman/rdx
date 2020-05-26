import { Action, ActionEvent, Reducer } from '../typings/store'
import { dispatchEvent, stateEvent } from './const'

export class Store<S> extends EventTarget {
  constructor(public state: S, public reducer: Reducer<S>) {
    super()

    // dispatch an empty action so all reducers can initialize
    this.state = this.reducer(this.state, {})
  }

  dispatch(action: Action) {
    // event contains the action to dispatch
    const evt = new CustomEvent<ActionEvent>(dispatchEvent, {
      cancelable: true,
      detail: { action },
    })

    // only process through reducers if it _wasn't_ cancelled
    if (this.dispatchEvent(evt)) {
      // middleware _might_ have modified the action ...
      action = evt.detail.action

      this.state = this.reducer(this.state, action)

      // notify subscribers that the state has changed
      this.dispatchEvent(new CustomEvent<ActionEvent>(stateEvent, {
        detail: { action },
      }))
    }

    return action
  }
}
