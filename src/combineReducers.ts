import { State, Action, Reducer, Reducers } from "../typings/store"

export function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>> {
  return (state: State<R> = {} as State<R>, action: Action) => {
    const next = {} as State<R>
    for (const key in reducers) {
      next[key] = reducers[key](state[key], action)
    }
    return next
  }
}