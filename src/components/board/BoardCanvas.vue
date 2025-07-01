<template>
  <div class="board-canvas-wrapper" v-bind="$attrs">
    <canvas ref="canvasRef" class="board-canvas" :style="canvasCursorStyle" />
    <TextBox
      v-for="text in texts"
      :key="text.id"
      v-model="text.content"
      :id="text.id"
      :x="text.x"
      :y="text.y"
      :fontSize="text.fontSize"
      :scale="drawingStore.scale"
      :panX="drawingStore.panX"
      :panY="drawingStore.panY"
      :selected="text.selected"
      @update:x="(val) => text.x = val"
      @update:y="(val) => text.y = val"
    />
    <!-- Курсоры других пользователей -->
    <UserCursor
      v-for="cursor in remoteCursors"
      :key="cursor.userId"
      :x="cursor.x"
      :y="cursor.y"
      :user-name="cursor.userName"
      :user-color="cursor.color"
      :pan-x="drawingStore.panX"
      :pan-y="drawingStore.panY"
      :scale="drawingStore.scale"
      :is-visible="cursor.isVisible"
    />
    <!-- Панель активных пользователей -->
    <ActiveUsersPanel
      :active-users="activeUsers"
      :connection-status="connectionStatus"
      :current-user-email="currentUserEmail"
    />

  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useDrawingStore } from '@/stores/useDrawingStore.ts'
import { applyThemeColorCorrection } from '@/utils/colorChanger.ts'
import type { Stroke, TextBoxType, User, RemoteCursor } from '@/interfaces.ts'
import { drawGrid } from '@/utils/grid.ts'
import { useHotkeys } from '@/components/board/useHotkeys.ts'
import { useCursorStyle } from '@/components/board/useCursorStyle.ts'
import TextBox from './TextBox.vue'
import { useWebSocket } from '@/api/ws-client.ts'
import UserCursor from './UserCursor.vue'
import ActiveUsersPanel from './ActiveUsersPanel.vue'
import { useUserStore } from '@/stores/user.ts'


const { connect, send, sendCursorPosition, sendUserActivity, disconnect, getConnectionStatus } = useWebSocket({
  onDraw: addRemoteStroke,
  onCursorMove: handleRemoteCursorMove,
  onUserJoin: handleUserJoin,
  onUserLeave: handleUserLeave,
  onUsersUpdate: handleUsersUpdate,
  onConnectionChange: (status) => {
    connectionStatus.value = status
  }
})


const canvasRef = ref<HTMLCanvasElement | null>(null)
const texts  = computed(() => drawingStore.texts)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let currentStroke: Stroke | null = null
const strokes = ref<Stroke[]>([])
const selectionStart = ref<{ x: number; y: number } | null>(null)
const selectionRect = ref<DOMRect | null>(null)
const selectedStrokes = ref<Stroke[]>([])
let moveBefore: Stroke[] | null = null
const isDarkTheme = ref(false)
const drawingStore = useDrawingStore()

const userStore = useUserStore()

// Состояние участников и курсоров
const activeUsers = ref<User[]>([])
const remoteCursors = ref<RemoteCursor[]>([])
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected')
const currentUserEmail = computed(() => userStore.email || '')

// Таймеры для отслеживания активности
let activityTimer: ReturnType<typeof setTimeout> | null = null

let lastCursorSent = 0


let themeObserver: MutationObserver | null = null
const selectedTextBoxes = ref<TextBoxType[]>([])
let moveBeforeTextBoxes: TextBoxType[] | null = null



useHotkeys(drawingStore);
const canvasCursorStyle = useCursorStyle()



let isPanning = false
let lastPanX = 0
let lastPanY = 0
let isDraggingSelection = false
let lastDragX = 0
let lastDragY = 0

function addRemoteStroke(payload: { points: Array<{x: number, y: number}>, color: string, thickness: number }) {
  const stroke = {
    id: Date.now().toString(),
    points: payload.points,
    color: payload.color,
    width: payload.thickness,
    type: 'pen',
  }
  strokes.value.push(stroke)
  redraw()
}

