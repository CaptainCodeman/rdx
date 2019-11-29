import { Action, Reducer, Reducers, State } from '../typings'

export function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>> {
  return (state: State<R> = {} as State<R>, action: Action) => {
    for (const key in reducers) {
      state[key] = reducers[key](state[key], action)
    }
    return state
  }
}