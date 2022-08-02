/**
 * @license
 * onceupon.js
 * Released under MIT license
 * Copyright Luca Joos
 */
import ListenerCallback from './types/ListenerCallback'
import ListenerOptions from './types/ListenerOptions'
import Response from './types/Response'
import Callback from './types/Callback'

const onceupon = (object?: any): Response => {
  const response: Response = {
    events: {},

    fire: (event: string, ...data: any) => {
      event.split('|').forEach(current => {
        if (response.events[current] === undefined) {
          response.create(current)
        }

        if (typeof data !== 'undefined') {
          if (data.length === 1) {
            data = data[0]
          }

          response.events[current].data.push(data)
        }

        response.events[current].fired++;

        response.events[current].callbacks.forEach((callback: Callback) => {
          if ((callback.type === 0 && callback.fired === 0) || callback.type === 1 || (callback.type === 2 && callback.fired === 0 && response.events[current].did === 0)) {
            callback.fired++
            response.events[current].did = response.events[current].did + 1
            callback.do(typeof data !== 'undefined' ? data : null, current)
          }
        })
      })
    },

    create: (event: string) => {
      response.events[event] = {
        callbacks: new Proxy([] as Callback[], {
          set: (target, property, value) => {
            // @ts-ignore
            target[property] = value

            if (response.events[event].fired > 0) {
              response.events[event].callbacks.forEach((callback: Callback) => {
                let exit = false

                while (callback.fired !== response.events[event].fired && !exit && !callback.options.isIgnoringPrevious) {
                  if ((callback.type === 0 && callback.fired === 0) || callback.type === 1 || (callback.type === 2 && callback.fired === 0 && response.events[event].did === 0)) {
                    callback.fired++
                    response.events[event].did = response.events[event].did + 1
                    callback.do(response.events[event].data[callback.fired - 1] || null, event)
                  } else {
                    exit = true
                  }
                }
              })
            }

            return true
          }
        }),

        fired: 0,
        did: 0,
        data: []
      }
    },

    once: (event: string, callback: ListenerCallback, options?: ListenerOptions) => {
      event.split('|').forEach(currentEvent => {
        currentEvent = currentEvent.trim()

        if (response.events[currentEvent] === undefined) {
          response.create(currentEvent)
        }

        response.events[currentEvent].callbacks.push({
          do: callback,
          type: 0,
          fired: 0,
          options: options || {}
        })
      })
    },

    on: (event: string, callback: ListenerCallback, options?: ListenerOptions) => {
      event.split('|').forEach(currentEvent => {
        currentEvent = currentEvent.trim()

        if (response.events[currentEvent] === undefined) {
          response.create(currentEvent)
        }

        response.events[currentEvent].callbacks.push({
          do: callback,
          type: 1,
          fired: 0,
          options: options || {}
        })
      })
    },

    only: (event: string, callback: ListenerCallback, options?: ListenerOptions) => {
      event.split('|').forEach(currentEvent => {
        currentEvent = currentEvent.trim()

        if (response.events[currentEvent] === undefined) {
          response.create(currentEvent)
        }

        if (response.events[currentEvent].callbacks.length === 0) {
          response.events[currentEvent].callbacks.push({
            do: callback,
            type: 2,
            fired: 0,
            options: options || {}
          })
        }
      })
    },

    isFired: (event: string): boolean => {
      return event?.length > 0 ? (typeof response.events[event] === 'object' ? response.events[event].fired > 0 : false) : false
    }
  }

  return typeof object === 'object' ? Object.assign(object, response) : response
}

export default onceupon