// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Definition = { [key: string]: (...parameters: any[]) => void }

export enum ListenerType {
  on = 0b00,
  once = 0b01,
  only = 0b10,
}

export type ListenerOptions<D extends Definition, E extends keyof D, R extends (keyof D)[] | undefined> = {
  predicate?: (...parameters: Parameters<D[E]>) => boolean
  signal?: AbortSignal
  isReplaying?: R extends (keyof D)[] ? (E extends R[number] ? boolean : false) : false
}

export type PromiseOptions<
  D extends Definition,
  E extends keyof D,
  R extends (keyof D)[] | undefined,
> = ListenerOptions<D, E, R> & {
  timeout?: number
  reject?: Exclude<keyof D, E>[]
}

export type ListenerCallback<D extends Definition, E extends keyof D> = (...parameters: Parameters<D[E]>) => void

export enum ListenerProperty {
  type = 0b000,
  callback = 0b001,
  emissions = 0b010,
  executions = 0b011,
  options = 0b100,
}

export type Listener<D extends Definition, E extends keyof D, R extends (keyof D)[] | undefined> = {
  [ListenerProperty.type]: ListenerType
  [ListenerProperty.callback]: ListenerCallback<D, E>
  [ListenerProperty.emissions]: number
  [ListenerProperty.executions]: number
  [ListenerProperty.options]: ListenerOptions<D, E, R>
}

export enum EventProperty {
  listeners = 0b000,
  parameters = 0b001,
  emissions = 0b010,
}

export type Events<D extends Definition, R extends (keyof D)[] | undefined> = {
  [E in keyof D]: {
    [EventProperty.listeners]: Listener<D, E, R>[]
    [EventProperty.parameters]: Parameters<D[E]>[]
    [EventProperty.emissions]: number
  }
}

export type Awayback<D extends Definition, R extends (keyof D)[] | undefined = undefined> = {
  events: Events<D, R>
  emit: <E extends keyof D>(event: E, ...data: Parameters<D[E]>) => void
  on: <E extends keyof D>(event: E, handler: ListenerCallback<D, E>, options?: ListenerOptions<D, E, R>) => void
  once: <E extends keyof D>(event: E, handler: ListenerCallback<D, E>, options?: ListenerOptions<D, E, R>) => void
  only: <E extends keyof D>(event: E, handler: ListenerCallback<D, E>, options?: ListenerOptions<D, E, R>) => void
  promise: <E extends keyof D>(event: E, options?: PromiseOptions<D, E, R>) => Promise<Parameters<D[E]>>
  remove: <E extends keyof D>(event: E, handler: ListenerCallback<D, E>) => void
  destroy: () => void
}
