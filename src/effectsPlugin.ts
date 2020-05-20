
import { Store } from "../typings/modelStore"
import { Model, EffectFn } from "../typings/model"
import { ActionEvent } from "../typings/store"

import { createDispatcher } from "./dispatchPlugin"
import { stateEvent } from "./const"

const effects: { [type: string]: EffectFn[] } = {}
const inits: Function[] = []

export const effectsPlugin = {
  onModel(store: Store, name: string, model: Model) {
    if (!model.effects) {
      return
    }

    const modelEffects = model.effects({
      dispatch: () => store.dispatch,
      getState: () => store.state
    })

    for (const key in modelEffects) {
      const type = createDispatcher(store, name, key)
      const effect = modelEffects[key]

      // effects are a list, because multiple models may want to listen to the same 
      // action type (e.g. routing/change) and we want to trigger _all_ of them ...
      if (effects[type]) {
        effects[type].push(effect)
      } else {
        effects[type] = [effect]
      }

      if (key === 'init') {
        inits.push(effect)
      }
    }
  },

  onStore(store: Store) {
    store.addEventListener(stateEvent, e => {
      const { action } = (<CustomEvent<ActionEvent>>e).detail
      const runEffects = effects[action.type!]
      if (runEffects) {
        // allow the triggering action to be reduced first
        // before we handle the effect(s) running
        queueMicrotask(() => runEffects.forEach(effect => effect(action.payload)))
      }
    })

    inits.forEach(effect => effect())
  },
}