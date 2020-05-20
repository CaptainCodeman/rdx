import { StoreState, StoreDispatch } from '../../typings/modelStore'
import { ModelStore } from '../../typings/model'

import { testConfig } from './effects-config'

export interface State extends StoreState<typeof testConfig> { }
export interface Dispatch extends StoreDispatch<typeof testConfig> { }
export interface Store extends ModelStore<Dispatch, State> { }
