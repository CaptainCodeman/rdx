import { Reducer, Reducers, State } from './store'

export declare function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>>