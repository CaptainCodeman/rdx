# Introducing Rdx, a Tiny State Store

## Like Redux, but smaller (and easier)

If you've worked on client-side web apps for any length of time then it's almost guaranteed that you are familiar with, or at least aware of, [Redux](https://redux.js.org/). Redux advertizes itself as "A Predictable State Container for JS Apps" and is of course wildly successful as it's 5m weekly npm downloads show.

But while it's easy to love what Redux _does_ it's not uncommon to find it a little annoying to work with. One frequent complaint is that it requires a _lot_ of boilerplate code and the configuration and setup is complex and confusing. The code for a Redux state store can end up fragmented and spread over multiple files but have to be in sync to work together and this can make it a challenge to use and learn, especially for beginners.

In fact, this is admitted to some degree in rather round-about fashion by it's author Dan Abramov. In 2016 he wrote an article ["You Might Not Need Redux"](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367) where he argues that yes, it _is_ fragmented and difficult, but that is "by design" and effectively the price you pay for what it does. If you don't like it, you're probably using it when you don't need to and you should stick to React.

Is that actually true though? Are we stuck with Redux as it is? Can we not have the benefits without the cost? It it too much to ask for a state store to be simple and easy to use and appropriate for smaller projects while also providing the type-safety that we would like for larger ones?

I think you _can_ have everything that Redux offers with an easier to use API and in far fewer bytes. Introducing Rdx - like Redux, but smaller.

<!-- more: Building a better Redux -->

## Redux History

In many ways Redux is a product of time and circumstance. It was inspired by [Facebook's Flux Architecture](https://facebook.github.io/flux/) and applied functional programming techniques which were the cool, in-vogue thing to be using at the time.

One of the issues with programming trends is that they sometimes have a habbit of being over applied. I think in hindsight, while the "reducer" concepts of Redux are fantastic, the use of [function currying](https://medium.com/javascript-scene/curry-and-function-composition-2c208d774983) for configuration just makes it way more complex to use than is really justified and leads to problems learning and understanding it. I've used Redux for many years and honestly I have to re-check the docs everytime I start a new project and need to setup the store configuration (or else copy it from the last project).

The complexity introduced by these design decisions also contributes to code size. While the core redux package itself is only 7.3Kb minified, a significant amount of that code is only there because it allows configuration functions with parameters in different places which then have to be checked and swapped round if necessary (why?) or to output error messages (including developer-level documentation) to tell you if (when) you got things wrong.

But should 7.3Kb really be considered "small"? Along with React, it benefitted by comparisons with other frameworks of the day, such as Angular.JS weighing in at ~150Kb but we should always judge a JS package size based on whether it's _really_ necessary to do its task. It's possible to write what Redux does in less than 1Kb and there are many Redux-like package such as [unistore](https://www.npmjs.com/package/unistore) that do just that. Perhaps it could have been fixed but because Redux's popularity exploded quickly it looks like the time for refining the API had been missed.

But it's not just the configuration that is difficult. The code that you write for your application state also ends up being overly complex and confusing because of how Redux is designed and implemented.

## Boilerplate

Let's look at what the issue is with Redux and why beginners find it confusing. It starts off simple, there are just three main pieces to a Redux state container:

**Store** The central store to hold the state of the application, the "single source of truth"
**Reducer** The reducer function that the store uses to mutate the state in a predictable manner
**Actions** The actions that you dispatch to the store which the reducer function handles

It does sound very simple, but in reality there are usually lots of other ancilliary pieces required to combine separate reducers and to create actions consistently. Yes, you can use Redux without these, but only for trivial demos and tutorials to give a rather misleading portrayal of how simple it can all be - if you're using it for any real app of substance you'll almost certainly be using these extra pieces.

Let's take this [TODO Example](https://redux.js.org/basics/example) from the Redux docs but instead of just copying the code as-is, I'm going to apply the best-practices that are also in the Redux docs, but unfortunately not applied in the examples. I'm also going to add Typescript, because it's increasingly common to use and useful to have strongly-typed code in a larger app:

### Todo state branch

Stored in a separate folder as per the "ducks" approach:

#### todos/models.ts

Defines the shape of our entities inside our store and when used as properties in UI components or requests for remote data (e.g. REST API)

```ts
export interface Todo {
  id: number
  name: string
  text: string
}
```

#### todos/actions.ts

The action types need to be defined and are used in the definition of action types, the action creators and the reducer(s) to avoid subtle errors that typos would introduce (e.g. `ADD_TODO` != `ADD-TODO`). The actions are strongly typed with the `type` acting as a discriminator which allows us to refer to the strongly-typed payload inside the reducer(s).

```ts
export const ADD_TODO = 'ADD_TODO'

export interface AddTodoAction {
  type: typeof ADD_TODO
  payload: {
    name: string
    text: string
  }
}

export type TodoActions = AddTodoAction // | OtherActions ...
```

#### todos/actionCreators.ts

We want to create actions consistently and ensure they are the correct type, so anytime we want to create one we use a factory function.

```ts
import { ADD_TODO, AddTodoAction } from './actions'

export const addTodo = (name: string, text: string): AddTodoAction => {
  return {
    type: ADD_TODO,
    payload: {
      name,
      text,
    }
  }
}
```

#### todos/reducer.ts

The reducer defines the shape of the `todos` branch of the state store and the reducer function to handle any dispatched actions that it needs to respond to. Note the catch-all default handler which _must_ return the unchanged state if it isn't being mutated, otherwise Redux will not function correctly. Some like to use helper libs such as [immer](https://immerjs.github.io/immer/) to make the immutable updates easier but the spread operators available in modern JS make them quite simple to implement natively.

```ts
import { TodoActions, ADD_TODO } from './actions'
import { Todo } from './models'

export interface TodosState {
  items: Todo[]
  last_id: number
}

const initialState: TodosState = {
  items: [],
  last_id: 0,
}

export function todos(state: TodoState = initialState, action: TodoActions) {
  switch (action.type) {
    case ADD_TODO:
      const last_id = state.last_id + 1
      const todo = {
        id: last_id,
        name: action.payload.name,
        text: action.payload.text,
      }
      
      return {
        ...state,
        last_id,
        items: [...state.items, todo],
      }

    default:
      return state
  }
}
```

### Root Reducer and Store

#### reducer.ts

The root reducer combines the separate reducers for each state branch into a single reducer function.

```ts
import { combineReducers } from 'redux'
import todos, { TodosState } from './todos/reducer'
import filter, { FilterState } from './filter/reducer' // other state branch

export interface RootState {
  todos: TodosState
  filter: FilterState
}

export default combineReducers({
  todos,
  filter,
})
```

#### store.ts

The state store uses the combined root reducer to create the store. It's typical to add extra middleware to handle async actions ("thunks"), persisting state for fast re-start (e.g. to `localStorage`) or to wire-up the Redux dev-tools for inspection and debugging purposes.

```ts
import { compose, createStore, applyMiddleware, Store } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducer, { RootState } from './reducer'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
  }
}

const composeEnhancers = (typeof window !== 'undefined' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

function configureStore(preloadedState: RootState): Store {
  return createStore(
    reducer,
    preloadedState,
    composeEnhancers(applyMiddleware(thunkMiddleware))
  )
}

export const store = configureStore(undefined)
```

## The Problem

This. Is. Too. Verbose.

The same names are repeated over and over and over and this is the code to handle _one_ single action in _one_ state branch. Not only that, but the code is often spread out over several files. Even with nice IDEs and refactoring tools, it's complex to work with. If you want to add another action, you are likely going to be touching multiple files.

I believe this is why beginners struggle with Redux. It creates too many moving parts that are in too many different places. It's not like normal coding where you're maybe working on a "class" that is self-contained and you just need to keep in your head what it is doing. In the article linked above, Dan Abramov claims these are needed:

> Redux offers a tradeoff. It asks you to:
> * Describe application state as plain objects and arrays.
> * Describe changes in the system as plain objects.
> * Describe the logic for handling changes as pure functions.

But it doesn't mean that we _need_ to use actions, action types, action creators etc... as prescribed by Redux. What if those could all be created for us?

## Reversing The Definition

Why should we need to define action names and action types and action creators and remember to return the default state if the action isn't handled. Why do I even care about actions, why can't I just write reducer functions?

We _know_ we need the reducer function, that is the core part of the _concept_ of a predictable state container, that starting with a given state and applying a pure function to it will produce a predicable (and testable) mutation of the state.

An action is effectively a serializable function call. It specifies the function to call (from the action `type`) and the parameters it needs (the action `payload`). If we have the reducer function, we shouldn't need to define action types, action interfaces or action creator functions.

So how about instead of the reducer above, we simply define the separate reducer function(s) we want and each function can define the payload it requires as it's parameter (in addition to the state). We might end up with something like this:

```ts
const reducers = {
  add(state: TodoState, payload: { name: string, text: string }) {
    const last_id = state.last_id + 1
    const todo = {
      id: last_id,
      name: action.payload.name,
      text: action.payload.text,
    }
    
    return {
      ...state,
      last_id,
      items: [...state.items, todo],
    }
  }
}
```

How could it work and what would we gain?

### Simpler Reducers

Each reducer function is independent. We don't need to remember to add a fall-through to return the default state and we don't need any discriminators inside a `select` to get the strong typing - each one is inherently a strongly typed function that is also easy to unit test.

### Action Names

We could use the state branch and function name to generate the unique action name automatically and consistently. So the `add` reducer function for the `todos` state would have the type `todos/add` (which incidentally, is now the recommended bast-practice for naming things in the Redux docs).

### Action Types

The only other thing we require in order to define an action, besides the action name, is the payload parameter of the reducer function. We don't need to define that again.

### Action Creators

If we know the action type and the payload type, we can automatically generate an action creator for it. It's effectively the same function signature as the reducer but without the `state` passed in. We take the `payload` parameter, combine it with the generated type string and have our creator, as though we had ourselves written:

```ts
export const TODOS_ADD = 'todos/add'

export const add = (payload: { name: string, text: string }) => {
  return {
    type: TODOS_ADD,
    payload,
  }
}
```

After all, what is an action _really_ besides a form of serialized function call? Start with the function call, the reducer, which is the most important part, and work backwards from that.

## The Solution

This is what Rdx does. It handles all the wiring for you. You only need to define the state and the reducer functions and _everything else is generated for you from those_. You get a fully type-safe store dispatch method that acts as the action creator so you can, for instance, just call:

```ts
dispatch.todos.add({ name: 'Buy Milk', text: '1 litre of semi-skimmed / 2%' })
```

This will still dispatch a familiar looking action to the store:

```json
{
  "type": "todos/add",
  "payload": {
    "name": "But Milk",
    "text": "1 litre of semi-skimmed / 2%",
  }
}
```

In fact, because it is _so_ similar, it can be wired up to use the Redux dev-tools so we keep all the great debugging and inspection tools.

Creating a store is significantly simpler:

```ts
import { createStore, devtools } from '@captaincodeman/rdx'
import todos from './todos'

export const store = devtools(createStore({ models: { todos } }))
```

## Prior Art

At this point, you may be thinking "I've seen things like this already" and if, like me, you've searched for solutions to the pain of Redux boilerplate you'll find pre-existing solutions such as:

* https://github.com/rematch/rematch/
* https://github.com/dvajs/dva
* https://github.com/mirrorjs/mirror
* https://github.com/HenrikJoreteg/redux-bundler

`rematch` was really the main inspiration for Rdx and it's worth reading their reasoning behind [Redesigning Redux](https://hackernoon.com/redesigning-redux-b2baee8b8a38) which really resonated with me.

So there's definitely lots of "prior art" but I see that as validation that this approach is worthwhile but people rarely took the final logical step of removing Redux itself which ultimately limits the benefits and leaves the convoluted configuration.

All the solutions I found suffered from one or more of these issues:

* They are built in top of Redux so add more to the bundle size of your app
* Don't play well with Typescript to provide fully typed state and dispatch
* Are deprecated and no longer actively developed / supported

The latter isn't always an issue if a library is small in scope and complete / stable plus if you're using open-source libs the _only_ contract you really have is that you have access to the source-code so ultimately you are responsible for any long-term support you might need.

But I really _want_ to have full typescript support and lately I've become a little obsessed with bundle-sizes.

## Bundle Size

There is lots of guidance about the danger of shipping too much JavaScript for your app.

TODO: Link to articles about bundle-size, talks by Alex Russell, Adi Osmani etc...
https://medium.com/@addyosmani/the-cost-of-javascript-in-2018-7d8950fbb5d4

Remember I said I thought 7.3Kb for Redux might be too much? If it was _just_ that and if it was all absolutely required for it's functionality it may not be so bad but we know it isn't all necessary and in a typical app you usually require additional pieces such as async effect handling (middleware) and routing. This is where we get into the sad state of JavaScript frameworks.

### Reasons for Bundle Bloat

What would the typical solution to having "too much" of something be? Have less of it maybe?

Not in the world of JavaScript! If you actually look at the bundle size of out-the-box apps from the latest frameworks, you find an incredible amount of bloat and a lot of it appears to be there as the solution to there being too much JS in the first place.

Wha...? Let me explain...

Someone writes a framework. It contains a lot of JS. Maybe not as much as some of the other frameworks, but it was envisaged before much of what it provided was built into the web platform and already available on every browser. So it's larger than it now needs to be, and not as fast as it could be as a result. More bytes means slow download and parsing + execution time.

Q. How do you address the performance issues and make it faster?

Option 1: Accept that it's become like jQuery and is no longer defacto essential for building web-apps. Rejoice that it helped to push the evolution of the web forward and enjoy the web-features it inspired, with smaller bundles and faster apps.

Option 2: Stick to the belief that it's the "one true way" and add _additional_ code to support it running on the server so it can generate a static view for fast initial loading and render (*cough* definitely not to cheat benchmarks *cough*) using "Server Side Rendering" (SSR) and then continue to use the same code, now with extra pieces added and therefore slower to load, on the client.

Of course, the answer was Option 2. If you follow the [Create React App](https://reactjs.org/docs/create-a-new-react-app.html) instructions and then [add a router](https://create-react-app.dev/docs/adding-a-router/) you are [adding nearly 30Kb to your bundle](https://bundlephobia.com/result?p=react-router-dom@5.2.0) and a significant part of that is code that already exists natively on the client but is required to allow the same code to run on the server.

Yes, you send _additional_ code to the client which it doesn't need because what it does is already built in just so the same code can also run on the server (where a client needs to be 'emulated') to allow the page to be pre-rendered ... because the _previous_ code being sent to the client was already too large and otherwise made it too slow.

This is _insane_ isn't it?! Thanks, JavaScript world!

But it gets worse. As you learn to make more use of Redux you discover that there is more value as you make state information available in the store. You can react to actions and state changes which could be fetching data. The trigger for doing this is often routing information - what view is the user looking at and what information needs to be fetched to provide it? Don't worry, the Redux ecosystem has you covered by [adding another 10Kb to your bundle](https://bundlephobia.com/result?p=connected-react-router@6.8.0) to make it possible.

That's just routing. You also typically need some middleware to handle side-effects in your store, transforming the asynchronous operations of fetching data into synchronous actions dispatched to the store. If you only need something simple, you might start with [redux-thunk](https://github.com/reduxjs/redux-thunk) which is tiny, but its limitations mean that most real-life apps will outgrow it very quickly and you'll typically be using something such as [redux-saga](https://redux-saga.js.org/) or [redux-observable](https://redux-observable.js.org/), both of which have additional 'learning curve' (where the curve is a mountain).

These can add another 15Kb to you bundle not to mention the additional code that you add to your app to use them. Hear that? It's the sound of your [lighthouse](https://developers.google.com/web/tools/lighthouse/) score dropping ...

It's not to say _what_ this all does, the end result, is bad or wrong. You get a working app and there are reasons for how things have developed to where they are. But every now and then it's worth questioning whether all those reasons are still valid today. I think all this JS is too much and you can get the same results with far less.

## Rdx, Tiny but Complete

One of the things I wanted with Rdx is something that provided all the basic features that you typically need in a state store for an app, in a tiny bundle size, with an API that also reduces the amount of app code you have to write.

Here's what you get with just 4Kb minified / 1.83Kb gzipped JavaScript (about half the size of Redux alone):

* Redux-like state container
* Integration with Redux DevTools
* Connect mixin to bind WebComponents to the store
* Reducer definitions to auto-generate action creators and types
* Fully stong-typed Typescript typing of State and Dispatch functions
* Routing middleware to add route state to store, with parameter extraction
* Async effect middleware with easy-to-use semantics
* Persistence middleware to rehydrate or persist state (e.g. to `localStorage`)

The best part though is how much easier it makes the development of your application. Your state store no longer needs so much boilerplate and isn't such a chore to work with.

Let me know what you think!
