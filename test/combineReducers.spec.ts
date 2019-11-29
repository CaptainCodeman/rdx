import { combineReducers, State, Action, Reducer } from '@captaincodeman/rdx'

const reducers = {
  count: (state: number, action: Action) => { return state + action.payload },
  name: (state: string, action: Action) => { return state + action.payload },
}

const reducer: Reducer<State<typeof reducers>> = combineReducers(reducers)

const _state = reducer({ count: 0, name: '' }, {})
