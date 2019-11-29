export declare type Action<P = any> = {
    type?: string;
    payload?: P;
};
export declare type Dispatch = <A extends Action>(action: A) => any;
export declare type Reducer<S = any, A = Action> = (state: S, action: A) => S;
export declare type StoreEvent = {
    action: Action;
};
export declare class Store<S> extends EventTarget {
    state: S;
    reducer: Reducer<S>;
    constructor(state: S, reducer: Reducer<S>);
    dispatch(action: Action): Action<any>;
}
