# Rdx

Redux, but smaller ...

This is a simple immutable state store along the lines of Redux but significantly 
smaller. It helps to build apps with super-small JavaScript payloads. It provides 
all the basic features for creating a client-side app including:

Redux-like state store
Root reducer function (combineReducers)
Handling of async actions (Thunks)
Mixin to connect custom elements to the store (map state and events)

Total size: 1.49 Kb minified / 627 bytes gzipped

With additional enhancements:

Redux DevTools integration for debug and time-travel
State hydrations / persistence using localStorage

Total size: 2.17 Kb minified / 946 bytes gzipped

## Plans

To avoid the normal bloat of boiler-plate code that Redux can introduce
I'm also working on a way to define the state, reducers and effects all
in a single object similar to `redux-rematch` to make working with the
store easier and also allow your app code to be kept to a minimum.

This will also include a store-integrated router module based on a tiny
routing system.

Together, this will make it possible to have a fully functioning app
complete with routing, async data fetching, persistence and UI components
in less than 8 Kb of minified JS, around 3.5 Kb compressed.