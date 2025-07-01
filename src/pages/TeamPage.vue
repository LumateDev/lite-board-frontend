<template>
  <div class="team-page-container" v-if="teamStore.currentTeam">
    <el-page-header @back="router.go(-1)">
      <template #content>
        <div class="page-header-content">
          <h1>{{ teamStore.currentTeam.name }}</h1>
          <el-tag type="info">
            Создана: {{ formattedCreatedAt }}
          </el-tag>
        </div>
      </template>
    </el-page-header>

    <el-tabs class="team-tabs">
      <el-tab-pane label="Участники">
        <TeamMembersPanel />
      </el-tab-pane>
      <el-tab-pane label="Настройки">
        <TeamSettingsPanel />
      </el-tab-pane>
    </el-tabs>
  </div>

  <el-empty v-else description="Команда не найдена" />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import TeamMembersPanel from '@/components/Team/TeamMembersPanel.vue'
import TeamSettingsPanel from '@/components/Team/TeamSettingsPanel.vue'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()

const formattedCreatedAt = computed(() => {
  return new Date(teamStore.currentTeam?.createdAt || '').toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

onMounted(async () => {
  const teamId = String(route.params.id)
  if (!teamId) return

  try {
    await teamStore.fetchTeams()
    const team = teamStore.teams.find(t => t.id === teamId)
    teamStore.setCurrentTeam(team || null)
  } catch (error) {
    console.error('Ошибка загрузки команды:', error)
  }
})
</script>

<style scoped>
.team-page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-tabs {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .page-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
