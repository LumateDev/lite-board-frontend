import axios from 'axios'

export async function recogniseEvents(events: never[]) {
  const response = await axios.post('http://89.104.68.136:8080/canvas/recognise', events)
  return response.data
}
