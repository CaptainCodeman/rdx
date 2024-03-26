import { Dispatch, GetState, Store } from './store.js'

export type ThunkAction = <S>(dispatch: Dispatch, getState: GetState<S>) => void

export declare function thunk<T extends Store>(store: T): T
