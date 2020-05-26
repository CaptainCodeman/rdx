import { Matcher, Result } from '@captaincodeman/router'

import { RoutingOptions, RoutingState, RoutingDispatch } from '../typings/routing'
import { Store } from '../typings/modelStore'

import { createModel } from './createModel'

const history = window.history
const popstate = 'popstate'
const dispatchPopstate = () => dispatchEvent(new Event(popstate))

export const routingPluginFactory = (router: Matcher, options?: Partial<RoutingOptions>) => {
  const opt = <RoutingOptions>{
    transform: (result) => result,
    ...options,
  }

  return {
    model: createModel({
      state: <RoutingState>{ page: '', params: {} },

      reducers: {
        change: (_state: any, payload: RoutingState): RoutingState => payload
      },

      effects: (_store: any) => ({
        back() {
          history.back()
          dispatchPopstate()
        },

        forward() {
          history.forward()
          dispatchPopstate()
        },

        go(payload: number) {
          history.go(payload)
          dispatchPopstate()
        },

        push(href: string) {
          history.pushState(null, '', href)
          dispatchPopstate()
        },

        replace(href: string) {
          history.replaceState(null, '', href)
          dispatchPopstate()
        },
      }),
    }),

    onStore(store: Store) {
      // TODO: pass in typed 'this' so it can access it's own dispatch + state
      // also, name should be whatever name is being assigned to this plugin
      const dispatch = store.dispatch['routing'] as unknown as RoutingDispatch

      // listen for route changes
      const routeChanged = () => {
        const route = router(location.pathname)
        if (route) {
          dispatch.change(opt.transform(route))
        }
      }

      window.addEventListener(popstate, routeChanged)

      // listen for click events
      window.addEventListener('click', (e: MouseEvent) => {
        const href = clickHandler(e)

        // handler returns null if we're not to handle it
        if (href) {
          e.preventDefault()
          history.pushState(null, '', href)
          dispatchPopstate()
        }
      })

      // although we _could_ populate the initial route at create time
      // it makes things easier if the app can listen for "route changes"
      // in a consistent way without special-casing it. We do this using
      // a microtask so that if the devtools middleware is being added, 
      // this initial dispatch can be captured by it
      queueMicrotask(routeChanged)
    }
  }
}

// link is 'internal' to the app if it's within the baseURI of the page (handles sub-apps)
const isInternal = (a: HTMLAnchorElement) => a.href.startsWith(document.baseURI)

// external isn't just !internal, it's having an attribute explicitly marking it as such
const isExternal = (a: HTMLAnchorElement) => (a.getAttribute('rel') || '').includes('external')

// download links may be within the app so need to be specifically ignored if utilized
const isDownload = (a: HTMLAnchorElement) => a.hasAttribute('download')

// if the link is meant to open in a new tab or window, we need to allow it to function
const isTargeted = (a: HTMLAnchorElement) => a.target

// if a non-default click or modifier key is used with the click, we leave native behavior
const isModified = (e: MouseEvent) => (e.button && e.button !== 0)
  || e.metaKey
  || e.altKey
  || e.ctrlKey
  || e.shiftKey
  || e.defaultPrevented

// get the anchor element clicked on, taking into account shadowDom components
const getAnchor = (e: MouseEvent) => <HTMLAnchorElement>e.composedPath().find(n => (n as HTMLElement).tagName === 'A')

// standard handler contains complete logic for what to ignore
const clickHandler = (e: MouseEvent) => {
  const anchor = getAnchor(e)
  return anchor === undefined // not a link
    || !isInternal(anchor)
    || isDownload(anchor)
    || isExternal(anchor)
    || isTargeted(anchor)
    || isModified(e)
    ? null
    : anchor.href
}

// parseQuery creates an additional object based on querystring parameters
// not every app will require this so we can make it optional by setting 
// the transform to withQuerystring

export const withQuerystring = (result: Result) => {
  const params = new URLSearchParams(location.search)
  const queries = parseQuery(params)
  return <RoutingState>{ ...result, queries }
}

function parseQuery(params: URLSearchParams) {
  const q: { [key: string]: string | string[] } = {}
  for (const p of params.entries()) {
    const [k, v] = p
    const c = q[k]
    if (c) {
      if (Array.isArray(c)) {
        c.push(v)
      } else {
        q[k] = [c, v]
      }
    } else {
      q[k] = v
    }
  }
  return q
}
