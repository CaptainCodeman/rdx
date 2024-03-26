import { Store } from './store.js'

export interface DispatchMap { [key: string]: <T extends CustomEvent>(event: T) => void }

interface ConnectProps {
  mapState?(state: any): { [key: string]: any }
}

interface ConnectEvents {
  mapEvents?(): DispatchMap
}

export interface Connectable extends HTMLElement, ConnectProps, ConnectEvents {
  connectedCallback?(): void
  disconnectedCallback?(): void
}

export type Constructor<T> = new (...args: any[]) => T

export declare function connect<T extends Constructor<Connectable>, S>(
  store: Store<S>,
  superclass: T
): Constructor<Connectable> & T
