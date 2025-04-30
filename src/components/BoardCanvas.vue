<template>
  <canvas ref="canvasRef" class="board-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDrawingStore } from '@/stores/useDrawingStore'
import type { Stroke } from '@/interfaces.ts'



const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let currentStroke: Stroke | null = null
const erasedStrokes = ref<Stroke[]>([])


const strokes = ref<Stroke[]>([])
const redoErasedStrokes = ref<Stroke[]>([])
const undoneStrokes = ref<Stroke[]>([])
//TODO : Вынести в настройки для микрочела
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

  const baseGridSize = GRID_SIZE // логический размер, напр. 100
  const minPixelSpacing = 20 // минимальный размер сетки на экране

  // адаптивный масштаб: чем меньше зум, тем реже сетка
  let step = baseGridSize
  while (step * drawingStore.scale < minPixelSpacing) {
    step *= 2 // делаем сетку реже
  }

  ctx.save()
  ctx.translate(drawingStore.panX, drawingStore.panY)
  ctx.scale(drawingStore.scale, drawingStore.scale)

  const logicalWidth = width / drawingStore.scale
  const logicalHeight = height / drawingStore.scale

  const startX = Math.floor(-drawingStore.panX / drawingStore.scale / step) * step
  const startY = Math.floor(-drawingStore.panY / drawingStore.scale / step) * step

  const endX = startX + logicalWidth + step
  const endY = startY + logicalHeight + step

  for (let x = startX; x < endX; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, endY)
    ctx.strokeStyle = (x / step) % 5 === 0 ? boldLineColor : thinLineColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let y = startY; y < endY; y += step) {
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(endX, y)
    ctx.strokeStyle = (y / step) % 5 === 0 ? boldLineColor : thinLineColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  ctx.restore()
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
    const points = stroke.points
    if (points.length === 0) continue

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = stroke.color
    ctx.fillStyle = stroke.color
    ctx.lineWidth = stroke.width

    if (points.length === 1) {
      const p = points[0]
      ctx.beginPath()
      ctx.arc(p.x, p.y, stroke.width / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()
    }
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
  const { x, y } = getCursorPosition(e)

  if (drawingStore.eraser) {
    if (drawing) {
      eraseAt(x, y)
    }
    return
  }

  if (!ctx || !currentStroke || drawingStore.strokeType === 'hand') return

  currentStroke.points.push({ x, y })
  currentStroke.color = drawingStore.color
  currentStroke.width = drawingStore.lineWidth

  if (currentStroke.points.length > 1) {
    redraw()
    drawCurrentStroke()
  }
}


function drawCurrentStroke() {
  if (!ctx || !currentStroke || currentStroke.points.length === 0) return

  ctx.save()
  ctx.translate(drawingStore.panX, drawingStore.panY)
  ctx.scale(drawingStore.scale, drawingStore.scale)

  const points = currentStroke.points
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = currentStroke.color
  ctx.fillStyle = currentStroke.color
  ctx.lineWidth = currentStroke.width

  if (points.length === 1) {
    const p = points[0]
    ctx.beginPath()
    ctx.arc(p.x, p.y, currentStroke.width / 2, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
  }

  ctx.restore()
}


function stopDrawing() {
  if (drawingStore.eraser) {
    drawing = false
    return
  }

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

function eraseAt(x: number, y: number) {
  const threshold = drawingStore.lineWidth / drawingStore.scale

  for (let i = strokes.value.length - 1; i >= 0; i--) {
    const stroke = strokes.value[i]
    for (const p of stroke.points) {
      const dx = p.x - x
      const dy = p.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= threshold) {
        const removed = strokes.value.splice(i, 1)[0]
        erasedStrokes.value.push(removed)
        undoneStrokes.value = [] // сброс redo
        saveStrokes()
        redraw()
        return
      }
    }
  }
}


function undo() {
  if (erasedStrokes.value.length > 0) {
    const restored = erasedStrokes.value.pop()!
    redoErasedStrokes.value.push(restored)
    strokes.value.push(restored)
    saveStrokes()
    redraw()
    return
  }

  if (strokes.value.length > 0) {
    const last = strokes.value.pop()!
    undoneStrokes.value.push(last)
    saveStrokes()
    redraw()
  }
}

function redo() {
  if (redoErasedStrokes.value.length > 0) {
    const reErased = redoErasedStrokes.value.pop()!
    strokes.value = strokes.value.filter(s => s !== reErased)
    erasedStrokes.value.push(reErased)
    saveStrokes()
    redraw()
    return
  }

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
      drawingStore.setTempHand(true)
      isPanning = true
      lastPanX = e.clientX
      lastPanY = e.clientY
    } else if (drawingStore.strokeType === 'hand') {
      isPanning = true
      lastPanX = e.clientX
      lastPanY = e.clientY
    } else {
      // ЛКМ — любой другой инструмент, включая ластик
      drawing = true
      if (!drawingStore.eraser) {
        startDrawing(e)
      }
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
    } else if (drawingStore.eraser && drawing) {
      const { x, y } = getCursorPosition(e)
      eraseAt(x, y)
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

  // Автоинверсия при смене темы
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
