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

const onceupon = (object: any): Response => {
  const response: any = {
    events: {},

    fire: (event: string, ...data: any) => {
      event.split('|').forEach(currentEvent => {
        if (response.events[currentEvent] === undefined) {
          response.create(currentEvent)
        }

        if (typeof data !== 'undefined') {
          if (data.length === 1) {
            data = data[0]
          }

          response.events[currentEvent].data.push(data)
        }

        response.events[currentEvent].fired++

        response.events[currentEvent].callbacks.forEach((callback: Callback) => {
          if ((callback.type === 0 && callback.fired === 0) || callback.type === 1 || (callback.type === 2 && callback.fired === 0 && response.events[currentEvent].did === 0)) {
            callback.fired++
            response.events[currentEvent].did = response.events[currentEvent].did + 1
            callback.do(typeof data !== 'undefined' ? data : null, currentEvent)
          }
        })
      })
    },

    create: (event: string) => {
      response.events[event] = {
        callbacks: new Proxy([], {
          set: (target, key, value) => {
            // @ts-expect-error
            target[key] = value

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

    once: (event: string, callback: ListenerCallback, options: ListenerOptions) => {
      event.split('|').forEach(currentEvent => {
        currentEvent = currentEvent.trim()

        if (response.events[currentEvent] === undefined) {
          response.create(currentEvent)
        }

        response.events[currentEvent].callbacks.push({
          do: callback,
          type: 0,
          fired: 0,
          options
        })
      })
    },

    on: (event: string, callback: ListenerCallback, options: ListenerOptions) => {
      event.split('|').forEach(currentEvent => {
        currentEvent = currentEvent.trim()

        if (response.events[currentEvent] === undefined) {
          response.create(currentEvent)
        }

        response.events[currentEvent].callbacks.push({
          do: callback,
          type: 1,
          fired: 0,
          options
        })
      })
    },

    only: (event: string, callback: ListenerCallback, options: ListenerOptions) => {
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
            options
          })
        }
      })
    },

    isFired: (event: string) => {
      return event?.length > 0 ? (typeof response.events[event] === 'object' ? response.events[event].fired > 0 : false) : false
    }
  }

  return typeof object === 'object' ? Object.assign(object, response) : response
}

export default onceupon