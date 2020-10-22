import { Result, Matcher } from "@captaincodeman/router"

import { Model } from "./model"
import { Plugin } from './modelStore'

type RoutingReducers<T> = {
  change: (state: any, payload: RoutingState<T>) => RoutingState<T>
}

type RoutingEffects = {
  back: () => void
  forward: () => void
  go: (payload: number) => void
  push: (href: string) => void
  replace: (href: string) => void
}

interface RoutingPlugin<T> extends Plugin {
  // if the plugin adds any state to the store, it can define it's own model
  // which will be merged together with the application-defined models ...
  model: Model<RoutingState<T>, RoutingReducers<T>, RoutingEffects>
}

export declare function routingPlugin<T>(router: Matcher<T>, options?: Partial<RoutingOptions<T>>): RoutingPlugin<T>

export interface RoutingState<T> extends NonNullable<Result<T>> {
  queries?: {
    [key: string]: string | string[]
  }
}

export interface RoutingDispatch<T> {
  change(payload: RoutingState<T>): void
  back(): void
  forward(): void
  go(payload: number): void
  push(href: string): void
  replace(href: string): void
}

export interface RoutingOptions<T> {
  transform: (result: Result<T>) => RoutingState<T>
}

export function withQuerystring<T>(result: Result<T>): RoutingState<T>

export const routingChange = 'routing/change'