function handleRemoteCursorMove(payload: { userId: string, x: number, y: number, email: string }) {
  if (payload.email === currentUserEmail.value) return

  const existingCursor = remoteCursors.value.find(c => c.userId === payload.userId)
  const userColor = getUserColor(payload.email)

  if (existingCursor) {
    existingCursor.x = payload.x
    existingCursor.y = payload.y
    existingCursor.isVisible = true
    existingCursor.lastUpdate = new Date()
  } else {
    remoteCursors.value.push({
      userId: payload.userId,
      userName: payload.email.split('@')[0],
      x: payload.x,
      y: payload.y,
      color: userColor,
      isVisible: true,
      lastUpdate: new Date()
    })
  }

  // Обновляем данные пользователя в списке активных
  updateUserFromCursor(payload)
}
// Обновление данных пользователя на основе движения курсора
function updateUserFromCursor(payload: { userId: string, x: number, y: number, email: string }) {
  let user = activeUsers.value.find(u => u.id === payload.userId)

  if (!user) {
    // Добавляем нового пользователя
    activeUsers.value.push({
      id: payload.userId,
      email: payload.email,
      isActive: true,
      lastActivity: new Date(),
      cursorPosition: { x: payload.x, y: payload.y }
    })
  } else {
    // Обновляем существующего
    user.isActive = true
    user.lastActivity = new Date()
    user.cursorPosition = { x: payload.x, y: payload.y }
  }
}

// Добавляем текущего пользователя в список при подключении
function addCurrentUserToList() {
  const currentEmail = currentUserEmail.value
  if (!currentEmail) return

  const existingUser = activeUsers.value.find(u => u.email === currentEmail)
  if (!existingUser) {
    activeUsers.value.push({
      id: 'current-user',
      email: currentEmail,
      isActive: true,
      lastActivity: new Date()
    })
  }
}

function handleUserJoin(payload: { userId: string, email: string }) {
  const existingUser = activeUsers.value.find(u => u.id === payload.userId)
  if (!existingUser) {
    activeUsers.value.push({
      id: payload.userId,
      email: payload.email,
      isActive: true,
      lastActivity: new Date()
    })
  } else {
    existingUser.isActive = true
    existingUser.lastActivity = new Date()
  }
}
function handleUserLeave(payload: { userId: string }) {
  activeUsers.value = activeUsers.value.filter(u => u.id !== payload.userId)
  remoteCursors.value = remoteCursors.value.filter(c => c.userId !== payload.userId)
}

function handleUsersUpdate(users: User[]) {
  activeUsers.value = users
}

// Генерация цвета для пользователя
function getUserColor(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

function getComputedStyleVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function redraw() {
  console.log('redraw')
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = getComputedStyleVar('--el-bg-color') || '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (drawingStore.showGrid) {
    drawGrid(
      ctx,
      canvas.width,
      canvas.height,
      drawingStore.scale,
      drawingStore.panX,
      drawingStore.panY,
      20,
      getComputedStyleVar('--el-border-color-lighter') || '#ccc',
      getComputedStyleVar('--el-border-color') || '#999'
    )
  }

  // Подготовка трансформации
  ctx.save()
  ctx.translate(drawingStore.panX, drawingStore.panY)
  ctx.scale(drawingStore.scale, drawingStore.scale)

  // Отрисовка всех штрихов
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

  // Обводка выделенных штрихов
  for (const stroke of selectedStrokes.value) {
    const points = stroke.points
    if (points.length === 0) continue

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(0, 122, 255, 0.6)'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
  }

  ctx.restore()

  // Рамка выделения (в абсолютных координатах экрана)
  drawSelectionBox(ctx)
}


function startDrawing(e: MouseEvent) {
  if (!ctx || drawingStore.strokeType === 'hand') return
  drawing = true
  console.log('startDrawing')

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
    const strokeCopy = { ...currentStroke, points: currentStroke.points.map(p => ({ ...p })) }
    strokes.value.push(strokeCopy)
    send('draw', {
      points: strokeCopy.points,
      color: strokeCopy.color,
      thickness: strokeCopy.width

    })

    drawingStore.addAction({
      type: 'draw',
      undo: () => {
        strokes.value.pop()
        redraw()
      },
      redo: () => {
        strokes.value.push(strokeCopy)
        redraw()
      },
    })

    saveBoard();
    currentStroke = null
  }

  drawing = false
  redraw()

}



function saveBoard() {

  // localStorage.setItem('board_strokes', JSON.stringify(strokes.value))
  // localStorage.setItem('board_texts', JSON.stringify(drawingStore.texts))
}

function loadBoard() {
  const data = localStorage.getItem('board_strokes')
  if (data) {
    strokes.value = JSON.parse(data)
  }

  const savedTexts = localStorage.getItem('board_texts')
  if (savedTexts) {
    drawingStore.setTexts(JSON.parse(savedTexts))
  }
}


