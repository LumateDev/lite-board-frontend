<template>
  <div class="active-users-panel" :class="{ 'collapsed': isCollapsed }">
    <!-- Кнопка свернуть/развернуть -->
    <div class="toggle-button" @click="toggleCollapsed">
      <el-icon :size="16">
        <DArrowRight v-if="!isCollapsed" />
        <DArrowLeft v-if="isCollapsed" />
      </el-icon>
    </div>

    <!-- Основной контент панели -->
    <div class="panel-content" v-show="!isCollapsed">
      <!-- Заголовок с количеством пользователей -->
      <div class="panel-header">
        <div class="header-title">
          <span>Участники ({{ totalUsers }})</span>
        </div>
        <div class="connection-status" :class="connectionStatus">
          <div class="status-dot"></div>
          <span class="status-text">{{ connectionStatusText }}</span>
        </div>
      </div>

      <!-- Список пользователей -->
      <div class="users-list">
        <div
          v-for="user in activeUsers"
          :key="user.id"
          class="user-item"
          :class="{ 'current-user': user.email === currentUserEmail }"
        >
          <div
            class="user-avatar"
            :style="{ backgroundColor: getUserColor(user.email) }"
            :title="user.email"
          >
            {{ getInitials(user.email) }}
          </div>
          <div class="user-info">
            <div class="user-name">
              {{ getUserDisplayName(user.email) }}
              <el-tag
                v-if="user.email === currentUserEmail"
                size="small"
                type="success"
                class="current-user-tag"
              >
                Вы
              </el-tag>
            </div>
            <div class="user-status">
              <div class="activity-dot" :class="user.isActive ? 'active' : 'idle'"></div>
              <span>{{ user.isActive ? 'Активен' : 'Неактивен' }}</span>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div v-if="totalUsers === 0" class="empty-state">
          <el-icon :size="32" class="empty-icon">
            <UserFilled />
          </el-icon>
          <span>Нет активных участников</span>
        </div>
      </div>

      <!-- Футер с действиями -->
      <div class="panel-footer">
        <el-button
          size="small"
          text
          @click="copyBoardLink"
          class="invite-button"
        >
          <el-icon><Share /></el-icon>
          Пригласить
        </el-button>
      </div>
    </div>

    <!-- Свернутое состояние - только аватары снизу вверх -->
    <div class="collapsed-content" v-show="isCollapsed">
      <div class="users-avatars-vertical">
        <div
          v-for="(user, index) in visibleUsers"
          :key="user.id"
          class="user-avatar small"
          :style="{
            backgroundColor: getUserColor(user.email)
          }"
          :title="user.email"
        >
          {{ getInitials(user.email) }}
        </div>
        <div
          v-if="totalUsers > maxVisibleUsers"
          class="user-avatar small more-users"
          :title="`Еще ${totalUsers - maxVisibleUsers} участников`"
        >
          +{{ totalUsers - maxVisibleUsers }}
        </div>
      </div>
      <div class="connection-indicator collapsed" :class="connectionStatus">
        <div class="status-dot small"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, UserFilled, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import type { ConnectionStatus } from '@/interfaces';

const props = defineProps<ConnectionStatus>()

const isCollapsed = ref(false)
const maxVisibleUsers = 3

const totalUsers = computed(() => props.activeUsers.length)

const visibleUsers = computed(() =>
  props.activeUsers.slice(0, maxVisibleUsers)
)

const connectionStatusText = computed(() => {
  switch (props.connectionStatus) {
    case 'connected': return 'Подключено'
    case 'connecting': return 'Подключение...'
    case 'disconnected': return 'Отключено'
    case 'error': return 'Ошибка'
    default: return 'Неизвестно'
  }
})

// Переключение свернутого состояния
function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}

