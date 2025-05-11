import { onMounted, onUnmounted } from 'vue'
import { useDrawingStore } from '@/stores/useDrawingStore'

export function useHotkeys(drawingStore: ReturnType<typeof useDrawingStore>) {
  function handleKeydown(e: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().includes('MAC')
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey

    if (ctrlOrCmd && e.code === 'KeyZ' && !e.shiftKey) {
      e.preventDefault()
      drawingStore.triggerUndo()
    }

    if ((ctrlOrCmd && e.code === 'KeyZ' && e.shiftKey) || (ctrlOrCmd && e.code === 'KeyY')) {
      e.preventDefault()
      drawingStore.triggerRedo()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
