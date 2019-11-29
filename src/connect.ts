import { Action, Store } from './store'

export type DispatchMap = { [key: string]: (event: Event) => void }

export interface ConnectProps {
  mapState?(state: any): { [key: string]: any }
}

export interface ConnectEvents {
  mapEvents?(): { [key: string]: (event: Event) => Action }
}

export interface Connectable extends HTMLElement, ConnectProps, ConnectEvents {
  connectedCallback?(): void
  disconnectedCallback?(): void
}

export type Constructor<T> = new (...args: any[]) => T

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
      // this minifies better
      let callback = super.connectedCallback
      callback && callback()
      
      // super.connectedCallback && super.connectedCallback()

      this[addEventListeners]()
      this[addStateSubscription]()
    }

    disconnectedCallback() {
      this[removeStateSubscription]()
      this[removeEventListeners]()

      // this minifies better
      let callback = super.disconnectedCallback
      callback && callback()

      // super.disconnectedCallback && super.disconnectedCallback()
    }

    private [createDispatchMap]() {
      this[dispatchMap] = <DispatchMap>{}
      if (this.mapEvents) {
        const eventMap = this.mapEvents()
        for (const key in eventMap) {
          const fn = eventMap[key]
          this[dispatchMap][key] = function (event: Event) {
            event.stopImmediatePropagation()
            store.dispatch(fn(event))
          }.bind(this)
        }
      }
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
      store.addEventListener('state', this[onStateChange])
      this[onStateChange]()
    }

    private [removeStateSubscription]() {
      this.removeEventListener('state', this[onStateChange])
    }

    private [onStateChange]() {
      this.mapState && Object.assign(this, this.mapState(store.state))
    }
  }

  return connected as Constructor<Connectable> & T
}