<template>
  <el-card class="team-card" shadow="hover">
    <div class="team-header">
      <h3>{{ team.name }}</h3>
      <div class="team-actions">
        <el-tooltip content="Открыть команду" placement="top">
          <el-icon class="action-icon" @click="openTeam">
            <View />
          </el-icon>
        </el-tooltip>
        <el-tooltip content="Удалить" placement="top">
          <el-icon class="action-icon" @click="confirmDelete">
            <Delete />
          </el-icon>
        </el-tooltip>
      </div>
    </div>

    <div class="team-meta">
      <span>Участников: {{ team.members.length }}</span>
      <span>Создана: {{ formattedDate }}</span>
    </div>

    <!-- Диалог редактирования -->
    <el-dialog v-model="showEditDialog" title="Редактировать команду" width="600px">
      <el-form @submit.prevent="handleEdit">
        <el-form-item label="Название команды">
          <el-input v-model="editName" />
        </el-form-item>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">Отмена</el-button>
          <el-button type="primary" @click="handleEdit">Сохранить</el-button>
        </div>
      </el-form>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, View } from '@element-plus/icons-vue'
import type { Team } from '@/interfaces'

const props = defineProps<{
  team: Team
}>()

const emit = defineEmits<{
  (e: 'update:team', team: Team): void
  (e: 'delete', id: string): void
  (e: 'open', id: string): void
}>()

const showEditDialog = ref(false)
const editName = ref('')

const formattedDate = computed(() => {
  return props.team.createdAt.toLocaleDateString()
})

const openTeam = () => {
  emit('open', props.team.id)
}

const handleEdit = async () => {
  if (!editName.value.trim()) {
    ElMessage.error('Введите название команды')
    return
  }

  try {
    const updatedTeam = { ...props.team, name: editName.value }
    emit('update:team', updatedTeam)
    showEditDialog.value = false
    ElMessage.success('Команда обновлена')
  } catch (error) {
    ElMessage.error('Ошибка при обновлении команды')
    console.error(error)
  }
}

const confirmDelete = () => {
  ElMessageBox.confirm(
    `Вы уверены, что хотите удалить команду "${props.team.name}"?`,
    'Подтверждение удаления',
    {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'warning',
    }
  ).then(() => {
    emit('delete', props.team.id)
    ElMessage.success('Команда удалена')
  }).catch(() => {
    // Отмена удаления
  })
}
</script>

<style scoped>
.team-card {
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.team-card:hover {
  transform: translateY(-2px);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.team-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.team-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-icon:hover {
  background-color: var(--el-fill-color-light);
  transform: scale(1.1);
}

.action-icon:nth-child(1) { /* Открыть */
  color: var(--el-color-primary);
}

.action-icon:nth-child(2) { /* Редактировать */
  color: var(--el-color-warning);
}

.action-icon:nth-child(3) { /* Удалить */
  color: var(--el-color-danger);
}

.team-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
