import ListenerCallback from './ListenerCallback'
import ListenerOptions from './ListenerOptions'
import EventsObject from './EventsObject'

interface Response {
  fire: (event: string, ...data: any) => void
  create: (event: string) => void
  once: (event: string, callback: ListenerCallback, options: ListenerOptions) => void
  on: (event: string, callback: ListenerCallback, options: ListenerOptions) => void
  only: (event: string, callback: ListenerCallback, options: ListenerOptions) => void
}

export default Response
