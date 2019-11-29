import { Action, Reducer } from './store'

export type Reducers = { [key: string]: Reducer }

export type ReducerState<R extends Reducer> = R extends Reducer<infer S> ? S : never

export type State<R extends Reducers> = {
  [K in keyof R]: ReducerState<R[K]>
}

export function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>> {
  return (state: State<R> = {} as State<R>, action: Action) => {
    for (const key in reducers) {
      state[key] = reducers[key](state[key], action)
    }
    return state
  }
}