// 📁 src/websocket/ws-client.ts
import { useUserStore } from '@/stores/user.ts'
import { useDrawingStore } from '@/stores/useDrawingStore'
import { useRoute } from 'vue-router'
import type { User } from '@/interfaces'
let socket: WebSocket | null = null
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
let cursorThrottle: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5


export const useWebSocket = (options?: {
  onDraw?: (payload: any) => void
  onCursorMove?: (payload: { userId: string, x: number, y: number, email: string }) => void
  onUserJoin?: (payload: { userId: string, email: string }) => void
  onUserLeave?: (payload: { userId: string }) => void
  onUsersUpdate?: (users: User[]) => void
  onConnectionChange?: (status: 'connected' | 'connecting' | 'disconnected' | 'error') => void
}) => {
  const userStore = useUserStore()
  const drawingStore = useDrawingStore()
  const route = useRoute()

  const connect = () => {
    const boardId = route.params.id as string
    const token = userStore.token
    if (!boardId || !token) {
      console.warn('[WS] Missing boardId or token')
      options?.onConnectionChange?.('error')
      return
    }

    options?.onConnectionChange?.('connecting')
    const url = `ws://http://89.104.68.136:8080/canvas/ws/${boardId}?token=${token}`

    try {
      socket = new WebSocket(url)

      socket.onopen = () => {
        console.log('[WS] Connected successfully')
        reconnectAttempts = 0
        options?.onConnectionChange?.('connected')

        // Отправляем информацию о подключении
        send('user_join', {
          email: userStore.email,
          timestamp: Date.now()
        })
      }

      socket.onclose = (event) => {
        console.warn(`[WS] Disconnected. Code: ${event.code}, Reason: ${event.reason}`)
        options?.onConnectionChange?.('disconnected')

        // Пытаемся переподключиться только если это не намеренное закрытие
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000) // Exponential backoff
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)

          if (reconnectTimeout) clearTimeout(reconnectTimeout)
          reconnectTimeout = setTimeout(connect, delay)
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('[WS] Max reconnection attempts reached')
          options?.onConnectionChange?.('error')
        }
      }

      socket.onerror = (err) => {
        console.error('[WS] Connection error:', err)
        options?.onConnectionChange?.('error')
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
            case 'cursor_move':
              options?.onCursorMove?.(msg.payload)
              break
            case 'user_join':
              options?.onUserJoin?.(msg.payload)
              break
            case 'user_leave':
              options?.onUserLeave?.(msg.payload)
              break
            case 'users_update':
              options?.onUsersUpdate?.(msg.payload.users)
              break
            default:
              console.warn('[WS] Unknown message type:', msg.type)
          }
        } catch (err) {
          console.error('[WS] Invalid message format:', err)
        }
      }
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error)
      options?.onConnectionChange?.('error')
    }
  }

  const send = (type: string, payload: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn(`[WS] Cannot send message, socket not ready. State: ${socket?.readyState}`)
      return false
    }

    try {
      const message = {
        type,
        userId: userStore.email,
        boardId: route.params.id,
        payload,
        timestamp: Date.now()
      }
      socket.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error('[WS] Failed to send message:', error)
      return false
    }
  }

  // Отправка позиции курсора с троттлингом
  const sendCursorPosition = (x: number, y: number) => {
    if (cursorThrottle) return

    const success = send('cursor_move', {
      x,
      y,
      email: userStore.email
    })

    if (success) {
      // Троттлинг - отправляем не чаще чем раз в 50мс
      cursorThrottle = setTimeout(() => {
        cursorThrottle = null
      }, 50)
    }
  }

  // Отправка информации о активности пользователя
  const sendUserActivity = () => {
    send('user_activity', {
      email: userStore.email,
      timestamp: Date.now()
    })
  }

  const disconnect = () => {
    if (socket) {
      // Отправляем сообщение об отключении
      send('user_leave', {
        email: userStore.email
      })

      socket.close(1000, 'User disconnected') // Код 1000 = нормальное закрытие
      socket = null
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (cursorThrottle) {
      clearTimeout(cursorThrottle)
      cursorThrottle = null
    }

    reconnectAttempts = 0
    options?.onConnectionChange?.('disconnected')
  }

  const getConnectionStatus = (): 'connected' | 'connecting' | 'disconnected' | 'error' => {
    if (!socket) return 'disconnected'

    switch (socket.readyState) {
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return reconnectAttempts >= maxReconnectAttempts ? 'error' : 'disconnected'
      default:
        return 'error'
    }
  }

  return {
    connect,
    send,
    sendCursorPosition,
    sendUserActivity,
    disconnect,
    getConnectionStatus
  }
}
