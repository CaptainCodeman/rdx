import { Model } from "../typings/model"
import { Store } from "../typings/modelStore"

import { actionType } from "./actionType"

export const createDispatcher = (store: Store, name: string, key: string) => {
  const type = actionType(name, key)
  store.dispatch[name][key] = (payload?: any): any => {
    const action = { type, ...(payload !== undefined && { payload }) }
    return store.dispatch(action)
  }
  return type
}

export const dispatchPlugin = {
  onModel(store: Store, name: string, model: Model) {
    store.dispatch[name] = {}

    for (const key in model.reducers) {
      createDispatcher(store, name, key)
    }
  }
}