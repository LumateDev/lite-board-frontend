export interface Board {
  id: string
  title: string
  owner_id: string
  created_at: string
  is_public: boolean
  lastUpdated?: string // Для обратной совместимости
}

export interface Point {
  x: number
  y: number
}

export interface Stroke {
  points: Point[]
  color: string
  width: number
  type: string
}

export interface HistoryItem {
  type: string
  undo: () => void
  redo: () => void
}

export interface TextBoxType {
  id: string
  x: number
  y: number
  content: string
  fontSize: number
  selected: boolean
}

export interface Team {
  id: string
  name: string
  members: TeamMember[]
  createdAt: Date
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'member' | 'admin'
  joinedAt: Date
}

export interface User {
  id: string
  email: string
  isActive: boolean
  lastActivity: Date
  cursorPosition?: { x: number, y: number }
}

export interface ConnectionStatus {
  activeUsers: User[]
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  currentUserEmail: string
}

export interface RemoteCursor {
  userId: string
  userName: string
  x: number
  y: number
  color: string
  isVisible: boolean
  lastUpdate: Date
}
