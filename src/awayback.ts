import { merge } from 'lodash-es'
import {
  Callback,
  CallbackHandler,
  Definition,
  Events,
  ListenerOptions,
  ListenerType,
  type Awayback,
  type PromiseOptions,
} from './awayback.model.js'
import { any } from './helpers.js'

/**
 * @license
 * awayback
 * Released under MIT license
 * Copyright Luca Raúl Joos
 */
function awayback<D extends Definition>(cache?: undefined): Awayback<D, undefined>
function awayback<D extends Definition, const C extends (keyof D)[]>(cache: C): Awayback<D, C>
function awayback<D extends Definition, const C extends (keyof D)[] | undefined = undefined>(
  cache?: C
): Awayback<D, C> {
  const events = {} as Events<D, C>
  const timeouts: Record<string, ReturnType<typeof setTimeout>> = {}

  function create<E extends keyof D>(event: E) {
    events[event] = {
      c: <Callback<D, E, C>[]>[],
      d: <Parameters<D[E]>[]>[],
      r: 0,
    }
  }

  function emit<E extends keyof D>(event: E, ...data: Parameters<D[E]>) {
    if (typeof events[event] === 'undefined') create(event)

    const self = events[event]
    if (!self) return

    if (typeof data !== 'undefined' && (!Array.isArray(cache) || cache.includes(event))) {
      self.d.push(data)
    }

    self.r += 1

    self.c.forEach((callback) => {
      if (!events[event]) return

      if (
        callback.t === ListenerType.on ||
        (callback.t === ListenerType.once && callback.c === 0) ||
        (callback.t === ListenerType.only &&
          callback.c === 0 &&
          self.c.reduce((sum, current) => sum + current.c, 0) === 0)
      ) {
        callback.r += 1
        if (typeof callback.o.predicate === 'function' && !callback.o.predicate(...data)) return

        try {
          callback.h(...data)
        } catch (error) {
          console.error(`Error occurred in event handler for event "${String(event)}":`, error)
        }

        callback.c += 1
      }
    })
  }

  function listen<E extends keyof D>(
    type: ListenerType,
    event: E,
    handler: CallbackHandler<D, E>,
    options?: ListenerOptions<D, E, C>
  ) {
    if (typeof events[event] === 'undefined') create(event)

    const self = events[event]
    if (!self) return

    if (options?.signal) {
      if (options.signal.aborted) return

      options.signal.addEventListener('abort', () => {
        remove(event, handler)
      })
    }

    self.c.push({
      h: handler as CallbackHandler<D, keyof D>,
      t: type,
      r: 0,
      c: 0,
      o: merge({ isExecutingPrevious: false }, options ?? {}),
    })

    if (self.r > 0) {
      self.c.forEach((callback) => {
        if (!(callback.o.isExecutingPrevious ?? false)) return

        while (callback.r < self.r) {
          if (!events[event]) break

          if (
            callback.t === ListenerType.on ||
            (callback.t === ListenerType.once && callback.c === 0) ||
            (callback.t === ListenerType.only &&
              callback.c === 0 &&
              self.c.reduce((sum, current) => sum + current.c, 0) === 0)
          ) {
            const data = self.d[callback.r]
            callback.r += 1

            if (typeof callback.o.predicate === 'function' && !callback.o.predicate(...data)) continue

            try {
              callback.h(...data)
            } catch (error) {
              console.error(`Error occurred in event handler for event "${String(event)}":`, error)
            }

            callback.c += 1
          } else break
        }
      })
    }
  }

  function on<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E, C>) {
    listen(ListenerType.on, event, handler, options)
  }

  function once<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E, C>) {
    listen(ListenerType.once, event, handler, options)
  }

  function only<E extends keyof D>(event: E, handler: CallbackHandler<D, E>, options?: ListenerOptions<D, E, C>) {
    listen(ListenerType.only, event, handler, options)
  }

  function promise<E extends keyof D>(event: E, options?: PromiseOptions<D, E, C>): Promise<Parameters<D[E]>> {
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
            {
              isExecutingPrevious: <ListenerOptions<D, typeof current, C>['isExecutingPrevious']>(
                (cache.includes(current) ? _options.isExecutingPrevious : false)
              ),
              signal,
            }
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

    self.c = self.c.filter((callback) => callback.h !== handler)
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
