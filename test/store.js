import { Store, combineReducers } from '../lib/index.min.js'
const { expect } = chai

describe('store', function() {
  const reducers = {
    count: (state = 0, action) => {
      switch (action.type) {
        case 'inc': 
          return state + action.payload
        default:
          return state
      }
    },
    name: (state = '', action) => {
      switch (action.type) {
        case 'rename': 
          return action.payload
        default:
          return state
      }
    }
  }
  
  const reducer = combineReducers(reducers)
  let store

  this.beforeEach(function() {
    store = new Store(undefined, reducer)
  })

  it('should create', function() {
    expect(store).not.null
    expect(store.state).not.null
  })

  it('should set initial state from reducers', function() {
    expect(store.state).not.null
    expect(store.state.count).equal(0)
    expect(store.state.name).equal('')
  })

  it('should call reducers when action dispatched', function() {
    store.dispatch({ type: 'inc', payload: 5 })
    store.dispatch({ type: 'inc', payload: 2 })
    store.dispatch({ type: 'rename', payload: 'CaptainCodeman' })
    expect(store.state.count).equal(7)
    expect(store.state.name).equal('CaptainCodeman')
  })

  it('should dispatch event when action dispatched', function() {
    let action
    store.addEventListener('dispatch', e => action = e.detail.action)
    store.dispatch({ type: 'rename', payload: 'CaptainCodeman' })
    expect(action).deep.equal({ type: 'rename', payload: 'CaptainCodeman' })
  })
  
  it('should dispatch event when state updated', function() {
    let action
    store.addEventListener('state', e => action = e.detail.action)
    store.dispatch({ type: 'rename', payload: 'CaptainCodeman' })
    expect(action).deep.equal({ type: 'rename', payload: 'CaptainCodeman' })
  })
})