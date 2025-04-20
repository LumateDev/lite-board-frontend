<template>
  <div class="error-container">
    <el-result
      title="404 Not Found"
      sub-title="Страница не найдена"
    >
      <template #icon>
        <el-icon :size="100"><Warning /></el-icon>
      </template>
      <template #extra>
        <el-button type="primary" @click="goHome">
          На главную
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
