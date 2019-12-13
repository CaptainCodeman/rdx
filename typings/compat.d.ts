import { Store } from "./index";
import { Middleware } from "redux";

export function applyMiddleware<S, M1>(store: Store<S>,
  middleware1: Middleware<M1, S, any>[],
): Store<S>
export function applyMiddleware<S, M1, M2>(store: Store<S>,
  middleware1: Middleware<M1, S, any>[],
  middleware2: Middleware<M2, S, any>[],
): Store<S>
export function applyMiddleware<S, M1, M2, M3>(store: Store<S>,
  middleware1: Middleware<M1, S, any>[],
  middleware2: Middleware<M2, S, any>[],
  middleware3: Middleware<M3, S, any>[],
): Store<S>
export function applyMiddleware<S, M1, M2, M3, M4>(store: Store<S>,
  middleware1: Middleware<M1, S, any>[],
  middleware2: Middleware<M2, S, any>[],
  middleware3: Middleware<M3, S, any>[],
  middleware4: Middleware<M4, S, any>[],
): Store<S>
export function applyMiddleware<S, M1, M2, M3, M4, M5>(store: Store<S>,
  middleware1: Middleware<M1, S, any>[],
  middleware2: Middleware<M2, S, any>[],
  middleware3: Middleware<M3, S, any>[],
  middleware4: Middleware<M4, S, any>[],
  middleware5: Middleware<M5, S, any>[],
): Store<S>
export function applyMiddleware<S>(store: Store<S>, ...middlewares: Middleware<any, S, any>[]): Store<S>