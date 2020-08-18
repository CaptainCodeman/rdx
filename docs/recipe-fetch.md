# REST Data Fetching

The canonical example for a state store (beyond a simple "counter") is to show how asynchronous operations are converted into synchronous actions. This is what makes things "predictable" - you have a single place where you have to deal with awaiting data and don't have to deal with it in your views or templating system.

Let's reproduce the [Advanced Reddit API Example](https://redux.js.org/advanced/example-reddit-api) from Redux.

```ts
import { createModel } from '@captaincodeman/rdx'
import { State, Store } from '../store'

export interface SubredditState {
  isFetching: boolean
  didInvalidate: boolean
  items: any[]
  lastUpdated: number
}

const blankSubredditState: SubredditState = {
  isFetching: false,
  didInvalidate: false,
  items: [],
  lastUpdated: 0,
}

export interface RedditState {
  postsBySubreddit: { [subreddit: string]: SubredditState }
  selectedSubreddit: string
}

export default createModel({
  state: <RedditState>{
    postsBySubreddit: { },
    selectedSubreddit: 'reactjs',
  },

  reducers: {
    selectSubreddit(state, subreddit: string) {
      return { ...state,
        selectedSubreddit: subreddit,
      }
    },

    invalidateSubreddit(state, subreddit: string) {
      return { ...state,
        [subreddit]: { ...state[subreddit] || blankSubredditState,
          didInvalidate: true,
        }
      }
    },

    requestPosts(state, subreddit: string) {
      return { ...state,
        [subreddit]: { ...state[subreddit] || blankSubredditState,
          isFetching: true,
          didInvalidate: false,
        }
      }
    },

    receivePosts(state, payload: { subreddit: string, posts: any[], receivedAt: number }) {
      return { ...state,
        [payload.subreddit]: { ...state[payload.subreddit] || blankSubredditState,
          isFetching: false,
          didInvalidate: false,
          items: payload.items,
          lastUpdated: payload.receivedAt,
        }
      }
    },
  },

  effects(store: Store) {
    const dispatch = store.getDispatch()

    function shouldFetchPosts(subreddit: string) {
      const state = store.getState()
      const posts = state.postsBySubreddit[subreddit]

      if (!posts) {
        return true
      } else if (posts.isFetching) {
        return false
      } else {
        return posts.didInvalidate
      }
    }

    return {
      async fetchPosts(subreddit: string) {
        dispatch.reddit.requestPosts(subreddit)
        const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`)
        const json = await response.json()
        dispatch.reddit.receivePosts({
          subreddit,
          posts: json.data.children.map(child => child.data),
          receivedAt: Date.now(),
        })
      },

      async fetchPostsIfNeeded(subreddit: string) {
        if (shouldFetchPosts(subreddit)) {
          dispatch.reddit.fetchPosts(subreddit)
        }
      }
    }
  }
})
```