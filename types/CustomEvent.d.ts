import Callback from './Callback';

interface Event {
  callbacks: Callback[]
  fired: number
  did: number
  data: any[]
}

export default Event