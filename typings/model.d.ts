import { GetState } from "./store.js"

export type ReducerFn<S, P = any> = (state: S, payload: P) => S

interface ReducerFns<S> {
  [key: string]: ReducerFn<S>
}

export type EffectFn<P = any> = (payload?: P) => void

interface EffectFns {
  [key: string]: EffectFn
}

export interface ModelStore<D = any, S = any> {
  // getDispatch has to be a function that returns the Dispatch for the store
  // otherwise it creates a circular reference when added to the models' effects
  getDispatch: () => D
  getState: GetState<S>
}

// TODO: constraint to limit reducers + effects with the same name, to the same payload
export interface Model<S = any, R extends ReducerFns<S> = any, E extends EffectFns = any> {
  state: S
  reducers: R
  effects?: (store: ModelStore) => E
  [key: string]: any
}

type ActionFromModelReducerFn<S, R extends ReducerFn<S>> =
  R extends (state: S) => S ? () => void :
  R extends (state: S, payload: infer P) => S ? (payload: P) => void : never

type ActionsFromModelReducerFns<S, R extends ReducerFns<S>> = {
  [K in keyof R]: ActionFromModelReducerFn<S, R[K]>
}

type ActionFromModelEffectFn<R extends EffectFn> =
  R extends () => void ? () => void :
  R extends (payload: infer P) => void ? (payload: P) => void : never

type ActionsFromModelEffectFns<R extends EffectFns> = {
  [K in keyof R]: ActionFromModelEffectFn<R[K]>
}

type ModelDispatch<S, R extends ReducerFns<S>, E extends EffectFns> = ActionsFromModelReducerFns<S, R> & ActionsFromModelEffectFns<E>

export declare function createModel<S, R extends ReducerFns<S>, E extends EffectFns>(model: Model<S, R, E>): Model<S, R, E>
