export declare class Store<S = any> extends EventTarget {
  constructor(state: S, reducer: Reducer<S>);
  dispatch(action: Action): Action<any>;
  reducer: Reducer<S>;
  state: S;
}

export type StoreEvent = { action: Action }

export type Action<P = any> = { type?: string, payload?: P }

export type Dispatch = <A extends Action>(action: A) => any

export type Reducer<S = any, A = Action> = (state: S, action: A) => S

export type Reducers = { [key: string]: Reducer }

export type ReducerState<R extends Reducer> = R extends Reducer<infer S> ? S : never

export type State<R extends Reducers> = {
  [K in keyof R]: ReducerState<R[K]>
}

export declare function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>>