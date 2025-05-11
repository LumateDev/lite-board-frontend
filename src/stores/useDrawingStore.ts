import { defineStore } from 'pinia'
import type { HistoryItem } from '@/interfaces'

export const useDrawingStore = defineStore('drawing', {
  state: () => ({
    strokeType: 'dash',
    color: '#000000',
    lineWidth: 5,
    eraser: false,

    scale: 1.0,
    panX: 0,
    panY: 0,

    showGrid: true,
    isTempHandActive: false,

    // История действий
    undoStack: [] as HistoryItem[],
    redoStack: [] as HistoryItem[],

    // Колбэки
    clearCallback: null as (() => void) | null,
    undoCallback: null as (() => void) | null,
    redoCallback: null as (() => void) | null,
    saveCallback: null as (() => void) | null,
    exportCallback: null as (() => void) | null,
  }),

  actions: {
    // Настройки рисования
    setStrokeType(type: string) {
      this.strokeType = type
      this.eraser = false
    },
    setColor(color: string) {
      this.color = color
    },
    setLineWidth(width: number) {
      this.lineWidth = width
    },
    toggleEraser() {
      this.eraser = !this.eraser
    },

    // Панорамирование и масштаб
    setScale(value: number) {
      this.scale = Math.min(Math.max(value, 0.1), 4.0)
    },
    setPan(x: number, y: number) {
      this.panX = x
      this.panY = y
    },
    resetPan() {
      this.panX = 0
      this.panY = 0
    },

    setTempHand(active: boolean) {
      this.isTempHandActive = active
    },

    toggleGrid() {
      this.showGrid = !this.showGrid
    },

    reset() {
      this.strokeType = 'dash'
      this.color = '#000000'
      this.lineWidth = 5
      this.eraser = false
      this.scale = 1.0
      this.panX = 0
      this.panY = 0
      this.showGrid = true
      this.isTempHandActive = false
    },

    // === История действий ===
    addAction(action: HistoryItem) {
      this.undoStack.push(action)
      this.redoStack = [] // сбрасываем redo после нового действия
    },

    undo() {
      const action = this.undoStack.pop()
      if (action) {
        action.undo()
        this.redoStack.push(action)
      }
    },

    redo() {
      const action = this.redoStack.pop()
      if (action) {
        action.redo()
        this.undoStack.push(action)
      }
    },

    clearHistory() {
      this.undoStack = []
      this.redoStack = []
    },

    // Колбэки
    registerClear(fn: () => void) {
      this.clearCallback = fn
    },
    triggerClear() {
      this.clearCallback?.()
    },

    triggerUndo() {
      this.undo()
      this.undoCallback?.()
    },

    triggerRedo() {
      this.redo()
      this.redoCallback?.()
    },

    registerSave(fn: () => void) {
      this.saveCallback = fn
    },
    triggerSave() {
      this.saveCallback?.()
    },

    registerExport(fn: () => void) {
      this.exportCallback = fn
    },
    triggerExport() {
      this.exportCallback?.()
    },
  },
})
