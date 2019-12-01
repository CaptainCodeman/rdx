import { Action, Reducer, Reducers, State } from '../typings'

export function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>> {
  // NOTE: we don't re-create the root state object each time, that stays as it is
  // this allows us to just pass the reference instead of needing the getState() fn
  return (state: State<R> = {} as State<R>, action: Action) => {
    for (const key in reducers) {
      state[key] = reducers[key](state[key], action)
    }
    return state
  }
}