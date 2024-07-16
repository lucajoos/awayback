export type Definition = Record<string, unknown[]>

export enum CallbackType {
  on = 0,
  once = 1,
  only = 2,
}

export type CallbackOptions = {
  isExecutingPrevious?: boolean
}

export type CallbackHandler<D extends Definition, E extends keyof D> = (...parameters: D[E]) => unknown

export type Callback<D extends Definition, E extends keyof D> = {
  type: CallbackType
  handler: CallbackHandler<D, E>
  runs: number

  options: CallbackOptions
}

export type Events<D extends Definition> = {
  [E in keyof D]: {
    callbacks: Callback<D, E>[]
    data: D[E][]

    runs: number
  }
}
