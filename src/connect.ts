import { Store, Constructor, Connectable, DispatchMap } from '../typings'
import { stateEvent } from './const'

const dispatchMap: unique symbol = Symbol()
const createDispatchMap: unique symbol = Symbol()
const addEventListeners: unique symbol = Symbol()
const removeEventListeners: unique symbol = Symbol()
const addStateSubscription: unique symbol = Symbol()
const removeStateSubscription: unique symbol = Symbol()
const onStateChange: unique symbol = Symbol()

export function connect<T extends Constructor<Connectable>, S>(
  store: Store<S>,
  superclass: T
) {
  class connected extends superclass {
    private [dispatchMap]: DispatchMap

    constructor(...args: any[]) {
      super(...args)
      this[onStateChange] = this[onStateChange].bind(this)
      this[createDispatchMap]()
    }

    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback()
      }

      this[addEventListeners]()
      this[addStateSubscription]()
    }

    disconnectedCallback() {
      this[removeStateSubscription]()
      this[removeEventListeners]()

      if (super.disconnectedCallback) {
        super.disconnectedCallback()
      }
    }

    private [createDispatchMap]() {
      this[dispatchMap] = this.mapEvents
        ? this.mapEvents()
        : {}
    }

    private [addEventListeners]() {
      for (const key in this[dispatchMap]) {
        this.addEventListener(key, this[dispatchMap][key], false)
      }
    }

    private [removeEventListeners]() {
      for (const key in this[dispatchMap]) {
        this.removeEventListener(key, this[dispatchMap][key], false)
      }
    }

    private [addStateSubscription]() {
      store.addEventListener(stateEvent, this[onStateChange])
      this[onStateChange]()
    }

    private [removeStateSubscription]() {
      this.removeEventListener(stateEvent, this[onStateChange])
    }

    private [onStateChange]() {
      this.mapState && Object.assign(this, this.mapState(store.state))
    }
  }

  return connected as Constructor<Connectable> & T
}