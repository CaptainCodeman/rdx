import { createModel } from "../../typings/model"
import { Store } from "./effects-types"

export const testModel = createModel({
  state: 0,
  reducers: {
    add(state: number, payload: number) {
      return state + payload
    },
  },
  effects: (store: Store) => ({
    async run(_payload: string) {
      // dispatch returns the typed, store dispatch
      store.dispatch().test.add(10)

      // getState returns the typed, store state
      const state = store.getState()

      // woot, typed!
      console.log(state.test)
    }
  }),
})

export const testConfig = {
  models: {
    test: testModel,
  },
}
