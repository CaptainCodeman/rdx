import { Store, Reducer } from "./store";
export declare function compat<S>(store: Store<S>): {
    subscribe(listener: any): () => Function[];
    getState(): S;
    replaceReducer(reducer: Reducer<S, import("./store").Action<any>>): void;
    state: S;
    reducer: Reducer<S, import("./store").Action<any>>;
    addEventListener(type: string, listener: EventListener | EventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined): void;
    dispatchEvent(event: Event): boolean;
    removeEventListener(type: string, callback: EventListener | EventListenerObject | null, options?: boolean | EventListenerOptions | undefined): void;
};
