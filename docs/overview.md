# Overview

Rdx is like Redux, but smaller.

It is a fully featured state container that provides all the core functionality most apps require without adding a large payload to your bundle or requiring excessive boilerplate code &mdash; your apps runs faster and you write less code.

Here's what you get with **_less than 1.8Kb_** of JavaScript added to your app:

* A predictable, Redux-like, state container
* Integration with Redux DevTools for inspection and debugging
* Connect mixin to bind WebComponent properties to the store &amp; dispatch from events
* Simpler definition of reducers with auto-generated action creators and action types
* Strongly-typed State and Dispatch functions for use with TypeScript
* Routing middleware to add routing to store state, with parameter extraction
* Effect middleware for asynchronous code (respond to actions, handle fetch etc&hellip;)
* Persistence middleware to persist and rehydrate state (e.g. to `localStorage`)

[Why did we write Rdx](why)