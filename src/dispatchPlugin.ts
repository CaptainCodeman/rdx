import { actionType } from "./actionType"

import { Model, ModelsStore } from "../typings"

export const createDispatcher = (store: ModelsStore, name: string, key: string) => {
  const type = actionType(name, key)
  store.dispatch[name][key] = (payload?: any): any => {
    const action = { type, ...(payload !== undefined && { payload }) }
    return store.dispatch(action)
  }
  return type
}

export const dispatchPlugin = {
  onModel(store: ModelsStore, name: string, model: Model) {
    store.dispatch[name] = {}

    for (const key in model.reducers) {
      createDispatcher(store, name, key)
    }
  }
}