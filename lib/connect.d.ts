import { Action, Store } from './store';
export declare type DispatchMap = {
    [key: string]: (event: Event) => void;
};
export interface ConnectProps {
    mapState?(state: any): {
        [key: string]: any;
    };
}
export interface ConnectEvents {
    mapEvents?(): {
        [key: string]: (event: Event) => Action;
    };
}
export interface Connectable extends HTMLElement, ConnectProps, ConnectEvents {
    connectedCallback?(): void;
    disconnectedCallback?(): void;
}
export declare type Constructor<T> = new (...args: any[]) => T;
export declare function connect<T extends Constructor<Connectable>, S>(store: Store<S>, superclass: T): Constructor<Connectable> & T;
