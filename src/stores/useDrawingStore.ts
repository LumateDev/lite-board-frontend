import { defineStore } from 'pinia'

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

    clearCallback: null as (() => void) | null,
    undoCallback: null as (() => void) | null,
    redoCallback: null as (() => void) | null,
    saveCallback: null as (() => void) | null,
    exportCallback: null as (() => void) | null,
  }),

  actions: {
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

    registerClear(fn: () => void) {
      this.clearCallback = fn
    },
    triggerClear() {
      this.clearCallback?.()
    },

    registerUndo(fn: () => void) {
      this.undoCallback = fn
    },
    triggerUndo() {
      this.undoCallback?.()
    },

    registerRedo(fn: () => void) {
      this.redoCallback = fn
    },
    triggerRedo() {
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
