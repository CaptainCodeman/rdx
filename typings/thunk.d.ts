import { Dispatch, GetState, Store } from './store'

export type ThunkAction = <S>(dispatch: Dispatch, getState: GetState<S>) => void

export declare function thunk<T extends Store>(store: T): T