import {
  Callback,
  CallbackType as ListenerType,
  Definition,
  Events,
  CallbackOptions as ListenerOptions,
  CallbackHandler,
} from './awayback.model.js'
import { merge } from 'lodash-es'

/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
function awayback<D extends Definition>() {
  const events = {} as Events<D>

  function create<E extends keyof D>(event: E) {
    events[event] = {
      callbacks: [] as Callback<D, E>[],
      data: [] as Parameters<D[E]>[],
      runs: 0,
    }
  }

  function emit<E extends keyof D>(event: E, ...data: Parameters<D[E]>) {
    if (typeof events[event] === 'undefined') create(event)

    const self = events[event]
    if (!self) return

    if (typeof data !== 'undefined') {
      self.data.push(data)
    }

    self.runs++

    self.callbacks.forEach((callback) => {
      if (
        callback.type === ListenerType.on ||
        (callback.type === ListenerType.once && callback.runs === 0) ||
        (callback.type === ListenerType.only &&
          callback.runs === 0 &&
          self.callbacks.reduce((sum, callback) => sum + callback.runs, 0) === 0)
      ) {
        callback.handler(...data)
        callback.runs++
      }
    })
  }

  function listen<E extends keyof D>(
    type: ListenerType,
    event: E,
    handler: CallbackHandler<D, E>,
    options?: ListenerOptions
  ) {
    if (typeof events[event] === 'undefined') create(event)

    const self = events[event]
    if (!self) return

    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        remove(event, handler)
      })
    }

    self.callbacks.push({
      handler: handler as CallbackHandler<D, keyof D>,
      type,
      runs: 0,
      options: merge({ isExecutingPrevious: false }, options ?? {}),
    })

    if (self.runs > 0) {
      self.callbacks.forEach((callback) => {
        if (!(callback.options.isExecutingPrevious ?? false)) return

        let isExiting = false

        while (callback.runs < self.runs && !isExiting) {
          if (
            callback.type === ListenerType.on ||
            (callback.type === ListenerType.once && callback.runs === 0) ||
            (callback.type === ListenerType.only &&
              callback.runs === 0 &&
              self.callbacks.reduce((sum, callback) => sum + callback.runs, 0) === 0)
          ) {
            callback.handler(...self.data[callback.runs])
            callback.runs++
          } else {
            isExiting = true
          }
        }
      })
    }
  }

  function on<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions) {
    listen(ListenerType.on, event, handler, options)
  }

  function once<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions) {
    listen(ListenerType.once, event, handler, options)
  }

  function only<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions) {
    listen(ListenerType.only, event, handler, options)
  }

  function promise<E extends keyof D>(event: E, options?: ListenerOptions): Promise<Parameters<D[E]>> {
    return new Promise((resolve) => {
      once(
        event,
        (...data) => {
          resolve(data)
        },
        options
      )
    })
  }

  function remove<E extends keyof D>(event: E, handler: CallbackHandler<D, E>) {
    if (typeof events[event] === 'undefined') return

    const self = events[event]
    if (!self) return

    self.callbacks = self.callbacks.filter((callback) => callback.handler !== handler)
  }

  function destroy() {
    Object.keys(events).forEach((event) => {
      delete events[event]
    })
  }

  return {
    events,
    emit,
    on,
    once,
    only,
    promise,
    remove,
    destroy,
  }
}

export { ListenerType as CallbackType }
export type { Callback, Definition, Events, ListenerOptions as CallbackOptions, CallbackHandler }

export default awayback
