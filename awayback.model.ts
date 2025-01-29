// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Definition = { [key: string]: (...parameters: any[]) => void }

export enum CallbackType {
  on = 'on',
  once = 'once',
  only = 'only',
}

export type CallbackOptions = {
  isExecutingPrevious?: boolean
  signal?: AbortSignal
}

export type CallbackHandler<D extends Definition, E extends keyof D> = (...parameters: Parameters<D[E]>) => void

export type Callback<D extends Definition, E extends keyof D> = {
  type: CallbackType
  handler: CallbackHandler<D, E>
  runs: number

  options: CallbackOptions
}

export type Events<D extends Definition> = {
  [E in keyof D]: {
    callbacks: Callback<D, E>[]
    data: Parameters<D[E]>[]

    runs: number
  }
}
