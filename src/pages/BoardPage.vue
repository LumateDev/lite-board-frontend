<template>
  <div class="board-canvas">
    <BoardCanvas ref="canvasRef" class="canvas" />
    <ToolBar />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolBar from '@/components/ToolBar.vue'
import BoardCanvas from '@/components/BoardCanvas.vue'

const canvasRef = ref()
</script>

<style scoped>
.board-page {
  position: relative;
  width: 100%;
  height: 100vh; /* фиксируем всю видимую высоту */
  overflow: hidden; /* запрещаем прокрутку */
}
</style>
