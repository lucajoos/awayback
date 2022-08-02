import Callback from './Callback';

interface CustomEvent {
  callbacks: Callback[]
  fired: number
  did: number
  data: any[]
}

export default CustomEvent