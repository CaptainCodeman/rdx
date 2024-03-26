import { Reducer, Reducers, State } from './store.js'

export declare function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>>
