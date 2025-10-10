// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Definition = { [key: string]: (...parameters: any[]) => void }

export enum ListenerType {
  on = 'on',
  once = 'once',
  only = 'only',
}

export type ListenerOptions<D extends Definition, E extends keyof D, C extends (keyof D)[] | undefined> = {
  predicate?: (...parameters: Parameters<D[E]>) => boolean
  signal?: AbortSignal
  isExecutingPrevious?: C extends (keyof D)[] ? (E extends C[number] ? boolean : false) : boolean
}

export type PromiseOptions<
  D extends Definition,
  E extends keyof D,
  C extends (keyof D)[] | undefined,
> = ListenerOptions<D, E, C> & {
  timeout?: number
  reject?: Exclude<keyof D, E>[]
}

export type CallbackHandler<D extends Definition, E extends keyof D> = (...parameters: Parameters<D[E]>) => void

export type Callback<D extends Definition, E extends keyof D, C extends (keyof D)[] | undefined> = {
  type: ListenerType
  handler: CallbackHandler<D, E>
  runs: number
  calls: number
  options: ListenerOptions<D, E, C>
}

export type Events<D extends Definition, C extends (keyof D)[] | undefined> = {
  [E in keyof D]: {
    callbacks: Callback<D, E, C>[]
    data: Parameters<D[E]>[]
    runs: number
  }
}

export type Awayback<D extends Definition, C extends (keyof D)[] | undefined = undefined> = {
  events: Events<D, C>
  emit: <E extends keyof D>(event: E, ...data: Parameters<D[E]>) => void
  on: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E, C>) => void
  once: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E, C>) => void
  only: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E, C>) => void
  promise: <E extends keyof D>(event: E, options?: PromiseOptions<D, E, C>) => Promise<Parameters<D[E]>>
  remove: <E extends keyof D>(event: E, handler: CallbackHandler<D, E>) => void
  destroy: () => void
}
