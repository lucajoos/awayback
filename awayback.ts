import { Callback, CallbackType, Definition, Events, CallbackOptions, CallbackHandler } from './awayback.model'
import { merge } from 'lodash'

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
      callbacks: new Proxy<Callback<D, keyof D>[]>([], {
        set: (target, property, value, receiver) => {
          const self = events[event]
          if (!self) return false

          if (self.runs > 0) {
            self.callbacks.forEach((callback) => {
              let isExiting = false

              while (callback.runs < self.runs && !isExiting && callback.options.isExecutingPrevious) {
                if (
                  callback.type === CallbackType.on ||
                  (callback.type === CallbackType.once && callback.runs === 0) ||
                  (callback.type === CallbackType.only &&
                    callback.runs === 0 &&
                    self.callbacks.reduce((sum, callback) => sum + callback.runs, 0) === 0)
                ) {
                  callback.runs++
                  callback.handler(...self.data[callback.runs - 1])
                } else {
                  isExiting = true
                }
              }
            })
          }

          return Reflect.set(target, property, value, receiver)
        },
      }),

      runs: 0,
      data: [] as D[E][],
    }
  }

  function emit<E extends keyof D>(event: E, ...data: D[E]) {
    if (typeof events[event] === 'undefined') create(event)

    const container = events[event]
    if (!container) return

    if (typeof data !== 'undefined') {
      container.data.push(data)
    }

    container.runs++

    container.callbacks.forEach((callback) => {
      if (
        callback.type === CallbackType.on ||
        (callback.type === CallbackType.once && callback.runs === 0) ||
        (callback.type === CallbackType.only &&
          callback.runs === 0 &&
          container.callbacks.reduce((sum, callback) => sum + callback.runs, 0) === 0)
      ) {
        callback.runs++
        callback.handler(...container.data[callback.runs - 1])
      }
    })
  }

  function listen<E extends keyof D>(
    type: CallbackType,
    event: E,
    handler: CallbackHandler<D, E>,
    options?: CallbackOptions
  ) {
    if (typeof events[event] === 'undefined') create(event)

    const self = events[event]
    if (!self) return

    self.callbacks.push({
      handler: handler as CallbackHandler<D, keyof D>,
      type,
      runs: 0,
      options: merge({ isExecutingPrevious: false }, options ?? {}),
    })
  }

  function on<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: CallbackOptions) {
    listen(CallbackType.on, event, handler, options)
  }

  function once<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: CallbackOptions) {
    listen(CallbackType.once, event, handler, options)
  }

  function only<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: CallbackOptions) {
    listen(CallbackType.only, event, handler, options)
  }

  function remove<E extends keyof D>(event: E, handler: CallbackHandler<D, E>) {
    if (typeof events[event] === 'undefined') return

    const self = events[event]
    if (!self) return

    self.callbacks = self.callbacks.filter((callback) => callback.handler !== handler)
  }

  return {
    events,
    emit,
    on,
    once,
    only,
    remove,
  }
}

export default awayback