// Генерация цвета для пользователя
function getUserColor(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

// Получение инициалов
function getInitials(email: string): string {
  const name = email.split('@')[0]
  return name.slice(0, 2).toUpperCase()
}

// Получение отображаемого имени
function getUserDisplayName(email: string): string {
  const name = email.split('@')[0]
  return name.length > 10 ? name.slice(0, 10) + '...' : name
}

// Копирование ссылки на доску
function copyBoardLink() {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('Ссылка скопирована в буфер обмена')
  }).catch(() => {
    ElMessage.error('Не удалось скопировать ссылку')
  })
}
</script>

<style scoped>
.active-users-panel {
  position: fixed;
  top: 85px;
  right: 20px;
  z-index: 1000;

  /* Полупрозрачность */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  box-shadow: var(--el-box-shadow-light);

  transition: all 0.3s ease;
  width: 280px;
  max-height: 420px;
  overflow: hidden;
}

/* Темная тема */
html.dark .active-users-panel {
  background: rgba(0, 0, 0, 0.8);
  border-color: var(--el-border-color);
  box-shadow: var(--el-box-shadow-dark);
}

.active-users-panel.collapsed {
  width: 60px;
  height: fit-content;
  max-height: 300px;
}

/* Красивая кнопка переключения */
.toggle-button {
  position: absolute;
  top: 16px;
  right: -14px;
  width: 28px;
  height: 28px;
  background: var(--el-color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1002;
  border: 3px solid var(--el-bg-color);
}

.toggle-button:hover {
  background: var(--el-color-primary-light-3);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.toggle-button:active {
  transform: scale(1.05);
}

/* Основной контент */
.panel-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  margin-bottom: 14px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.connection-status.connected {
  color: var(--el-color-success);
}

.connection-status.connecting {
  color: var(--el-color-warning);
}

.connection-status.disconnected,
.connection-status.error {
  color: var(--el-color-danger);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-success); /* По умолчанию зеленый */
  animation: pulse 2s infinite;
}

.status-dot.small {
  width: 6px;
  height: 6px;
}

.connection-status.connected .status-dot {
  background-color: var(--el-color-success);
}

.connection-status.connecting .status-dot {
  background-color: var(--el-color-warning);
}

.connection-status.disconnected .status-dot,
.connection-status.error .status-dot {
  background-color: var(--el-color-danger);
}

.status-text {
  font-size: 11px;
}

/* Список пользователей */
.users-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 14px;
  max-height: 280px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  margin: 4px 0;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.user-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.user-item.current-user {
  background-color: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-7);
  padding: 7px 11px;
  border-radius: 6px;
  margin: 4px 0; /* Убираем отрицательный margin */
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-left: 0; /* Убираем любые отступы слева */
}

.user-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 11px;
  border-width: 1px;
}

.user-avatar.more-users {
  background-color: var(--el-color-info) !important;
  font-size: 10px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-user-tag {
  height: 18px;
  line-height: 16px;
  font-size: 10px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.activity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--el-color-info);
}

.activity-dot.active {
  background-color: var(--el-color-success);
}

.activity-dot.idle {
  background-color: var(--el-color-warning);
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  gap: 12px;
}

.empty-icon {
  color: var(--el-text-color-placeholder);
}

/* Футер */
.panel-footer {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.invite-button {
  width: 100%;
  color: var(--el-color-primary);
  font-size: 13px;
  height: 32px;
}

.invite-button:hover {
  background-color: var(--el-color-primary-light-9);
}

/* Свернутое состояние - вертикальные аватары */
.collapsed-content {
  padding: 16px 8px 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.users-avatars-vertical {
  display: flex;
  flex-direction: column-reverse; /* Снизу вверх */
  align-items: center;
  gap: 8px;
}

.connection-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.connection-indicator.collapsed {
  margin-top: 0;
}

/* Анимации */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .active-users-panel {
    right: 10px;
    top: 80px;
    width: 260px;
  }

  .active-users-panel.collapsed {
    width: 50px;
  }
}

/* Скроллбар */
.users-list::-webkit-scrollbar {
  width: 4px;
}

.users-list::-webkit-scrollbar-track {
  background: transparent;
}

.users-list::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 2px;
}

.users-list::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}
</style>
