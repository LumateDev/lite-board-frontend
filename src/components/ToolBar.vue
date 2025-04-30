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
      <el-button
        circle
        size="large"
        :type="isHandActive ? 'primary' : 'default'"
        :icon="Pointer"
        @click="setStroke('hand')"
      />

      <!-- Ластик -->
      <el-button
        circle
        size="large"
        :type="eraser ? 'primary' : 'default'"
        :icon="Delete"
        @click="toggleEraser"
      />

      <!-- Очистка -->
      <el-button circle size="large" :icon="DeleteFilled" @click="drawingStore.triggerClear()" />
      <el-button circle size="large" :icon="RefreshLeft" @click="drawingStore.triggerUndo()" />

      <!-- Redo -->
      <el-button circle size="large" :icon="RefreshRight" @click="drawingStore.triggerRedo()" />
      <!-- Переключение сетки -->
      <el-button
        circle
        size="large"
        :type="drawingStore.showGrid ? 'primary' : 'default'"
        :icon="Grid"
        @click="drawingStore.toggleGrid()"
      />
      <!-- Масштаб -->
      <div class="scale-slider">
        <span class="label">Масштаб: {{ Math.round(scale * 100) }}%</span>
        <el-slider v-model="scale" :min="0.1" :max="4" :step="0.1" show-tooltip />
      </div>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
import { Delete, DeleteFilled, Pointer } from '@element-plus/icons-vue'
import { useDrawingStore } from '@/stores/useDrawingStore'
import { RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { Grid } from '@element-plus/icons-vue'

import { computed } from 'vue'

const drawingStore = useDrawingStore()

const predefinedColors = ['#000000', '#ff0000', '#00aa00', '#0000ff', '#ffaa00', '#800080']

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
    max-width: 1200px;
    width: 100%;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
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
}
</style>
