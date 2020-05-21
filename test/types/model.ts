import { assert, IsExact } from "conditional-type-checks"

import { ActionFromModelReducerFn, ActionsFromModelReducerFns, ActionFromModelEffectFn, ActionsFromModelEffectFns, ModelDispatch } from "../../typings/model"

enum Things {
  One,
  Two,
}

// just some state with different property types
interface TestState {
  value: number
}

// different patterns of reducer method arguments
// doesn't matter that reducer doesn't user payload - we're just testing the type transforms
const testReducers = {
  object(state: TestState, _payload: { count: number }) {
    return state
  },
  number(state: TestState, _payload: number) {
    return state
  },
  void(state: TestState) {
    return state
  },
  boolean(state: TestState, _payload: boolean) {
    return state
  },
  string(state: TestState, _payload: string) {
    return state
  },
  enum(state: TestState, _payload: Things) {
    return state
  }
}

// expected dispatcher for the reducers above
interface testDispatcherType {
  object: (payload: { count: number }) => void
  number: (payload: number) => void
  void: () => void
  boolean: (payload: boolean) => void
  string: (payload: string) => void
  enum: (payload: Things) => void
}

// test individual patterns
type objectActionType = ActionFromModelReducerFn<TestState, typeof testReducers.object>
assert<IsExact<(payload: { count: number }) => void, objectActionType>>(true)

type numberActionType = ActionFromModelReducerFn<TestState, typeof testReducers.number>
assert<IsExact<(payload: number) => void, numberActionType>>(true)

type voidActionType = ActionFromModelReducerFn<TestState, typeof testReducers.void>
assert<IsExact<() => void, voidActionType>>(true)

type booleanActionType = ActionFromModelReducerFn<TestState, typeof testReducers.boolean>
assert<IsExact<(payload: boolean) => void, booleanActionType>>(true)

type stringActionType = ActionFromModelReducerFn<TestState, typeof testReducers.string>
assert<IsExact<(payload: string) => void, stringActionType>>(true)

type enumActionType = ActionFromModelReducerFn<TestState, typeof testReducers.enum>
assert<IsExact<(payload: Things) => void, enumActionType>>(true)

// test entire dispatch interface
type actionsDispatcherType = ActionsFromModelReducerFns<TestState, typeof testReducers>
assert<IsExact<actionsDispatcherType, testDispatcherType>>(true)

// different patterns of effect method arguments
const testEffects = {
  object(_payload: { count: number }) { },
  number(_payload: number) { },
  void() { },
  boolean(_payload: boolean) { },
  string(_payload: string) { },
  enum(_payload: Things) { },
}

type objectEffectType = ActionFromModelEffectFn<typeof testEffects.object>
assert<IsExact<(payload: { count: number }) => void, objectEffectType>>(true)

type numberEffectType = ActionFromModelEffectFn<typeof testEffects.number>
assert<IsExact<(payload: number) => void, numberEffectType>>(true)

type voidEffectType = ActionFromModelEffectFn<typeof testEffects.void>
assert<IsExact<() => void, voidEffectType>>(true)

type booleanEffectType = ActionFromModelEffectFn<typeof testEffects.boolean>
assert<IsExact<(payload: boolean) => void, booleanEffectType>>(true)

type stringEffectType = ActionFromModelEffectFn<typeof testEffects.string>
assert<IsExact<(payload: string) => void, stringEffectType>>(true)

type enumEffectType = ActionFromModelEffectFn<typeof testEffects.enum>
assert<IsExact<(payload: Things) => void, enumEffectType>>(true)

// test entire dispatch interface
type effectsDispatcherType = ActionsFromModelEffectFns<typeof testEffects>
assert<IsExact<effectsDispatcherType, testDispatcherType>>(true)

// test combined (same reducers and effects)
type dispatcherType = ModelDispatch<TestState, typeof testReducers, typeof testEffects>
assert<IsExact<dispatcherType, testDispatcherType>>(true)

const testCombineReducers = {
  add(state: number, payload: number) {
    return state + payload
  }
}

const testCombineEffects = {
  async load(_payload: string) { }
}

// expected dispatcher for the reducers above
interface testCombinedDispatcherType {
  add: (payload: number) => void
  load: (payload: string) => void
}

// test combined (different reducers and effects)
type combinedDispatcherType = ModelDispatch<number, typeof testCombineReducers, typeof testCombineEffects>
assert<IsExact<combinedDispatcherType, testCombinedDispatcherType>>(true)
