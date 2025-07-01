<template>
  <div class="teams-page">


    <TeamList
      :teams="teamStore.teams"
      :loading="teamStore.isLoading"
      @create="handleCreate"
      @edit="openTeamPage"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import TeamList from '@/components/Team/TeamList.vue'

import { ElMessage } from 'element-plus'

const router = useRouter()
const teamStore = useTeamStore()


// Загружаем команды при монтировании
onMounted(async () => {
  await teamStore.fetchTeams()
})

const handleCreate = async (name: string) => {
  try {
    await teamStore.createTeam(name)
    ElMessage.success('Команда создана')
  } catch (error) {
    ElMessage.error('Ошибка при создании команды')
    console.error(error)
  }
}

const handleDelete = async (id: string) => {
  try {
    await teamStore.deleteTeam(id)
    ElMessage.success('Команда удалена')
  } catch (error) {
    ElMessage.error('Ошибка при удалении команды')
    console.error(error)
  }
}

const openTeamPage = (teamId: string) => {
  router.push(`/team/${teamId}`)
}
</script>

<style scoped>
.teams-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
