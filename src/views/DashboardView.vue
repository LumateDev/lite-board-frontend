<template>
  <div class="dashboard-container">
    <!-- Hero секция -->
    <div class="dashboard-hero">
      <div class="hero-content">
        <h1 class="welcome-title">
          Добро пожаловать, <span class="user-name">{{ userStore.email }}</span>!
        </h1>
        <p class="hero-subtitle">
          Создавайте, редактируйте и делитесь идеями с вашей командой
        </p>
        <el-button
          type="primary"
          @click="showCreateDialog = true"
          class="create-board-button"
          :icon="Plus"
          size="large"
        >
          Создать новую доску
        </el-button>
      </div>
      <div class="hero-visual">
        <div class="floating-boards">
          <div class="floating-board" v-for="i in 3" :key="i"></div>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ boards.length }}</div>
        <div class="stat-label">Ваших досок</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ boards.filter(b => b.is_public).length }}</div>
        <div class="stat-label">Публичных досок</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ boards.filter(b => !b.is_public).length }}</div>
        <div class="stat-label">Приватных досок</div>
      </div>
    </div>

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
        <el-form-item label="Публичная доска">
          <el-switch v-model="newBoardIsPublic" />
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
            v-model="editingBoard.title"
            placeholder="Введите название доски"
            autofocus
          />
        </el-form-item>
        <el-form-item label="Публичная доска">
          <el-switch v-model="editingBoard.is_public" />
        </el-form-item>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">Отмена</el-button>
          <el-button type="primary" @click="handleEdit">Сохранить</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- Список досок -->
    <div class="boards-section">
      <div class="section-header">
        <h2 class="section-title">Ваши доски</h2>
        <div class="section-actions">
          
        </div>
      </div>

      <div v-loading="isLoading" class="boards-list">
        <div v-if="boards.length === 0 && !isLoading" class="empty-state">
          <div class="empty-icon">
            <el-icon :size="64"><Edit /></el-icon>
          </div>
          <h3>У вас пока нет досок</h3>
          <p>Создайте свою первую доску и начните работать с командой</p>
          <el-button type="primary" @click="showCreateDialog = true" :icon="Plus">
            Создать первую доску
          </el-button>
        </div>

        <div v-for="board in boards" :key="board.id" class="board-item">
          <el-card class="board-card" :class="{ 'public-board': board.is_public }">
            <div class="board-header">
              <div class="board-info">
                <h3 class="board-title">{{ board.title }}</h3>
                <div class="board-meta">
                  <el-tag 
                    :type="board.is_public ? 'success' : 'info'" 
                    size="small"
                  >
                    {{ board.is_public ? 'Публичная' : 'Приватная' }}
                  </el-tag>
                  <span class="board-date">{{ board.lastUpdated }}</span>
                </div>
              </div>
              <div class="board-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="openBoard(board.id)"
                  :icon="ArrowRight"
                >
                  Открыть
                </el-button>
                <el-button 
                  size="small" 
                  @click="openEditDialog(board)"
                  :icon="Edit"
                >
                  Редактировать
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteBoard(board.id)"
                  :icon="Delete"
                >
                  Удалить
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Board } from '@/interfaces.ts'
import { boardApi, type BoardCreate } from '@/api/boardApi'
import {
  ElButton,
  ElCard,
  ElIcon,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElLoading,
  ElSwitch,
  ElTag
} from 'element-plus'
import {
  Edit,
  Delete,
  Plus,
  ArrowRight
} from '@element-plus/icons-vue'


const userStore = useUserStore()
const router = useRouter()
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const newBoardName = ref('')
const newBoardIsPublic = ref(false)
const editingBoard = ref<Board | null>(null)
const isLoading = ref(false)

const boards = ref<Board[]>([])

// Загрузка досок при монтировании компонента
onMounted(async () => {
  await loadBoards()
})

// Загрузка досок с сервера
const loadBoards = async () => {
  try {
    isLoading.value = true
    const boardsData = await boardApi.getMyBoards()
    boards.value = boardsData.map(board => ({
      ...board,
      lastUpdated: formatDate(board.created_at)
    }))
  } catch (error) {
    console.error('Ошибка загрузки досок:', error)
    ElMessage.error('Не удалось загрузить доски')
  } finally {
    isLoading.value = false
  }
}

