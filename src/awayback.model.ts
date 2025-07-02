// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Definition = { [key: string]: (...parameters: any[]) => void }

export enum ListenerType {
  on = 'on',
  once = 'once',
  only = 'only',
}

export type ListenerOptions<D extends Definition, E extends keyof D> = {
  predicate?: (...parameters: Parameters<D[E]>) => boolean
  signal?: AbortSignal
  isExecutingPrevious?: boolean
}

export type PromiseOptions<D extends Definition, E extends keyof D> = ListenerOptions<D, E> & {
  timeout?: number
  reject?: Exclude<keyof D, E>[]
}

export type CallbackHandler<D extends Definition, E extends keyof D> = (...parameters: Parameters<D[E]>) => void

export type Callback<D extends Definition, E extends keyof D> = {
  type: ListenerType
  handler: CallbackHandler<D, E>
  runs: number
  calls: number
  options: ListenerOptions<D, E>
}

export type Events<D extends Definition> = {
  [E in keyof D]: {
    callbacks: Callback<D, E>[]
    data: Parameters<D[E]>[]
    runs: number
  }
}
