import { assert, IsExact } from "conditional-type-checks"

import { ExtractConfigModels, ConfigModels } from '../../typings/modelStore'

import { testConfig, testModel } from './effects-config'

type testExtractConfigModels = ExtractConfigModels<typeof testConfig>
assert<IsExact<{
  test: typeof testModel,
}, testExtractConfigModels>>(true)

type testConfigModels = ConfigModels<typeof testConfig>
assert<IsExact<{
  test: typeof testModel,
}, testConfigModels>>(true)
