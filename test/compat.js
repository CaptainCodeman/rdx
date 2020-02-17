import { Store } from '../lib/index.js'
import { applyMiddleware } from '../lib/compat.js'
const { expect } = chai

describe('compat', function() {
  let store, count = 0

  // test middleware that can handle an action or not
  const testMiddleware = store => next => action => action.type === 'handled'
    ? undefined
    : next(action)

  const reducer = (state = 0, action) => {
    count++
    switch (action.type) {
      case 'inc': 
        return state + action.payload
      default:
        return state
    }
  }

  this.beforeEach(function() {
    this.timeout(60*60*60);
    count = -1  // accounts for the first reducer call
    store = new Store(undefined, reducer)
  })

  it('should handle in middleware', async function() {
    const s = applyMiddleware(store, testMiddleware)
    s.dispatch({ type: 'handled'})
    expect(count).to.equal(0)
  })

  it('should not handle in middleware', async function() {
    const s = applyMiddleware(store, testMiddleware)
    s.dispatch({ type: 'unhandled'})
    expect(count).to.equal(1)
  })
})