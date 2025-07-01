<template>
  <div class="team-list">
    <!-- Заголовок и кнопка -->
    <div class="page-header">
      <h1>Мои команды</h1>
      <el-button
        type="primary"
        @click="showCreateDialog = true"
        class="create-button"
      >
        Создать команду
      </el-button>
    </div>

    <!-- Состояние загрузки -->
    <el-skeleton :rows="5" animated v-if="teamStore.isLoading" />

    <!-- Пустой список -->
    <el-empty
      v-else-if="!teamStore.teams.length"
      description="Нет созданных команд"
    />

    <!-- Горизонтальный список команд -->
    <div class="teams-row" v-else>
      <TeamCard
        v-for="team in teamStore.teams"
        :key="team.id"
        :team="team"
        @delete="handleDeleteTeam"
        @open="openTeamPage"
      />
    </div>

    <!-- Диалог создания команды -->
    <el-dialog
      v-model="showCreateDialog"
      title="Создать команду"
      width="400px"
    >
      <el-form>
        <el-form-item label="Название команды" required>
          <el-input
            v-model="newTeamName"
            placeholder="Введите название"
            autofocus
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">Отмена</el-button>
        <el-button
          type="primary"
          @click="handleCreate"
          :disabled="!newTeamName.trim()"
        >
          Создать
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/teamStore'
import { ElMessage } from 'element-plus'
import TeamCard from '@/components/Team/TeamCard.vue'

const router = useRouter()
const teamStore = useTeamStore()
const showCreateDialog = ref(false)
const newTeamName = ref('')

onMounted(async () => {
  await teamStore.fetchTeams()
})

const handleCreate = async () => {
  try {
    await teamStore.createTeam(newTeamName.value)
    newTeamName.value = ''
    showCreateDialog.value = false
    ElMessage.success('Команда создана')
  } catch (error) {
    ElMessage.error('Ошибка создания')
    console.error(error)
  }
}

const handleDeleteTeam = async (id: string) => {
  try {
    await teamStore.deleteTeam(id)
    ElMessage.success('Команда удалена')
  } catch (error) {
    ElMessage.error('Ошибка удаления')
    console.error(error)
  }
}

const openTeamPage = (id: string) => {
  router.push(`/team/${id}`)
}
</script>

<style scoped>
.team-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.create-button {
  align-self: flex-start;
  width: auto;
}

/* Горизонтальное расположение без скролла */
.teams-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
}

/* Фиксированная ширина карточек */
.teams-row .team-card {
  width: 280px;
}

@media (max-width: 768px) {
  .teams-row {
    flex-direction: column;
  }

  .teams-row .team-card {
    width: 100%;
  }

  .page-header {
    align-items: center;
  }

  .create-button {
    align-self: center;
    width: 100%;
  }
}
</style>
