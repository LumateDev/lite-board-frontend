<template>
  <canvas ref="canvasRef" class="board-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDrawingStore } from '@/stores/useDrawingStore'

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  width: number
  type: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let currentStroke: Stroke | null = null

const strokes = ref<Stroke[]>([])
const undoneStrokes = ref<Stroke[]>([])

const GRID_SIZE = 20
const isDarkTheme = ref(false)

const drawingStore = useDrawingStore()

let themeObserver: MutationObserver | null = null

let isPanning = false
let lastPanX = 0
let lastPanY = 0

function getComputedStyleVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const thinLineColor = getComputedStyleVar('--el-border-color-lighter') || '#ccc'
  const boldLineColor = getComputedStyleVar('--el-border-color') || '#999'

  for (let x = 0; x < width; x += GRID_SIZE) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.strokeStyle = (x / GRID_SIZE) % 5 === 0 ? boldLineColor : thinLineColor
    ctx.lineWidth = (x / GRID_SIZE) % 5 === 0 ? 1.5 : 0.7
    ctx.stroke()
  }

  for (let y = 0; y < height; y += GRID_SIZE) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.strokeStyle = (y / GRID_SIZE) % 5 === 0 ? boldLineColor : thinLineColor
    ctx.lineWidth = (y / GRID_SIZE) % 5 === 0 ? 1.5 : 0.7
    ctx.stroke()
  }
}

function redraw() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = getComputedStyleVar('--el-bg-color') || '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (drawingStore.showGrid) {
    drawGrid(ctx, canvas.width, canvas.height)
  }

  ctx.save()
  ctx.translate(drawingStore.panX, drawingStore.panY)
  ctx.scale(drawingStore.scale, drawingStore.scale)

  for (const stroke of strokes.value) {
    if (stroke.points.length < 2) continue
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (const point of stroke.points.slice(1)) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.stroke()
  }

  ctx.restore()
}

function startDrawing(e: MouseEvent) {
  if (!ctx || drawingStore.strokeType === 'hand') return
  drawing = true

  const { x, y } = getCursorPosition(e)

  const strokeColor = drawingStore.eraser
    ? getComputedStyleVar('--el-bg-color') || '#ffffff'
    : drawingStore.color

  currentStroke = {
    points: [{ x, y }],
    color: strokeColor,
    width: drawingStore.lineWidth,
    type: drawingStore.strokeType,
  }
}

function draw(e: MouseEvent) {
  if (!ctx || !currentStroke || drawingStore.strokeType === 'hand') return

  const { x, y } = getCursorPosition(e)
  currentStroke.points.push({ x, y })

  currentStroke.color = drawingStore.eraser
    ? getComputedStyleVar('--el-bg-color') || '#ffffff'
    : drawingStore.color
  currentStroke.width = drawingStore.lineWidth

  redraw()
  drawCurrentStroke()
}

function drawCurrentStroke() {
  if (!ctx || !currentStroke || currentStroke.points.length < 2) return

  ctx.save()
  ctx.translate(drawingStore.panX, drawingStore.panY)
  ctx.scale(drawingStore.scale, drawingStore.scale)

  ctx.beginPath()
  ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y)
  for (const point of currentStroke.points.slice(1)) {
    ctx.lineTo(point.x, point.y)
  }
  ctx.strokeStyle = currentStroke.color
  ctx.lineWidth = currentStroke.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  ctx.restore()
}

function stopDrawing() {
  if (drawing && currentStroke) {
    strokes.value.push(currentStroke)
    undoneStrokes.value = []
    saveStrokes()
    currentStroke = null
  }
  drawing = false
  redraw()
}

function saveStrokes() {
  localStorage.setItem('board_strokes', JSON.stringify(strokes.value))
}

function loadStrokes() {
  const data = localStorage.getItem('board_strokes')
  if (data) {
    strokes.value = JSON.parse(data)
  }
}

function clearCanvas() {
  strokes.value = []
  undoneStrokes.value = []
  saveStrokes()
  redraw()
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  ctx = canvas.getContext('2d')
  redraw()
}

