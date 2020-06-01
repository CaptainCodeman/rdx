# combineReducers

`function combineReducers(reducers: Reducers): Reducer<State>`

The `combineReducers` function is a helper that produces a single root-reducer function from multiple reducer functions. It's typically used to combine the reducers for multiple state branches into the single reducer that is needed for a store. Any action dispatched to the root reducer is automatically dispatched to all of the child reducers, with the results combined back into the root state. This happens in a single, synchronous call.

If using the [createModel](api-createModel) and [createStore](api-createStore) functions to setup your models and store you won't need to use this directly.