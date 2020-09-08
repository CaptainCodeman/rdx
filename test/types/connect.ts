import { assert, IsExact } from "conditional-type-checks"

import { DispatchMap } from '../../typings/connect'

const map: DispatchMap = {
  'click': (_e: Event) => {},
  'my-event': (_e: CustomEvent<string>) => {},
}

assert<IsExact<DispatchMap, typeof map>>(true)