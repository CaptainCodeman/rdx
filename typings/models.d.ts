import { Model, ModelDispatch } from './model'

interface Models {
  [name: string]: Model
}

type ModelsState<M extends Models> = {
  [K in keyof M]: M[K] extends Model<infer S> ? S : never
}

type ModelsDispatch<M extends Models> = {
  [K in keyof M]: M[K] extends Model<infer S, infer R, infer E> ? ModelDispatch<S, R, E> : never
}