function clearCanvas() {
  const beforeStrokes = strokes.value.map(s => ({
    ...s,
    points: s.points.map(p => ({ ...p })),
  }))
  const beforeTexts = drawingStore.texts.map(t => ({ ...t }))

  strokes.value = []
  drawingStore.setTexts([])

  drawingStore.addAction({
    type: 'clearAll',
    undo: () => {
      strokes.value = beforeStrokes.map(s => ({
        ...s,
        points: s.points.map(p => ({ ...p })),
      }))
      drawingStore.setTexts(beforeTexts.map(t => ({ ...t })))
      redraw()
    },
    redo: () => {
      strokes.value = []
      drawingStore.setTexts([])
      redraw()
    },
  })

  saveBoard()
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

function getStrokeBoundingBox(stroke: Stroke) {
  const xs = stroke.points.map(p => p.x)
  const ys = stroke.points.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
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

        drawingStore.addAction({
          type: 'erase',
          undo: () => {
            strokes.value.splice(i, 0, removed)
            redraw()
          },
          redo: () => {
            strokes.value = strokes.value.filter(s => s !== removed)
            redraw()
          },
        })

        saveBoard();
        redraw()
        return
      }
    }
  }
}




function drawSelectionBox(ctx: CanvasRenderingContext2D) {
  if (!selectionRect.value) return

  const { x, y, width, height } = selectionRect.value

  ctx.save()
  ctx.translate(drawingStore.panX, drawingStore.panY)
  ctx.scale(drawingStore.scale, drawingStore.scale)

  ctx.strokeStyle = 'rgba(0, 122, 255, 0.8)'
  ctx.lineWidth = 1 / drawingStore.scale // адаптация толщины к зуму
  ctx.setLineDash([5, 5])
  ctx.strokeRect(x, y, width, height)

  ctx.restore()
}


function updateSelectionBox(currentX: number, currentY: number) {
  if (!selectionStart.value) return

  const x1 = selectionStart.value.x
  const y1 = selectionStart.value.y
  const x2 = currentX
  const y2 = currentY

  const x = Math.min(x1, x2)
  const y = Math.min(y1, y2)
  const width = Math.abs(x1 - x2)
  const height = Math.abs(y1 - y2)

  selectionRect.value = new DOMRect(x, y, width, height)
}

