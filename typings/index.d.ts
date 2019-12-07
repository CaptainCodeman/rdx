// === store / combineReducers ===

export declare class Store<S = any> extends EventTarget {
  constructor(state: S, reducer: Reducer<S>);
  dispatch(action: Action): Action<any>;
  reducer: Reducer<S>;
  state: S;
}

export type Action<P = any> = { type?: string, payload?: P }

export type ActionEvent = { action: Action }

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
  mapEvents?(): { [key: string]: (event: Event) => Action }
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

export declare function devtools<S>(store: Store<S>): Store<S>

// === persist ===

export interface PersistOptions<S> {
  // name sets the state key to use, useful in development to avoid conflict
  // with other apps. Default is to use the app location hostname
  name: string

  // filter predicate allows control over whether to persist state based on 
  // the action. Default is to trigger persistence after all actions
  filter: (action: Action) => boolean

  // persist allows transforming the state to only persist part of it.
  // Default is to persist complete state
  persist: (state: S) => Partial<S>

  // delay introduces a delay before the save is performed. If another persist
  // is triggered before it expires, the previous persist is cancelled and a
  // new one scheduled. This can save doing too many persist operations by
  // debouncing the triggering. Default is 0 delay
  delay: number

  // TODO: version for updates, expiry etc...
}

export declare function persist<S>(store: Store<S>, options?: Partial<PersistOptions<S>>): Store<S>

// === thunk ===

export type ThunkAction = <S>(dispatch: Dispatch, state: S) => void

export declare function thunk<S>(store: Store<S>): Store<S>
