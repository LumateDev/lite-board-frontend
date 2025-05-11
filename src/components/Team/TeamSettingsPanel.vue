<template>
  <div class="settings-panel">
    <h3>Настройки команды</h3>

    <el-form label-width="150px">
      <el-form-item label="Название команды" class="team-name-item">
        <el-input
          v-model="teamName"
          class="team-name-input"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item class="action-buttons">
        <div class="buttons-wrapper">
          <el-button
            type="primary"
            @click="updateTeam"
            :loading="isLoading"
          >
            Сохранить изменения
          </el-button>

          <el-button
            type="danger"
            @click="confirmDelete"
            :loading="isLoading"
          >
            Удалить команду
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const teamStore = useTeamStore()
const isLoading = ref(false)

const teamName = computed({
  get: () => teamStore.currentTeam?.name || '',
  set: (value) => {
    if (teamStore.currentTeam) {
      teamStore.currentTeam.name = value
    }
  }
})

const updateTeam = async () => {
  if (!teamStore.currentTeam) return

  try {
    isLoading.value = true
    await teamStore.updateTeam(teamStore.currentTeam)
    ElMessage.success('Настройки сохранены')
  } catch (error) {
    ElMessage.error('Ошибка сохранения')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = () => {
  if (!teamStore.currentTeam) return

  ElMessageBox.confirm(
    `Вы уверены, что хотите удалить команду "${teamStore.currentTeam.name}"?`,
    'Подтверждение удаления',
    { confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', type: 'warning' }
  ).then(async () => {
    try {
      await teamStore.deleteTeam(teamStore.currentTeam!.id)
      ElMessage.success('Команда удалена')
    } catch (error) {
      ElMessage.error('Ошибка удаления')
      console.error(error)
    }
  })
}
</script>

<style scoped>
.settings-panel {
  min-width: 900px;
  padding: 20px;
}

.team-name-item {
  margin-bottom: 30px;
}

.team-name-input {
  width: 300px;
}

.action-buttons :deep(.el-form-item__content) {
  margin-left: 0 !important;
  justify-content: flex-start;
}

.buttons-wrapper {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .team-name-input {
    width: 100%;
  }

  .settings-panel {
    min-width: unset;
    width: 100%;
  }

  .buttons-wrapper {
    flex-direction: column;
  }
}
</style>
