import { Reducer } from './store';
export declare type Reducers = {
    [key: string]: Reducer;
};
export declare type ReducerState<R extends Reducer> = R extends Reducer<infer S> ? S : never;
export declare type State<R extends Reducers> = {
    [K in keyof R]: ReducerState<R[K]>;
};
export declare function combineReducers<R extends Reducers>(reducers: R): Reducer<State<R>>;
