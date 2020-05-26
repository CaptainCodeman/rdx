# combineReducers

`function combineReducers(reducers: Reducers): Reducer<State>`

The `combineReducers` function is a helper that produces a single root-reducer function from multiple reducer functions. It's typically used to combine the reducers for multiple state branches into the single reducer that is needed for a store. Any action dispatched to the root reducer is automatically dispatched to all the child reducers, with the results combined back into the root state.

TODO: Example to show combining reducers