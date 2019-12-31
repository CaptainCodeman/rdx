// === store / combineReducers ===

export type DispatchEvent = 'action'
export type StateEvent = 'state'

export const dispatchEvent: DispatchEvent
export const stateEvent: StateEvent

export declare class Store<S = any> extends EventTarget {
  constructor(state: S, reducer: Reducer<S>);
  dispatch: Dispatch;
  reducer: Reducer<S>;
  state: S;
}

export type Action<P = any> = { type?: string, payload?: P }

export type ActionEvent = { action: Action }

export type GetState<S> = () => S

export type Dispatch = <A extends Action>(action: A) => any

export type Reducer<S = any, A = Action> = (state: S, action: A) => S

export type Reducers = { [key: string]: Reducer }

export type ReducerState<R extends Reducer> = R extends Reducer<infer S> ? S : never

export type State<R extends Reducers> = {
  [K in keyof R]: ReducerState<R[K]>
}

export declare function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>>

// === connect ===

export type DispatchMap = { [key: string]: (event: Event) => void }

export interface ConnectProps {
  mapState?(state: any): { [key: string]: any }
}

export interface ConnectEvents {
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

// === devtools ===

export declare function devtools<T extends Store>(store: T): T

// === persist ===

export interface PersistOptions<S> {
  // name sets the state key to use, useful in development to avoid conflict
  // with other apps. Default is to use the app location hostname
  name: string

  // provide a hook where the serialization could be provided, e.g. by using
  // something like https://github.com/KilledByAPixel/JSONCrush. Default is
  // the JSON serializer
  serializer: {
    parse(text: string): any
    stringify(value: any): string
  }

  // provide a hook where the storage can be replaced. Default is localStorage
  storage: {
    getItem(name: string): string | null
    setItem(name: string, value: string): void
  }

  // filter predicate allows control over whether to persist state based on 
  // the action. Default is to trigger persistence after all actions
  filter: (action: Action) => boolean

  // persist allows transforming the state to only persist part of it.
  // Default is to persist complete state
  persist: (state: S) => Partial<S>

  // delay introduces a delay before the save is performed. If another persist
  // is triggered before it expires, the previous persist is cancelled and a
  // new one scheduled. This can save doing too many persist operations by
  // debouncing the triggering. Default is 0ms
  delay: number

  // TODO: version for updates, expiry etc...
}

export declare function persist<S, T extends Store>(store: T, options?: Partial<PersistOptions<S>>): T

// === thunk ===

export type ThunkAction = <S>(dispatch: Dispatch, getState: GetState<S>) => void

export declare function thunk<T extends Store>(store: T): T
