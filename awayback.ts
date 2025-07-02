import { merge } from 'lodash-es'
import {
  Callback,
  CallbackHandler,
  Definition,
  Events,
  ListenerOptions,
  ListenerType,
  type PromiseOptions,
} from './awayback.model.js'
import { any } from './helpers.js'

/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
function awayback<D extends Definition>() {
  const events = {} as Events<D>
  const timeouts: Record<string, ReturnType<typeof setTimeout>> = {}

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

    self.runs += 1

    self.callbacks.forEach((callback) => {
      if (
        callback.type === ListenerType.on ||
        (callback.type === ListenerType.once && callback.runs === 0) ||
        (callback.type === ListenerType.only &&
          callback.runs === 0 &&
          self.callbacks.reduce((sum, current) => sum + current.runs, 0) === 0)
      ) {
        if (typeof callback.options.predicate === 'function' && !callback.options.predicate(...data)) return
        callback.handler(...data)
        callback.runs += 1
      }
    })
  }

  function listen<E extends keyof D>(
    type: ListenerType,
    event: E,
    handler: CallbackHandler<D, E>,
    options?: ListenerOptions<D, E>
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

        while (callback.runs < self.runs) {
          if (
            callback.type === ListenerType.on ||
            (callback.type === ListenerType.once && callback.runs === 0) ||
            (callback.type === ListenerType.only &&
              callback.runs === 0 &&
              self.callbacks.reduce((sum, current) => sum + current.runs, 0) === 0)
          ) {
            const data = self.data[callback.runs]

            if (typeof callback.options.predicate === 'function' && !callback.options.predicate(...data)) break
            callback.handler(...data)
            callback.runs += 1
          } else break
        }
      })
    }
  }

  function on<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E>) {
    listen(ListenerType.on, event, handler, options)
  }

  function once<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E>) {
    listen(ListenerType.once, event, handler, options)
  }

  function only<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E>) {
    listen(ListenerType.only, event, handler, options)
  }

  function promise<E extends keyof D>(event: E, options?: PromiseOptions<D, E>): Promise<Parameters<D[E]>> {
    return new Promise((resolve, reject) => {
      const controller = new AbortController()
      const signal = any(controller.signal, options?.signal)

      const _options = merge(options, { signal })

      once(
        event,
        (...data) => {
          controller.abort()
          resolve(data)
        },
        _options
      )

      if (Array.isArray(_options?.reject)) {
        _options.reject.forEach((current) => {
          once(
            current,
            () => {
              controller.abort()
              reject(new Error(`Event "${String(event)}" was rejected due to "${String(current)}" event.`))
            },
            { isExecutingPrevious: _options.isExecutingPrevious, signal }
          )
        })
      }

      flow: if (typeof _options.timeout === 'number') {
        if (signal.aborted) break flow
        const id = Math.random().toString(16).slice(2)

        signal.addEventListener('abort', () => {
          if (!timeouts[id]) return
          clearTimeout(timeouts[id])
          delete timeouts[id]
        })

        timeouts[id] = setTimeout(() => {
          controller.abort()
          reject(new Error(`Event "${String(event)}" was rejected due to timeout after ${_options.timeout}ms`))
        }, _options.timeout)
      }
    })
  }

  function remove<E extends keyof D>(event: E, handler: CallbackHandler<D, E>) {
    if (typeof events[event] === 'undefined') return

    const self = events[event]
    if (!self) return

    self.callbacks = self.callbacks.filter((callback) => callback.handler !== handler)
  }

  function destroy() {
    Object.keys(timeouts).forEach((id) => {
      clearTimeout(timeouts[id])
      delete timeouts[id]
    })

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

export { ListenerType }
export type { Callback, CallbackHandler, Definition, Events, ListenerOptions }

export default awayback
