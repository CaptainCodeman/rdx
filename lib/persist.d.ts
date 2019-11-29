import { Store, Action } from "./store";
export interface Options<S> {
    name: string;
    filter: (action: Action) => boolean;
    persist: (state: S) => Partial<S>;
    delay: number;
}
export declare function persist<S>(store: Store<S>, options: Partial<Options<S>>): Store<S>;
