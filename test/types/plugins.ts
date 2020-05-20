import { assert, IsExact } from "conditional-type-checks"

import { ExtractModelsFromPlugins, KeysOfPluginsWithModels, PluginsModels, ExtractConfigPlugins, ExtractConfigModels, ConfigModels } from '../../typings'
import { createModel } from "createModel"

const oneModel = createModel({
  state: 0,
  reducers: {
    add(state: number, payload: number) {
      return state + payload
    },
  }
})

const twoModel = createModel({
  state: 'abc',
  reducers: {
    append(state: string, payload: string) {
      return state + payload
    },
  }
})

const testConfig = {
  models: {
    one: oneModel,
  },
  plugins: {
    two: { model: twoModel },
    three: { },
  },
}

type testExtractModelsFromPlugins = ExtractModelsFromPlugins<typeof testConfig.plugins>
assert<IsExact<{
  two: typeof twoModel,
  three: unknown,
}, testExtractModelsFromPlugins>>(true)

type testKeysOfPluginsWithModels = KeysOfPluginsWithModels<typeof testConfig.plugins>
assert<IsExact<'two', testKeysOfPluginsWithModels>>(true)

type testPluginsModels = PluginsModels<typeof testConfig.plugins>
assert<IsExact<{
  two: typeof twoModel,
}, testPluginsModels>>(true)

type testExtractedPluginsModels = PluginsModels<ExtractConfigPlugins<typeof testConfig>>
assert<IsExact<{
  two: typeof twoModel,
}, testExtractedPluginsModels>>(true)

type testExtractConfigModels = ExtractConfigModels<typeof testConfig>
assert<IsExact<{
  one: typeof oneModel,
}, testExtractConfigModels>>(true)

type testConfigModels = ConfigModels<typeof testConfig>
assert<IsExact<{
  one: typeof oneModel,
  two: typeof twoModel,
}, testConfigModels>>(true)