function getCursorPosition(e: MouseEvent) {
  const rect = canvasRef.value!.getBoundingClientRect()
  const offsetX = e.clientX - rect.left - drawingStore.panX
  const offsetY = e.clientY - rect.top - drawingStore.panY
  const x = offsetX / drawingStore.scale
  const y = offsetY / drawingStore.scale
  return { x, y }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const rect = canvasRef.value!.getBoundingClientRect()
  const cursorX = e.clientX - rect.left
  const cursorY = e.clientY - rect.top

  const scale = drawingStore.scale
  const direction = -Math.sign(e.deltaY)
  const factor = 0.1
  const newScale = Math.min(4, Math.max(0.1, scale + direction * factor))

  const worldX = (cursorX - drawingStore.panX) / scale
  const worldY = (cursorY - drawingStore.panY) / scale

  const newPanX = cursorX - worldX * newScale
  const newPanY = cursorY - worldY * newScale

  drawingStore.setScale(newScale)
  drawingStore.setPan(newPanX, newPanY)
}

function undo() {
  if (strokes.value.length > 0) {
    const last = strokes.value.pop()!
    undoneStrokes.value.push(last)
    saveStrokes()
    redraw()
  }
}

function redo() {
  if (undoneStrokes.value.length > 0) {
    const restored = undoneStrokes.value.pop()!
    strokes.value.push(restored)
    saveStrokes()
    redraw()
  }
}

// Автосмена цвета пера при переключении темы
function updatePenColorOnThemeChange(dark: boolean) {
  // 1. Меняем текущий карандаш
  const current = drawingStore.color.toLowerCase()
  if (dark && current === '#000000') {
    drawingStore.setColor('#ffffff')
  } else if (!dark && current === '#ffffff') {
    drawingStore.setColor('#000000')
  }

  // 2. Меняем уже нарисованные штрихи
  for (const stroke of strokes.value) {
    const color = stroke.color.toLowerCase()
    if (dark && color === '#000000') {
      stroke.color = '#ffffff'
    } else if (!dark && color === '#ffffff') {
      stroke.color = '#000000'
    }
  }
}

defineExpose({ clearCanvas })

onMounted(() => {
  resizeCanvas()
  drawingStore.registerClear(clearCanvas)
  drawingStore.registerUndo(undo)
  drawingStore.registerRedo(redo)
  loadStrokes()

  isDarkTheme.value = document.documentElement.classList.contains('dark')
  updatePenColorOnThemeChange(isDarkTheme.value)
  redraw()

  const canvas = canvasRef.value
  if (!canvas) return

  canvas.addEventListener('wheel', onWheel, { passive: false })

  // Обработка нажатия мыши
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      // ПКМ — временная "рука"
      e.preventDefault()
      drawingStore.setTempHand(true) // Подсветить кнопку "рука"
      isPanning = true
      lastPanX = e.clientX
      lastPanY = e.clientY
    } else if (drawingStore.strokeType === 'hand') {
      // Из тулбара — постоянная "рука"
      isPanning = true
      lastPanX = e.clientX
      lastPanY = e.clientY
    } else {
      // Любой другой инструмент
      startDrawing(e)
    }
  })

  // Движение мыши
  canvas.addEventListener('mousemove', (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanX
      const dy = e.clientY - lastPanY
      drawingStore.setPan(drawingStore.panX + dx, drawingStore.panY + dy)
      lastPanX = e.clientX
      lastPanY = e.clientY
      redraw()
    } else {
      draw(e)
    }
  })

  // Отпускание кнопок
  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      // Завершение временной "руки"
      e.preventDefault()
      drawingStore.setTempHand(false) // Снять подсветку "руки"
      isPanning = false
      return
    }

    isPanning = false
    stopDrawing()
  })

  // Уход курсора с холста
  canvas.addEventListener('mouseleave', () => {
    isPanning = false
    stopDrawing()
  })

  // Отключение контекстного меню
  canvas.addEventListener('contextmenu', (e) => e.preventDefault())

  window.addEventListener('resize', resizeCanvas)

  // 🎨 Автоинверсия при смене темы
  themeObserver = new MutationObserver(() => {
    const dark = document.documentElement.classList.contains('dark')
    isDarkTheme.value = dark
    updatePenColorOnThemeChange(dark)
    redraw()
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

watch(
  () => drawingStore.scale,
  () => {
    resizeCanvas()
  },
)

watch(
  () => drawingStore.showGrid,
  () => {
    redraw()
  },
)
</script>

<style scoped>
.board-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}
</style>
