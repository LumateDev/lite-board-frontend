<template>
  <div v-if="userStore.isAuthenticated">
    <DashboardView />
  </div>
  <div v-else>
    Перенаправление на страницу авторизации...
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import DashboardView from '@/views/DashboardView.vue';

const userStore = useUserStore()
</script>
