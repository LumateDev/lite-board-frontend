<script setup lang="ts">
import type { TextBoxType } from '@/interfaces'
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps<Omit<TextBoxType, 'content'> & {
  modelValue: string
  scale: number
  panX: number
  panY: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:x', value: number): void
  (e: 'update:y', value: number): void
}>()

import { useDrawingStore } from '@/stores/useDrawingStore'
import {useThemeStore} from '@/stores/theme.ts'

const drawingStore = useDrawingStore()
const themeStore = useThemeStore()


const wrapperStyle = computed(() => ({
  position: 'absolute',
  transform: `translate(${props.panX + props.x * props.scale}px, ${props.panY + props.y * props.scale}px) scale(${props.scale})`,
  transformOrigin: 'top left',
  fontSize: `${props.fontSize}px`,
  padding: '4px 6px',
  minWidth: '80px',
  minHeight: '30px',
  background: 'transparent',
  color: 'var(--el-text-color-primary)',
  whiteSpace: 'pre-wrap',
  outline: 'none',
  border: isEditing.value
    ? (themeStore.isDark ? '1px solid white' : '1px solid black')
    : 'none',
  cursor: drawingStore.strokeType === 'select' ? 'move' : 'text',
}))

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLElement).innerText)
}

const isEditing = ref(false)

const handleMouseDown = (e: MouseEvent) => {
  if (drawingStore.strokeType !== 'select') return
  e.stopPropagation()
  e.preventDefault()

  startX = e.clientX
  startY = e.clientY
  initialX = props.x
  initialY = props.y
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// === Drag'n'drop ===
let startX = 0
let startY = 0
let initialX = 0
let initialY = 0

const onDrag = (e: MouseEvent) => {
  const dx = (e.clientX - startX) / props.scale
  const dy = (e.clientY - startY) / props.scale
  emit('update:x', initialX + dx)
  emit('update:y', initialY + dy)
}

const stopDrag = () => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div
    class="textbox"
    contenteditable="true"
    @input="handleInput"
    @focus="isEditing = true"
    @blur="isEditing = false"
    @mousedown="handleMouseDown"
    :style="wrapperStyle"
  >
    {{ modelValue }}
  </div>
</template>

<style scoped>
.textbox {
  user-select: text;

}
.textbox:focus {
  outline: none !important;
}
</style>
