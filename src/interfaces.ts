export interface Board {
  id: number
  name: string
  lastUpdated: string
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
