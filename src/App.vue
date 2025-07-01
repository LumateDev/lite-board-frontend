<template>
  <!-- Проверяем, если текущий путь не /auth, /error и не /about, показываем AppHeader -->
  <AppHeader v-if="!isAuthPage && !isErrorPage && !isAboutPage" />
  <router-view v-slot="{ Component }">
    <component :is="Component" v-if="!isLoading" />
    <el-skeleton v-else :rows="5" animated />
  </router-view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { ElMessage } from 'element-plus'

const isLoading = ref(true)
const route = useRoute()
const router = useRouter()

// Вычисляем, является ли текущая страница страницей авторизации, ошибки или about
const isAuthPage = computed(() => route.name === 'auth')
const isErrorPage = computed(() => route.name === 'error')
const isAboutPage = computed(() => route.name === 'about')

onMounted(() => {
  // Задержка для имитации загрузки
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

// Обработка ошибок, перенаправление на страницу ошибки
onErrorCaptured((err) => {
  ElMessage.error('Произошла ошибка: ' + err.message)
  router.push('/error')
  return false
})
</script>