onMounted(() => {
  try {
    connect()
    console.log('WebSocket connected successfully')

    // Добавляем текущего пользователя в список
    addCurrentUserToList()
  } catch (error) {
    console.error('Failed to connect to WebSocket:', error)
    connectionStatus.value = 'error'

    // Добавляем текущего пользователя даже при ошибке соединения
    addCurrentUserToList()
  }
  setInterval(() => {
    connectionStatus.value = getConnectionStatus()
  }, 1000)
  resizeCanvas()
  drawingStore.registerClear(clearCanvas)

  loadBoard();

  isDarkTheme.value = document.documentElement.classList.contains('dark')
  applyThemeColorCorrection(strokes, drawingStore, isDarkTheme.value)
  redraw()

  const canvas = canvasRef.value
  if (!canvas) return

  canvas.addEventListener('wheel', onWheel, { passive: false })

  canvas.addEventListener('mousedown', (e) => {
    const { x, y } = getCursorPosition(e)

    if (drawingStore.activeTool === 'text' && e.button === 0) {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - drawingStore.panX) / drawingStore.scale
      const y = (e.clientY - rect.top - drawingStore.panY) / drawingStore.scale

      const id = Date.now().toString()
      drawingStore.addTextBox({
        id,
        x,
        y,
        content: 'Enter text...',
        fontSize: 18,
        selected: false,
      })

      saveBoard()


      drawingStore.setActiveTool('select')
      return
    }


    if (drawingStore.strokeType === 'select' && e.button === 0) {
      const hitStroke = selectedStrokes.value.some(stroke => {
        const box = getStrokeBoundingBox(stroke)
        return (
          x >= box.x &&
          x <= box.x + box.width &&
          y >= box.y &&
          y <= box.y + box.height
        )
      })

      const hitTextBox = selectedTextBoxes.value.some(text => {
        const textX = text.x
        const textY = text.y
        const width = 100 // ширина TextBox по умолчанию
        const height = 30 // высота TextBox по умолчанию
        return (
          x >= textX &&
          x <= textX + width &&
          y >= textY &&
          y <= textY + height
        )
      })

      const hit = hitStroke || hitTextBox

      if (hit) {
        isDraggingSelection = true
        lastDragX = x
        lastDragY = y

        moveBefore = selectedStrokes.value.map(s => ({
          ...s,
          points: s.points.map(p => ({ ...p })),
        }))

        moveBeforeTextBoxes = selectedTextBoxes.value.map(t => ({ ...t }))
        return
      }

      // Ничего не выбрано → начинаем новое выделение
      selectedStrokes.value = []
      selectedTextBoxes.value = []
      selectionStart.value = { x, y }
      selectionRect.value = null
      redraw()
      return
    }


    if (e.button === 2) {
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
      drawing = true
      if (!drawingStore.eraser) {
        startDrawing(e)
      }
    }
  })



  // 🖱 Движение мыши
  canvas.addEventListener('mousemove', (e) => {

    // Отправка позиции курсора
    const now = Date.now()
    if (now - lastCursorSent > 50) { // Троттлинг
      const { x, y } = getCursorPosition(e)
      sendCursorPosition(x, y)
      lastCursorSent = now
    }

    if (drawingStore.strokeType === 'select' && isDraggingSelection) {
      const { x, y } = getCursorPosition(e)
      const dx = x - lastDragX
      const dy = y - lastDragY

      for (const stroke of selectedStrokes.value) {
        for (const point of stroke.points) {
          point.x += dx
          point.y += dy
        }
      }

      for (const box of selectedTextBoxes.value) {
        box.x += dx
        box.y += dy
      }

      lastDragX = x
      lastDragY = y
      redraw()
      return
    }


    if (
      drawingStore.strokeType === 'select' &&
      selectionStart.value &&
      (e.buttons & 1) // проверка: ЛКМ всё ещё зажата
    ) {
      const { x, y } = getCursorPosition(e)
      updateSelectionBox(x, y)
      redraw()
      return
    }


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



  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      e.preventDefault()
      drawingStore.setTempHand(false)
      isPanning = false
      return
    }

    if (drawingStore.strokeType === 'select' && isDraggingSelection) {
      isDraggingSelection = false

      const before = moveBefore
      const after = selectedStrokes.value.map(s => ({
        ...s,
        points: s.points.map(p => ({ ...p })),
      }))

      if (before) {
        drawingStore.addAction({
          type: 'move',
          undo: () => {
            selectedStrokes.value.forEach((s, idx) => {
              s.points = before[idx].points.map(p => ({ ...p }))
            })
            redraw()
          },
          redo: () => {
            selectedStrokes.value.forEach((s, idx) => {
              s.points = after[idx].points.map(p => ({ ...p }))
            })
            redraw()
          },
        })
      }
      const beforeText = moveBeforeTextBoxes?.map(t => ({ ...t })) || []
      const afterText = selectedTextBoxes.value.map(t => ({ ...t }))

      if (beforeText.length > 0) {
        drawingStore.addAction({
          type: 'moveText',
          undo: () => {
            selectedTextBoxes.value.forEach((box, i) => {
              Object.assign(box, beforeText[i])
            })
            saveBoard()
          },
          redo: () => {
            selectedTextBoxes.value.forEach((box, i) => {
              Object.assign(box, afterText[i])
            })
            saveBoard()
          },
        })
      }


      moveBefore = null
      saveBoard();
      redraw()
      return
    }

    if (drawingStore.strokeType === 'select' && selectionRect.value) {
      const rect = selectionRect.value

      selectedStrokes.value = strokes.value.filter((stroke) =>
        stroke.points.some((p) =>
          p.x >= rect.x &&
          p.x <= rect.x + rect.width &&
          p.y >= rect.y &&
          p.y <= rect.y + rect.height
        )
      )

      selectedTextBoxes.value = drawingStore.texts.filter((text) => {
        const width = 100
        const height = 30
        return (
          text.x + width >= rect.x &&
          text.x <= rect.x + rect.width &&
          text.y + height >= rect.y &&
          text.y <= rect.y + rect.height
        )
      })

      selectionStart.value = null
      selectionRect.value = null
      saveBoard()
      redraw()
      return
    }


    isPanning = false
    stopDrawing()
  })



  canvas.addEventListener('mouseleave', () => {
    isPanning = false
    stopDrawing()
  })

  canvas.addEventListener('contextmenu', (e) => e.preventDefault())

  window.addEventListener('resize', resizeCanvas)

  themeObserver = new MutationObserver(() => {
    isDarkTheme.value = document.documentElement.classList.contains('dark')
    applyThemeColorCorrection(strokes, drawingStore, isDarkTheme.value)
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


watch(
  () => drawingStore.strokeType,
  (newType, oldType) => {
    if (oldType === 'select' && newType !== 'select') {
      selectedStrokes.value = []
      selectedTextBoxes.value = []
      selectionRect.value = null
      redraw()
    }
  }
)

</script>

<style scoped>
.board-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden !important;
  display: block;
  cursor: crosshair;

}
.active-users-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

</style>
