import { Store, Dispatch } from "./store";
export declare type ThunkAction = <S>(dispatch: Dispatch, getState: () => S) => void;
export declare function thunk(store: Store<any>): Store<any>;
