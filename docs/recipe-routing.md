# Routing Recipes

Here are some typical problems and suggested solutions. As is often the case, the recipes show just _one_ way to do it, not _the_ way. While we think, our recipes are solid, your situation may require and justify a different approach.

In order to keep the recipes short and to the point, here are other routing related parts of the documentation you may find relevant:

- Check out [how to set-up the routing plugin](plugin-routing?id=example).
- Find a very simple [router outlet for lit-element based applications](advanced?id=router-outlet).
- Learn how to [integrate models](advanced?id=models-integration) to facilitate early loading of app data.
- Read the fine print in the [routing api](api-routing).

## Recipe 1: Multiple Router Outlets

Sometimes the hierarchy of your UI components does not follow the hierarchy of your data architecture. E.g. if you use `<mwc-top-app-bar>` for application layout, you might not just want to change the main view of the application (the part under the top bar), but you might also want to change the title, or the navigation icon, or the "action items" (toolbar icons) based on the view you are displaying, if you selected an item in a list, etc.

Luckily, by using Rdx, you have already provided a "single source of truth" for application state, and by using the routing plugin, this state includes routing information as well. So, all you need to do, is tap into that state information in more than one component, making it a router outlet.

_NOTE:_ All the router outlets are based on the [example in the advanced guide](advanced?id=router-outlet). The explanations will not be repeated here.

### src/ui/app-shell.ts

This is the top level web component, that contains the entire application. In this case it uses a `<mwc-top-app-bar-fixed>` element for the application layout.

```ts
import { LitElement, customElement, html, css } from 'lit-element'
import '@material/mwc-top-app-bar-fixed'
import './app-bar-action-items'
import './app-bar-nav-icon'
import './app-bar-title'
import './app-router'

@customElement('app-shell')
export class AppShellElement extends LitElement {
  render() {
    return html`<mwc-top-app-bar-fixed>
      <app-bar-nav-icon slot="navigationIcon"></app-bar-nav-icon>
      <app-bar-title slot="title"></app-bar-title>
      <app-bar-action-items slot="actionItems"></app-bar-action-items>
      <app-router></app-router>
    </mwc-top-app-bar-fixed>`
  }

  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
      }
      mwc-top-app-bar-fixed {
        height: 100%;
      }
    `
  }
}
```

### src/ui/app-bar-action-items.ts

```ts
import { TemplateResult, customElement, html, property } from 'lit-element'
import { RoutingState } from '@captaincodeman/rdx'
import '@material/mwc-icon-button'
import { Connected, State } from '../connected'

const contentByPage = {
  'todo-list': html`<mwc-icon-button icon="add"></mwc-icon-button>`,
  'todo-details': html`<mwc-icon-button icon="done"></mwc-icon-button><mwc-icon-button icon="delete"></mwc-icon-button>`,
}

@customElement('app-bar-action-items')
class AppBarActionItemsElement extends Connected {
  private page: string

  @property({attribute: false})
  content: TemplateResult

  mapState(state: State) {
    return {
      route: state.routing
    }
  }

  set route(val: RoutingState) {
    if (val.page !== this.page) {
      this.page = val.page
      this.content = contentByPage[this.page] || ''
    }
  }

  render() {
    return this.content
  }
}
```

### src/ui/app-bar-nav-icon.ts

```ts
import { TemplateResult, customElement, html, property } from 'lit-element'
import { nothing } from 'lit-html'
import { RoutingState } from '@captaincodeman/rdx'
import '@material/mwc-icon-button'
import { Connected, State } from '../connected'

const contentByPage = {
  'home': html`<mwc-icon-button icon="menu"></mwc-icon-button>`,
  'todo-list': html`<mwc-icon-button icon="menu"></mwc-icon-button>`,
  'todo-details': html`<mwc-icon-button icon="arrow_back"></mwc-icon-button><mwc-icon-button icon="delete"></mwc-icon-button>`,
  'not-found': html`<mwc-icon-button icon="menu"></mwc-icon-button>`,
}

@customElement('app-bar-nav-icon')
class AppBarNavIconElement extends Connected {
  private page: string

  @property({attribute: false})
  content: string

  mapState(state: State) {
    return {
      route: state.routing
    }
  }

  set route(val: RoutingState) {
    if (val.page !== this.page) {
      this.page = val.page
      this.content = contentByPage[this.page] || ''
    }
  }

  render() {
    return this.content
  }
}
```

### src/ui/app-bar-title.ts

```ts
import { TemplateResult, customElement, html, property } from 'lit-element'
import { RoutingState } from '@captaincodeman/rdx'
import '@material/mwc-icon-button'
import { Connected, State } from '../connected'

const contentByPage = {
  'home': 'My App',
  'todo-list': 'List',
  'todo-details': 'Details',
}

@customElement('app-bar-title')
class AppBarTitleElement extends Connected {
  private page: string

  @property({attribute: false})
  content: TemplateResult

  mapState(state: State) {
    return {
      route: state.routing
    }
  }

  set route(val: RoutingState) {
    if (val.page !== this.page) {
      this.page = val.page
      this.content = contentByPage[this.page] || ''
    }
  }

  render() {
    return this.content
  }
}
```

### src/ui/app-router.ts

This is exactly the same as the [router outlet for lit-element based applications](advanced?id=router-outlet).

## Recipe 2: Lazy Loading Views

The term "lazy loading" refers to the concept, that you don't provide all source code of the entire app to the browser in one go, but rather just provide the absolutely required minimum amount (aka be lazy), and then, if the user uses certain parts, go and load that afterwards.
If your application could just load the bare minimum on start-up, that should speed up application start-up time (and thereby improve your app's lighthouse score).

In order to lazily load views you need to change the app router a bit. The lazy loading itself is achieved through using [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) (aka "import function").

_NOTE:_ Dynamic imports still require the module specifier to be a static string literal. Providing a string variable is **not supported**, so you need to hard code which module to import for which route.

### src/ui/lazy-app-router.ts

```ts
import { customElement, html, property } from 'lit-element'
import { RoutingState } from '@captaincodeman/rdx'
import '@material/mwc-icon-button'
import { Connected, State } from '../connected'
// view-home and view-not-found are fundamental (and small)
// they are eagerly loaded in this example
import './view-home'
import './view-not-found'

@customElement('lazy-app-router')
class LazyAppRouterElement extends Connected {
  private page: string

  @property({attribute: false})
  content: TemplateResult

  mapState(state: State) {
    return {
      route: state.routing
    }
  }

  set route(val: RoutingState) {
    if (val.page !== this.page) {
      this.page = val.page
      switch (this.page) {
        case 'home':
          // view-home was eagerly loaded, can be used right away...
          this.content = html`<view-home></view-home>`
          break
        case 'not-found':
          // view-not-found was eagerly loaded, can be used right away...
          this.content = html`<view-not-found></view-not-found>`
          break
        // dynamic imports provide a Promise based API
        case 'todo-list':
          import('./view-todo-list').then(() => { this.content = html`<view-todo-list>` })
          break
        case 'todo-list':
          import('./view-todo-details').then(() => { this.content = html`<view-todo-details>` })
          break
      }
    }
  }

  render() {
    return this.content
  }
}
```