// Форматирование даты
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Только что'
  if (diffInMinutes < 60) return `${diffInMinutes} минут назад`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} часов назад`
  return `${Math.floor(diffInMinutes / 1440)} дней назад`
}
const createBoard = async () => {
  try {
    const boardData: BoardCreate = {
      title: newBoardName.value,
      is_public: newBoardIsPublic.value
    }
    
    const newBoard = await boardApi.createBoard(boardData)
    boards.value.unshift({
      ...newBoard,
      lastUpdated: 'Только что'
    })
    
    newBoardName.value = ''
    newBoardIsPublic.value = false
    showCreateDialog.value = false
    ElMessage.success('Доска успешно создана')
  } catch (error) {
    console.error('Ошибка создания доски:', error)
    ElMessage.error('Не удалось создать доску')
  }
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

const handleEdit = async () => {
  if (!editingBoard.value?.title?.trim()) {
    ElMessage.error('Введите название доски')
    return
  }

  try {
    const boardData: Partial<BoardCreate> = {
      title: editingBoard.value.title,
      is_public: editingBoard.value.is_public
    }
    
    const updatedBoard = await boardApi.updateBoard(editingBoard.value.id, boardData)
    const index = boards.value.findIndex(b => b.id === editingBoard.value!.id)
    if (index !== -1) {
      boards.value[index] = {
        ...updatedBoard,
        lastUpdated: 'Только что'
      }
    }
    
    showEditDialog.value = false
    ElMessage.success('Доска успешно обновлена')
  } catch (error) {
    console.error('Ошибка обновления доски:', error)
    ElMessage.error('Не удалось обновить доску')
  }
}

const deleteBoard = async (boardId: string) => {
  try {
    await boardApi.deleteBoard(boardId)
    boards.value = boards.value.filter(board => board.id !== boardId)
    ElMessage.success('Доска удалена')
  } catch (error) {
    console.error('Ошибка удаления доски:', error)
    ElMessage.error('Не удалось удалить доску')
  }
}

const openBoard = (boardId: string) => {
  router.push(`/board/${boardId}`)
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  transition: background-color 0.3s ease;
  padding-top: 12px; /* Отступ для хедера */
}

/* Hero секция */
.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0 12px 40px 12px; /* Учитываем отступы хедера */
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;
}

.dashboard-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  z-index: 1;
  position: relative;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.user-name {
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  margin-bottom: 32px;
  opacity: 0.9;
  line-height: 1.6;
}

.create-board-button {
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.create-board-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  position: relative;
}

.floating-boards {
  position: relative;
  width: 300px;
  height: 200px;
}

.floating-board {
  position: absolute;
  width: 120px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.floating-board:nth-child(1) {
  top: 20px;
  left: 20px;
  animation-delay: 0s;
}

.floating-board:nth-child(2) {
  top: 60px;
  right: 40px;
  animation-delay: 2s;
}

.floating-board:nth-child(3) {
  bottom: 20px;
  left: 60px;
  animation-delay: 4s;
}

/* Статистика */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  padding: 0 28px 40px; /* 12px + 16px для соответствия хедеру */
  margin-bottom: 40px;
}

.stat-card {
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stat-label {
  color: var(--el-text-color-regular);
  font-size: 0.9rem;
}

/* Секция досок */
.boards-section {
  padding: 0 28px 40px; /* 12px + 16px для соответствия хедеру */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.boards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: var(--el-text-color-regular);
}

.empty-icon {
  margin-bottom: 24px;
  color: var(--el-text-color-placeholder);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.empty-state p {
  margin-bottom: 32px;
  font-size: 1rem;
}

.board-card {
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  overflow: hidden;
}

.board-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.board-card.public-board {
  border-left: 4px solid var(--el-color-success);
}

.board-header {
  padding: 20px;
}

.board-info {
  margin-bottom: 16px;
}

.board-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
}

.board-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.board-date {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.board-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

/* Анимации */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Темная тема */
html.dark .dashboard-hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

html.dark .stat-card {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
}

html.dark .board-card {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
}

html.dark .board-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Адаптивность */
@media (max-width: 768px) {
  .dashboard-hero {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
    margin: 0 8px 40px 8px;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .hero-visual {
    margin-top: 40px;
  }

  .floating-boards {
    width: 250px;
    height: 150px;
  }

  .stats-section {
    grid-template-columns: 1fr;
    padding: 0 20px 40px;
  }

  .boards-section {
    padding: 0 20px 40px;
  }

  .boards-list {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .board-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .dashboard-hero {
    padding: 30px 16px;
  }

  .welcome-title {
    font-size: 1.75rem;
  }

  .create-board-button {
    width: 100%;
  }

  .board-actions {
    flex-direction: column;
  }

  .board-actions .el-button {
    width: 100%;
  }
}
</style>
