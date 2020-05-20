import { Result, Matcher } from "@captaincodeman/router"

import { Model } from "./model"
import { Plugin, ModelsStore } from './modelStore'

type RoutingReducers = {
  change: (state: any, payload: RoutingState) => RoutingState
}

type RoutingEffects = {
  back: () => void
  forward: () => void
  go: (payload: number) => void
  push: (href: string) => void
  replace: (href: string) => void
}

interface RoutingPlugin extends Plugin {
  // if the plugin adds any state to the store, it can define it's own model
  // which will be merged together with the application-defined models ...
  model: Model<RoutingState, RoutingReducers, RoutingEffects>

  // TODO: thinking about it, why do we need 'onModel'? Can't we just handle
  // the store as a whole and the plugin can iterate the models if it wants?
  onStore?(store: ModelsStore): void
}

export declare function routingPluginFactory(router: Matcher, options?: Partial<RoutingOptions>): RoutingPlugin

export interface RoutingState extends NonNullable<Result> {
  queries?: {
    [key: string]: string | string[]
  }
}

export interface RoutingDispatch {
  change(payload: RoutingState): void
  back(): void
  forward(): void
  go(payload: number): void
  push(href: string): void
  replace(href: string): void
}

export interface RoutingOptions {
  transform: (result: Result) => RoutingState
}

export function withQuerystring(result: Result): RoutingState

export const routingChange = 'routing/change'
