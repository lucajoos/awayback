import ListenerCallback from './ListenerCallback'
import ListenerOptions from './ListenerOptions'

interface Callback {
  do: ListenerCallback
  type: number
  fired: number
  options: ListenerOptions
}

export default Callback
