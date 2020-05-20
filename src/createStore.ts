import { Plugins, Config, Store, ConfigModels } from '../typings/modelStore'
import { Reducer, Action } from '../typings/store'

import { actionType } from './actionType'
import { dispatchPlugin } from './dispatchPlugin'
import { effectsPlugin } from './effectsPlugin'
import { combineReducers } from './combineReducers'
import { Store as BaseStore } from './store'

const corePlugins: Plugins = { dispatchPlugin, effectsPlugin }

export const createStore = <C extends Config>(config: C): Store<ConfigModels<C>> => {
  const models = { ...config.models }

  // add models from plugins
  const plugins: Plugins = { ...corePlugins, ...config.plugins }
  for (const name in plugins) {
    const plugin = plugins[name]
    if (plugin.model) {
      models[name] = plugin.model
    }
  }

  // create reducers
  const reducers: { [name: string]: Reducer } = {}
  for (const name in models) {
    const model = models[name]
    const modelReducers: { [name: string]: any } = {}

    for (const k in model.reducers) {
      modelReducers[actionType(name, k)] = model.reducers[k]
    }

    reducers[name] = (state: any = model.state, action: Action) => {
      const reducer = modelReducers[action.type!]
      return reducer ? reducer(state, action.payload) : state
    }
  }

  // create store
  const rootReducer = combineReducers(reducers)
  const initialState = config && config.state
  const store = <Store<ConfigModels<C>>>new BaseStore(initialState, rootReducer)

  // give each plugin chance to handle the models
  for (const name in plugins) {
    const plugin = plugins[name]
    if (plugin.onModel) {
      for (const name in models) {
        plugin.onModel(<Store>store, name, models[name])
      }
    }
  }

  // initialize plugins
  for (const name in plugins) {
    const plugin = plugins[name]
    if (plugin.onStore) {
      plugin.onStore(<Store>store)
    }
  }

  return <Store<ConfigModels<C>>>store
}
