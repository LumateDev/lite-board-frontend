// 📁 src/websocket/ws-client.ts
import { useUserStore } from '@/stores/user.ts'
import { useDrawingStore } from '@/stores/useDrawingStore'
import { useRoute } from 'vue-router'

let socket: WebSocket | null = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

export const useWebSocket = (options?: {
  onDraw?: (payload: any) => void
}) => {
  const userStore = useUserStore()
  const drawingStore = useDrawingStore()
  const route = useRoute()

  const connect = () => {
    const boardId = route.params.id as string
    const token = userStore.token
    if (!boardId || !token) return

    const url = `ws://localhost:8080/canvas/ws/${boardId}?token=${token}`
    socket = new WebSocket(url)

    socket.onopen = () => {
      console.log('[WS] Connected')
    }

    socket.onclose = () => {
      console.warn('[WS] Disconnected. Reconnecting...')
      reconnectTimeout = setTimeout(connect, 2000)
    }

    socket.onerror = err => {
      console.error('[WS] Error', err)
    }

    socket.onmessage = e => {
      try {
        const msg = JSON.parse(e.data)
        switch (msg.type) {
          case 'draw':
            options?.onDraw?.(msg.payload)
            break
          case 'insert_text':
            drawingStore.insertRemoteText(msg.payload)
            break
          case 'clear':
            drawingStore.triggerClear()
            break
          case 'undo':
            drawingStore.triggerUndo()
            break
          case 'redo':
            drawingStore.triggerRedo()
            break
          default:
            console.warn('[WS] Unknown type:', msg.type)
        }
      } catch (err) {
        console.error('[WS] Invalid message', err)
      }
    }
  }

  const send = (type: string, payload: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    const message = {
      type,
      userId: userStore.email,
      boardId: route.params.id,
      payload,
    }
    socket.send(JSON.stringify(message))
  }

  return {
    connect,
    send,
  }
}
