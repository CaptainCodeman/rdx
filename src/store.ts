export type Action<P = any> = { type?: string, payload?: P }

export type Dispatch = <A extends Action>(action: A) => any

export type Reducer<S = any, A = Action> = (state: S, action: A) => S

export type StoreEvent = { action: Action }

export class Store<S> extends EventTarget {
  constructor(public state: S, public reducer: Reducer<S>) {
    super()
    this.state = this.reducer(this.state, {})
  }

  dispatch(action: Action) {
    const evt = new CustomEvent<StoreEvent>('dispatch', {
      cancelable: true,
      detail: { action },
    })

    if (this.dispatchEvent(evt)) {
      action = evt.detail.action
      this.state = this.reducer(this.state, action)
      this.dispatchEvent(new CustomEvent<StoreEvent>('state', {
        detail: { action },
      }))
    }

    return action
  }
}
