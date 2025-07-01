<template>
  <div class="members-panel">
    <div class="members-header">
      <h3>Участники команды</h3>
      <el-button
        type="primary"
        size="small"
        @click="showInviteDialog = true"
      >
        Пригласить
      </el-button>
    </div>

    <el-table :data="members" style="width: 100%">
      <el-table-column prop="name" label="Имя" />
      <el-table-column prop="email" label="Email" />
      <el-table-column prop="role" label="Роль">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'success' : 'info'">
            {{ row.role === 'admin' ? 'Админ' : 'Участник' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Действия" width="280">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
              size="small"
              @click="changeRole(row)"
              class="role-button"
            >
              {{ row.role === 'admin' ? 'Понизить' : 'Назначить админом' }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="removeMember(row.id)"
              class="delete-button"
            >
              Удалить
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Диалог приглашения -->
    <el-dialog v-model="showInviteDialog" title="Пригласить участника">
      <el-form>
        <el-form-item label="Email" required>
          <el-input v-model="inviteEmail" placeholder="Введите email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInviteDialog = false">Отмена</el-button>
        <el-button
          type="primary"
          @click="sendInvite"
          :disabled="!inviteEmail.trim()"
        >
          Отправить приглашение
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import { ElMessage } from 'element-plus'
import type { TeamMember } from '@/interfaces.ts'
import { inviteUserToTeam } from '@/api/teamApi'

const teamStore = useTeamStore()
const showInviteDialog = ref(false)
const inviteEmail = ref('')

const members = computed(() => teamStore.currentTeam?.members || [])

const changeRole = async (member: TeamMember) => {
  try {
    const newRole = member.role === 'admin' ? 'member' : 'admin'
    await teamStore.updateMemberRole(
      teamStore.currentTeam!.id,
      member.id,
      newRole
    )
    ElMessage.success('Роль успешно изменена')
  } catch (error) {
    ElMessage.error('Ошибка при изменении роли')
    console.error(error)
  }
}

const removeMember = async (id: string) => {
  try {
    await teamStore.removeMember(teamStore.currentTeam!.id, id)
    ElMessage.success('Участник удалён')
  } catch (error) {
    ElMessage.error('Ошибка при удалении участника')
    console.error(error)
  }
}

const sendInvite = async () => {
  if (!inviteEmail.value.trim()) {
    ElMessage.error('Введите email')
    return
  }

  try {
    await inviteUserToTeam(
      teamStore.currentTeam!.id,
      inviteEmail.value
    )
    ElMessage.success('Приглашение отправлено')
    showInviteDialog.value = false
    inviteEmail.value = ''
  } catch (error) {
    ElMessage.error('Ошибка при отправке приглашения')
    console.error(error)
  }
}
</script>

<style scoped>
.members-panel {
  min-width: 900px;
  padding: 20px;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.role-button {
  min-width: 150px; /* Ширина для текста "Назначить админом" */
  white-space: nowrap; /* Запрет переноса текста */
}

.delete-button {
  min-width: 80px; /* Фиксированная ширина для кнопки удаления */
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .role-button,
  .delete-button {
    width: 100%;
    min-width: unset;
  }
}
</style>
