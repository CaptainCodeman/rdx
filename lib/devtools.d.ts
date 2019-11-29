import { Store } from "./store";
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__: any;
    }
}
export declare function devtools(store: Store<any>): Store<any>;
