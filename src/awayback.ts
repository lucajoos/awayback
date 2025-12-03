import { defaults, merge } from 'lodash-es'
import {
  Definition,
  EventProperty,
  Events,
  Listener,
  ListenerCallback,
  ListenerOptions,
  ListenerProperty,
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
function awayback<D extends Definition>(replayable?: undefined): Awayback<D, undefined>
function awayback<D extends Definition, const R extends (keyof D)[]>(replayable: R): Awayback<D, R>
function awayback<D extends Definition, const R extends (keyof D)[] | undefined = undefined>(
  replayable?: R
): Awayback<D, R> {
  const events: Partial<Events<D, R>> = {}
  const timeouts: Record<string, ReturnType<typeof setTimeout>> = {}

  function _create<E extends keyof D>(event: E) {
    events[event] = {
      [EventProperty.listeners]: <Listener<D, E, R>[]>[],
      [EventProperty.parameters]: <Parameters<D[E]>[]>[],
      [EventProperty.emissions]: 0,
    }
  }

  function _listen<E extends keyof D>(
    type: ListenerType,
    event: E,
    callback: ListenerCallback<D, E>,
    options?: ListenerOptions<D, E, R>
  ) {
    if (typeof events[event] === 'undefined') _create(event)

    const self = events[event]
    if (!self) return

    if (options?.signal) {
      if (options.signal.aborted) return

      options.signal.addEventListener('abort', () => {
        remove(event, callback)
      })
    }

    self[EventProperty.listeners].push({
      [ListenerProperty.callback]: callback,
      [ListenerProperty.type]: type,
      [ListenerProperty.emissions]: 0,
      [ListenerProperty.executions]: 0,
      [ListenerProperty.options]: defaults({}, options, <ListenerOptions<D, E, R>>{ isReplaying: false }),
    })

    if (self[EventProperty.emissions] > 0) {
      self[EventProperty.listeners].forEach((listener) => {
        if (!(listener[ListenerProperty.options].isReplaying ?? false)) return

        while (listener[ListenerProperty.emissions] < self[EventProperty.emissions]) {
          if (!events[event]) break

          if (
            listener[ListenerProperty.type] === ListenerType.on ||
            (listener[ListenerProperty.type] === ListenerType.once && listener[ListenerProperty.executions] === 0) ||
            (listener[ListenerProperty.type] === ListenerType.only &&
              listener[ListenerProperty.executions] === 0 &&
              self[EventProperty.listeners].reduce((sum, current) => sum + current[ListenerProperty.executions], 0) ===
                0)
          ) {
            const data = self[EventProperty.parameters][listener[ListenerProperty.emissions]]
            listener[ListenerProperty.emissions] += 1

            if (
              typeof listener[ListenerProperty.options].predicate === 'function' &&
              !listener[ListenerProperty.options].predicate(...data)
            ) {
              continue
            }

            try {
              listener[ListenerProperty.callback](...data)
            } catch (error) {
              console.error(`Error occurred in event callback for event "${String(event)}":`, error)
            }

            listener[ListenerProperty.executions] += 1
          } else break
        }
      })
    }
  }

  function emit<E extends keyof D>(event: E, ...parameters: Parameters<D[E]>) {
    if (typeof events[event] === 'undefined') _create(event)

    const self = events[event]
    if (!self) return

    if (Array.isArray(replayable) && replayable.includes(event)) {
      self[EventProperty.parameters].push(parameters)
    }

    self[EventProperty.emissions] += 1

    self[EventProperty.listeners].forEach((listener) => {
      if (!events[event]) return

      if (
        listener[ListenerProperty.type] === ListenerType.on ||
        (listener[ListenerProperty.type] === ListenerType.once && listener[ListenerProperty.executions] === 0) ||
        (listener[ListenerProperty.type] === ListenerType.only &&
          listener[ListenerProperty.executions] === 0 &&
          self[EventProperty.listeners].reduce((sum, current) => sum + current[ListenerProperty.executions], 0) === 0)
      ) {
        listener[ListenerProperty.emissions] += 1
        if (
          typeof listener[ListenerProperty.options].predicate === 'function' &&
          !listener[ListenerProperty.options].predicate(...parameters)
        )
          return

        try {
          listener[ListenerProperty.callback](...parameters)
        } catch (error) {
          console.error(`Error occurred in event callback for event "${String(event)}":`, error)
        }

        listener[ListenerProperty.executions] += 1
      }
    })
  }

  function on<E extends keyof D>(event: E, callback: ListenerCallback<D, E>, options?: ListenerOptions<D, E, R>) {
    _listen(ListenerType.on, event, callback, options)
  }

  function once<E extends keyof D>(event: E, callback: ListenerCallback<D, E>, options?: ListenerOptions<D, E, R>) {
    _listen(ListenerType.once, event, callback, options)
  }

  function only<E extends keyof D>(event: E, callback: ListenerCallback<D, E>, options?: ListenerOptions<D, E, R>) {
    _listen(ListenerType.only, event, callback, options)
  }

  function promise<E extends keyof D>(event: E, options?: PromiseOptions<D, E, R>): Promise<Parameters<D[E]>> {
    return new Promise((resolve, reject) => {
      const controller = new AbortController()
      const signal = any(controller.signal, options?.signal)

      const _options = merge({}, options, { signal })

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
              isReplaying: <ListenerOptions<D, typeof current, R>['isReplaying']>(
                (Array.isArray(replayable) && replayable.includes(current) ? _options.isReplaying : false)
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

  function remove<E extends keyof D>(event: E, callback: ListenerCallback<D, E>) {
    if (typeof events[event] === 'undefined') return

    const self = events[event]
    if (!self) return

    self[EventProperty.listeners] = self[EventProperty.listeners].filter(
      (listener) => listener[ListenerProperty.callback] !== callback
    )
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
    emit,
    on,
    once,
    only,
    promise,
    remove,
    destroy,
  }
}

export { EventProperty, ListenerProperty, ListenerType }
export type { Awayback, Definition, Events, Listener, ListenerCallback, ListenerOptions, PromiseOptions }

export default awayback
