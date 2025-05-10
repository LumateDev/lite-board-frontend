import type { Stroke } from '@/interfaces'
import { useDrawingStore } from '@/stores/useDrawingStore'

export function applyThemeColorCorrection(
  strokes: { value: Stroke[] },
  drawingStore: ReturnType<typeof useDrawingStore>,
  isDark: boolean
) {
  const current = drawingStore.color.toLowerCase()
  const from = isDark ? '#000000' : '#ffffff'
  const to = isDark ? '#ffffff' : '#000000'

  if (current === from) {
    drawingStore.setColor(to)
  }

  for (const stroke of strokes.value) {
    if (stroke.color.toLowerCase() === from) {
      stroke.color = to
    }
  }
}
