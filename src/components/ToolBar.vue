<template>
  <el-footer class="sidebar-footer">
    <div class="sidebar-container">
      <!-- Инструменты -->

      <!-- Popover: Цвет + Толщина -->
      <el-popover placement="top-start" trigger="click" width="220">
        <template #reference>
          <el-button
            size="large"
            icon="EditPen"
            circle
            :type="isActive('dash')"
            @click="setStroke('dash')"
          />
        </template>

        <div class="tool-options">
          <!-- Color Picker -->
          <div class="color-picker">
            <span class="label">Цвет:</span>
            <el-color-picker
              v-model="localColor"
              :predefine="predefinedColors"
              :show-alpha="true"
              :teleported="false"
              :show-without-confirm="false"
              :popper-class="'custom-color-picker'"
            >
              <template #default>
                <div class="color-preview-circle" :style="{ backgroundColor: localColor }" />
              </template>
            </el-color-picker>
          </div>

          <!-- Толщина линии -->
          <div class="slider-wrapper">
            <span class="label">Толщина: {{ lineWidth }}</span>
            <el-slider v-model="lineWidth" :min="1" :max="20" show-tooltip />
          </div>
        </div>
      </el-popover>

      <!-- Рука -->
      <el-tooltip content="Рука (Панорама)" placement="right">
        <el-button
          circle
          size="large"
          :type="isHandActive ? 'primary' : 'default'"
          :icon="Pointer"
          @click="setStroke('hand')"
        />
      </el-tooltip>

      <!-- Ластик -->
      <el-tooltip content="Ластик (E)" placement="right">
        <el-button
          circle
          size="large"
          :type="eraser ? 'primary' : 'default'"
          :icon="Delete"
          @click="toggleEraser"
        />
      </el-tooltip>

      <!-- Очистка
      <el-tooltip content="Очистить всё" placement="right">
        <el-button
          circle
          size="large"
          :icon="DeleteFilled"
          @click="drawingStore.triggerClear()"
        />
      </el-tooltip> -->

      <!-- Undo -->
      <el-tooltip content="Отменить (Ctrl+Z)" placement="right">
        <el-button
          circle
          size="large"
          :icon="RefreshLeft"
          @click="drawingStore.triggerUndo()"
        />
      </el-tooltip>

      <!-- Redo -->
      <el-tooltip content="Повторить (Ctrl+Shift+Z / Ctrl+Y)" placement="right">
        <el-button
          circle
          size="large"
          :icon="RefreshRight"
          @click="drawingStore.triggerRedo()"
        />
      </el-tooltip>

      <!-- Переключение сетки -->
      <el-tooltip content="Сетка" placement="right">
        <el-button
          circle
          size="large"
          :type="drawingStore.showGrid ? 'primary' : 'default'"
          :icon="Grid"
          @click="drawingStore.toggleGrid()"
        />
      </el-tooltip>

      <!-- Выделение -->
      <el-tooltip content="Выделение" placement="right">
        <el-button
          circle
          size="large"
          :type="drawingStore.strokeType === 'select' ? 'primary' : 'default'"
          @click="drawingStore.setStrokeType('select')"
        >
          <el-icon><Crop /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="Text" placement="right">
        <el-button
          circle
          size="large"
          :type="drawingStore.activeTool === 'text' ? 'primary' : 'default'"
          @click="() => drawingStore.setActiveTool('text')"
        >
          <el-icon><Document /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- Magic Stick Выделение -->
      <el-tooltip content="Magic Stick (Выделение области)" placement="right">
        <el-button
          circle
          size="large"
          :type="drawingStore.strokeType === 'magic-select' ? 'primary' : 'default'"
          @click="drawingStore.setStrokeType('magic-select')"
          class="magic-select-button"
        >
          <el-icon><MagicStick /></el-icon>
          <div class="beta-badge">BETA</div>
        </el-button>
      </el-tooltip>

      <!-- Масштаб -->
      <div class="scale-slider">
        <span class="label">Масштаб: {{ Math.round(scale * 100) }}%</span>
        <el-slider v-model="scale" :min="0.1" :max="4" :step="0.1" show-tooltip />
      </div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { Delete, DeleteFilled, Pointer, Crop, Document, MagicStick } from '@element-plus/icons-vue'
import { useDrawingStore } from '@/stores/useDrawingStore'
import { RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { Grid } from '@element-plus/icons-vue'

import { computed } from 'vue'

const drawingStore = useDrawingStore()

const predefinedColors = ['#000000', '#ffffff', '#00aa00', '#0000ff', '#ffaa00', '#800080']

const eraser = computed(() => drawingStore.eraser)
const strokeType = computed(() => drawingStore.strokeType)

const toggleEraser = () => drawingStore.toggleEraser()
const setStroke = (type: string) => drawingStore.setStrokeType(type)

const isHandActive = computed(
  () => drawingStore.strokeType === 'hand' || drawingStore.isTempHandActive,
)
const lineWidth = computed({
  get: () => drawingStore.lineWidth,
  set: (val) => drawingStore.setLineWidth(val),
})

const localColor = computed({
  get: () => drawingStore.color,
  set: (val: string) => drawingStore.setColor(val),
})

const scale = computed({
  get: () => drawingStore.scale,
  set: (val: number) => drawingStore.setScale(val),
})

const isActive = (type: string) => {
  return strokeType.value === type && !eraser.value ? 'primary' : 'default'
}
</script>

<style scoped lang="scss">
.sidebar-footer {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;

  .sidebar-container {
    pointer-events: all;
    max-width: 760px;
    width: 100%;
    background-color: var(--el-bg-color);
    border: 2px solid var(--el-border-color);
    border-radius: 12px;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .color-picker {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 12px;
  }

  .label {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
  }

  .color-preview-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #ccc;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }

  .color-preview-circle:hover {
    box-shadow: 0 0 0 2px #409eff88;
  }

  .slider-wrapper {
    text-align: center;
  }

  .scale-slider {
    width: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .magic-select-button {
    position: relative;
  }

  .beta-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    font-size: 8px;
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 8px;
    line-height: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
