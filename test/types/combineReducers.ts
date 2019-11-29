import { assert, IsExact } from "conditional-type-checks"
import { combineReducers } from '@captaincodeman/rdx'
import { Action } from "../../typings"

interface RootState {
  count: number
  name: string
}

const reducers = {
  count: (state: number, action: Action<number>) => state + action.payload!,
  name: (state: string, action: Action<string>) => state + action.payload!,
}

const reducer = combineReducers(reducers)

assert<IsExact<{(state: RootState, action: Action): RootState }, typeof reducer>>(true)

const state = reducer({ count: 0, name: '' }, {})

assert<IsExact<RootState, typeof state>>(true)