<template>
  <div
    class="user-cursor"
    :style="cursorStyle"
    v-show="isVisible"
  >
    <div class="cursor-icon">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M2 2L16 8L10 10L8 16L2 2Z"
          :fill="cursorColor"
          stroke="white"
          stroke-width="1.5"
        />
      </svg>
    </div>
    <div class="cursor-label" :style="{ backgroundColor: cursorColor }">
      {{ userName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

interface Props {
  x: number
  y: number
  userName: string
  userColor?: string
  panX: number
  panY: number
  scale: number
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: true
})

// Refs для плавной анимации
const animatedX = ref(props.x)
const animatedY = ref(props.y)
const animatedPanX = ref(props.panX)
const animatedPanY = ref(props.panY)
const animatedScale = ref(props.scale)

// Генерируем цвет курсора на основе имени пользователя если цвет не задан
const cursorColor = computed(() => {
  if (props.userColor) return props.userColor

  // Простая функция генерации цвета по строке
  let hash = 0
  for (let i = 0; i < props.userName.length; i++) {
    hash = props.userName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
})

const cursorStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${animatedPanX.value + animatedX.value * animatedScale.value}px`,
  top: `${animatedPanY.value + animatedY.value * animatedScale.value}px`,
  transform: 'translate(-2px, -2px)',
  pointerEvents: 'none' as const,
  zIndex: '1000',
  transition: 'left 0.1s ease-out, top 0.1s ease-out'
}))

// Функция плавной анимации значений
function animateValue(
  current: { value: number },
  target: number,
  duration: number = 100
) {
  const start = current.value
  const distance = target - start
  const startTime = Date.now()

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3)

    current.value = start + (distance * eased)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Watchers для плавной анимации позиции
watch(() => props.x, (newX) => {
  animateValue(animatedX, newX, 120)
})

watch(() => props.y, (newY) => {
  animateValue(animatedY, newY, 120)
})

watch(() => props.panX, (newPanX) => {
  animateValue(animatedPanX, newPanX, 80)
})

watch(() => props.panY, (newPanY) => {
  animateValue(animatedPanY, newPanY, 80)
})

watch(() => props.scale, (newScale) => {
  animateValue(animatedScale, newScale, 150)
})

// Инициализация анимированных значений
onMounted(() => {
  animatedX.value = props.x
  animatedY.value = props.y
  animatedPanX.value = props.panX
  animatedPanY.value = props.panY
  animatedScale.value = props.scale
})
</script>

<style scoped>
.user-cursor {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  animation: cursorAppear 0.3s ease-out;
}

@keyframes cursorAppear {
  from {
    opacity: 0;
    transform: translate(-2px, -2px) scale(0.7);
  }
  to {
    opacity: 1;
    transform: translate(-2px, -2px) scale(1);
  }
}

.cursor-icon {
  position: relative;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}

.cursor-label {
  position: absolute;
  top: 16px;
  left: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(2px);
  animation: labelSlideIn 0.4s ease-out 0.1s both;
}

@keyframes labelSlideIn {
  from {
    opacity: 0;
    transform: translateY(-3px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cursor-icon svg {
  display: block;
}

/* Плавные переходы при изменении видимости */
.user-cursor {
  transition: opacity 0.2s ease;
}
</style>
