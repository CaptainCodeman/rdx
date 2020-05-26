import { assert, IsExact } from "conditional-type-checks"
import { combineReducers } from 'combineReducers'
import { Action } from "../../typings/store"

interface State {
  count: number
  name: string
}

const reducers = {
  count: (state: number, action: Action<number>) => state + action.payload!,
  name: (state: string, action: Action<string>) => state + action.payload!,
}

const reducer = combineReducers(reducers)

assert<IsExact<{ (state: State, action: Action): State }, typeof reducer>>(true)

const state = reducer({ count: 0, name: '' }, {})

assert<IsExact<State, typeof state>>(true)