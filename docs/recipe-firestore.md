# Firestore Subscriptions

If you haven't used it, [Firestore](https://firebase.google.com/products/firestore) is a NoSQL database that is accessible over the web, integrates with [Firebase Auth](https://firebase.google.com/products/auth) for security, and also provides offline support as well as live-updating capabilities. As data in the database changes, any connected clients can update their views to reflect that new data, making collaborative applications easier than ever.

To take advantage of this apps need to setup a _subscription_ or _listener_ that can be notified when data changes. This is different to a traditional REST API, where you may make a single request for data when the user loads a view that uses it, and you only update that view if they specifically request it be refreshed (or you do it the next time that view loads).

A Firestore app can be simpler to develop than one using REST, provide more robustness (you get automatic retries if fetching data fails or the client has an intermittent network connection), but requires a different approach.

The main difference is that instead of one-off data fetches we're going to have long-lived subscriptions. While the syntax for initiating these listeners is fairly straightforward, it's often less obvious how to manage them efficiently. We may want these subscriptions to live over several views of our app, other times a subscription is specific to a single view, but the challenge is not how to create them, it's more how and where to remove them.

As we discussed in the [Advanced / Routing / Models Integration](advanced?id=models-integration) section, coupling your data-fetching to UI components can be a mistake and considered an anti-pattern, but becomes especially problematic when you have to manage subscriptions that have to live across several components. While you could setup and tear-down the subscriptions with each view, this can result in increased reads (and therefore costs to your app).

As always, Rdx is here to help you. Let's see how we can utilize a Firestore subscription within our model:

```ts
import { createModel, RoutingState } from '@captaincodeman/rdx'
import { Store, State } from '../store'
import { Todo } from '../schema'
import { firestore } from '../firebase'

export interface TodosState {
  entities: { [key: string]: Todo }
  selected: string
}

export default createModel({
  state: <TodosState>{
    entities: { },
    selected: '',
  },

  reducers: {
    // sets the selected property for the UI to display
    'routing/change'(state, payload: RoutingState) {
      switch (payload.page) {
        case 'todos-detail-view':
          return { ...state, selected: payload.params.id }
        default:
          return state
      }
    },

    // received adds any received todo items into the entity map
    // replacing any that are already there
    received(state, todos: Todo[]) {
      return {
        ...state,
        entities: todos.reduce((map, todo) => {
          map[todo.id] = todo
          return map
        }, state.entities),
      }
    },
  },

  effects(store: Store) {
    // capture the store dispatch method
    const dispatch = store.getDispatch()

    // listListener will be used to keep track of the listener
    // for the list of todo items. Because we want to unsubscribe 
    // from multiple places we use a function that can check for,
    // call and nullify any active listener
    let listListener: Function

    function unsubscribeFromList() {
      if (listListener) {
        listListener()
        listListener = null
      }
    }

    // setup the subscription to the list of todo items for the user
    function subscribeToList() {
      // query the todos collection
      const query = firestore.collection('todos')

      // the onSnapshot listener will be called anytime the data is
      // updated (including the initial query results)
      listListener = query.onSnapshot(snapshot => {
        // transform the firestore data into a Todo array, with the ID
        const todos = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))

        // update the store so it contains updated todos
        dispatch.todos.received(todos)
      })
    }

    // a subscription for an individual item works in the same way
    let itemListener: Function

    function unsubscribeFromItem() {
      if (itemListener) {
        itemListener()
        itemListener = null
      }
    }

    // setup the subscription to a single todo item
    function subscribeToItem(id: string) {
      const doc = firestore.doc(`todos/${id}`)

      // the onSnapshot listener watches a single item
      itemListener = doc.onSnapshot(doc => {
        // we create an array containing the single item
        // so we can re-use the same reducer as for the list
        const todos = [{ ...doc.data(), id: doc.id }]

        // update the store so it contains the updated todo
        dispatch.todos.received(todos)
      })
    }

    return {
      // we change subscriptions when the route changes
      async 'routing/change'(payload: RoutingState) {
        switch (payload.page) {
          case 'todos-view':
            // when navigating to the todos list page we
            // unsubscribe from any individual listeners
            // and subscribe to the complete list
            unsubscribeFromItem()
            subscribeToList()
            break
          case 'todos-detail-view':
            // if we're already subscribed to the complete
            // list then we don't need to subscribe to the
            // individual item as updates will already be
            // included in the list. If a user is likely to
            // navigate between list and item views this can
            // be more efficient and cost effective
            if (!unsubscribeFromList) {
              // if we're not already subscribed to the list
              // we unsubscribe from any individual item and
              // setup a subscription to the new selected one
              unsubscribeFromItem()
              subscribeToItem(payload.params.id)
            }
            break
          default:
            // assuming any other route isn't interested in
            // the todo list or individual items, we can turn
            // off the subscriptions here
            // NOTE: the data is still in the state store, it
            // just won't be kept updated ... but will allow
            // an initial 'cached' view to be shown before it
            // is refreshed from the server whenever the user
            // navigates back to one of the todo views
            unsubscribeFromList()
            unsubscribeFromItem()
            break
        }
      },
    }
  },
})
```

It can be easier to create a separate class that you update by passing it the store state so it can manage which subscriptions need to be kept active. That way, all the firestore code is in one place, as a Data Access Layer.

The models then subscribe to this subscription manager to be notified of data changes that need to be reflected in the store.

There are other nuances to Firestore, some are not obvious. While it appears that a subscription to a list returns the _entire_ item list each time, not all that data is coming from the server - the Firestore SDK provides it's own internal cache (also used for offline use) and just provides you with the aggregated view of unchanged plus updated data in a way that makes it easier to use the same code for both the initial view and subsequent updates. You _can_ create more granular snapshot listeners that specifically check for different actions (data being added, updated or deleted) and these _may_ be something your reducers can handle in a more efficient way.