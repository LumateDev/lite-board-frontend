<template>
  <div class="container">
    <h1>Добро пожаловать, {{ userStore.email }}, вот список ваших досок!</h1>

    <!-- Кнопка создания -->
    <el-button
      type="primary"
      @click="showCreateDialog = true"
      class="create-board-button"
      :icon="Plus"
    >
      Создать доску
    </el-button>

    <!-- Диалог создания доски -->
    <el-dialog v-model="showCreateDialog" title="Создать доску" width="400px">
      <el-form @submit.prevent="handleCreate">
        <el-form-item label="Название доски" required>
          <el-input
            v-model="newBoardName"
            placeholder="Введите название доски"
            autofocus
          />
        </el-form-item>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">Отмена</el-button>
          <el-button type="primary" @click="handleCreate">Создать</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- Диалог редактирования доски -->
    <el-dialog v-model="showEditDialog" title="Редактировать доску" width="400px">
      <el-form @submit.prevent="handleEdit" v-if="editingBoard">
        <el-form-item label="Название доски" required>
          <el-input
            v-model="editingBoard.name"
            placeholder="Введите название доски"
            autofocus
          />
        </el-form-item>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">Отмена</el-button>
          <el-button type="primary" @click="handleEdit">Сохранить</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- Список досок -->
    <div class="boards-list">
      <div v-for="board in boards" :key="board.id" class="board-item">
        <el-card class="board-card">
          <div class="board-header">
            <span>{{ board.name }}</span>
            <div class="board-actions">
              <el-icon class="action-icon" @click="openBoard(board.id)">
                <ArrowRight />
              </el-icon>
              <el-icon class="action-icon" @click="openEditDialog(board)">
                <Edit />
              </el-icon>
              <el-icon class="action-icon" @click="deleteBoard(board.id)">
                <Delete />
              </el-icon>
            </div>
          </div>
          <div class="board-footer">
            <span>Изменено {{ board.lastUpdated }}</span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
//import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Board } from '@/interfaces.ts'
import {
  ElButton,
  ElCard,
  ElIcon,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage
} from 'element-plus'
import {
  Edit,
  Delete,
  Plus,
  ArrowRight
} from '@element-plus/icons-vue'


const userStore = useUserStore()
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const newBoardName = ref('')
const editingBoard = ref<Board | null>(null)
//const router = useRouter()

const boards = ref<Board[]>([
  // Моки досок по умолчанию
  {
    id: 1,
    name: 'Моя первая доска',
    lastUpdated: '5 минут назад'
  },
  {
    id: 2,
    name: 'Рабочие задачи',
    lastUpdated: '2 часа назад'
  }
])
const createBoard = () => {
  const newBoard: Board = {
    id: Date.now(),
    name: newBoardName.value,
    lastUpdated: 'Только что'
  }
  boards.value.push(newBoard)
  newBoardName.value = ''
  showCreateDialog.value = false
}

const handleCreate = () => {
  if (!newBoardName.value.trim()) {
    ElMessage.error('Введите название доски')
    return
  }
  createBoard()
}

const openEditDialog = (board: Board) => {
  editingBoard.value = { ...board }
  showEditDialog.value = true
}

const handleEdit = () => {
  if (!editingBoard.value?.name?.trim()) {
    ElMessage.error('Введите название доски')
    return
  }

  const currentBoard = editingBoard.value
  if (currentBoard) {
    const index = boards.value.findIndex(b => b.id === currentBoard.id)
    if (index !== -1) {
      boards.value[index] = {
        ...currentBoard,
        lastUpdated: 'Только что'
      }
    }
  }
  showEditDialog.value = false
}

const deleteBoard = (boardId: number) => {
  boards.value = boards.value.filter(board => board.id !== boardId)
}

const openBoard = (boardId: number) => {
  //временная заглушка:
  ElMessage.success(`Открываем доску ${boardId}`)
  //router.push(`/board/${boardId}`)
}
</script>

<style scoped>
.create-board-button {
  margin-bottom: 20px;
  padding: 12px 12px;
  font-size: 16px;
}

.boards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.board-card {
  transition: transform 0.2s;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.board-card:hover {
  transform: translateY(-5px);
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.board-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-light);
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
}

.action-icon {
  padding: 6px;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.action-icon:hover {
  background-color: var(--el-fill-color-light);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}


.action-icon:nth-child(1) { /* Иконка перехода */
  color: var(--el-color-primary);
}
.action-icon:nth-child(2) { /* Иконка редактирования */
  color: var(--el-text-color-regular);
}
.action-icon:nth-child(3) { /* Иконка удаления */
  color: var(--el-color-danger);
}

.action-icon:hover {
  background-color: var(--el-fill-color-light);
  transform: scale(1.1);
}
</style>
