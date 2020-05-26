# Quickstart

Using Rdx is easy. Here's how to get started.

For a ready-made project, see the [demo project](https://github.com/CaptainCodeman/rdx-demo/)

## Install Package

You'll typically want to install Rdx as a dev-dependency (assuming you are bundling your app)

    npm install -D @captaincodeman/rdx

## Typescript Configuration

We recommend TypeScript - it provides strong-typing so you get development-time checks on your state store and dispatch methods.

Here's the `tsconfig.json` file we'll use:

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "module": "esnext",
    "target": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "noUnusedParameters": true,
    "noUnusedLocals": true,
    "noImplicitReturns": true,
    "strictPropertyInitialization": false,
    "noImplicitAny": false,
    "importHelpers": true,
    "noEmitHelpers": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "lib": [
      "esnext",
      "dom",
      "dom.iterable"
    ]
  },
}
```