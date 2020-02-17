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

export interface Action<P = any> { type?: string, payload?: P }

export interface ActionEvent { action: Action }

export type GetState<S = any> = () => S

export type Dispatch = <A extends Action>(action: A) => any

export type Reducer<S = any, A = Action> = (state: S, action: A) => S

export type Reducers = { [key: string]: Reducer }

export type ReducerState<R extends Reducer> = R extends Reducer<infer S> ? S : never

export type State<R extends Reducers> = {
  [K in keyof R]: ReducerState<R[K]>
}
