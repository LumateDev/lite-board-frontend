<template>
  <el-header class="app-header">
    <div class="header-content">
      <router-link to="/home" class="logo-link"> Lite Board </router-link>

      <nav class="nav-links">
        <router-link to="/home" class="nav-link"> Home </router-link>
        <router-link to="/about" class="nav-link"> About </router-link>
        <router-link to="/Teams" class="nav-link"> Teams </router-link>
        <router-link to="/board/1" class="nav-link"> Общая доска </router-link>
      </nav>

      <!-- Mobile Burger Menu -->
      <el-dropdown
        class="mobile-nav-dropdown"
        trigger="click"
        placement="bottom-start"
      >
        <div class="burger-menu-trigger">
          <el-icon :size="28"><Menu /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <router-link to="/home" class="dropdown-item">Home</router-link>
            </el-dropdown-item>
            <el-dropdown-item>
              <router-link to="/about" class="dropdown-item">About</router-link>
            </el-dropdown-item>
            <el-dropdown-item>
              <router-link to="/Teams" class="dropdown-item">Teams</router-link>
            </el-dropdown-item>
            <el-dropdown-item>
              <router-link to="/board/1" class="dropdown-item">Test board</router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="header-actions">
        <!-- Notifications Bell -->
        <el-dropdown
          trigger="click"
          placement="bottom-end"
          :hide-on-click="false"
          class="notifications-dropdown"
        >
          <div class="notifications-trigger">
            <el-badge
              :value="notificationsStore.unreadCount"
              :hidden="notificationsStore.unreadCount === 0"
              type="danger"
            >
              <el-icon :size="24"><Bell /></el-icon>
            </el-badge>
          </div>

          <template #dropdown>
            <div class="notifications-dropdown-content">
              <div class="notifications-header">
                <span class="notifications-title">Уведомления</span>
                <div class="header-actions-buttons">
                  <el-button
                    v-if="notificationsStore.unreadCount > 0"
                    link
                    size="small"
                    @click="notificationsStore.markAllAsRead()"
                  >
                    Отметить все
                  </el-button>
                  <!-- Кнопка для тестирования добавления уведомлений -->
                  <el-button
                    link
                    size="small"
                    @click="addTestNotification"
                  >
                    + Тест
                  </el-button>
                </div>
              </div>

              <div class="notifications-list" v-loading="notificationsStore.isLoading">
                <div
                  v-if="notificationsStore.sortedNotifications.length === 0"
                  class="empty-notifications"
                >
                  <el-empty description="Нет уведомлений" :image-size="60" />
                </div>

                <div
                  v-for="notification in notificationsStore.sortedNotifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ 'unread': !notification.isRead }"
                >
                  <div class="notification-content">
                    <div class="notification-header">
                      <div class="notification-type-icon">
                        <el-icon v-if="notification.type === 'board_invite'" color="#409EFF">
                          <Document />
                        </el-icon>
                        <el-icon v-else-if="notification.type === 'team_invite'" color="#67C23A">
                          <UserFilled />
                        </el-icon>
                        <el-icon v-else-if="notification.type === 'system'" color="#E6A23C">
                          <Setting />
                        </el-icon>
                        <el-icon v-else-if="notification.type === 'success'" color="#67C23A">
                          <SuccessFilled />
                        </el-icon>
                        <el-icon v-else-if="notification.type === 'warning'" color="#E6A23C">
                          <WarningFilled />
                        </el-icon>
                        <el-icon v-else color="#909399">
                          <InfoFilled />
                        </el-icon>
                      </div>
                      <div class="notification-info">
                        <div class="notification-title">{{ notification.title }}</div>
                        <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                      </div>
                      <div class="notification-actions">
                        <el-button
                          v-if="!notification.isRead"
                          circle
                          size="small"
                          :loading="isProcessingAction === `read_${notification.id}`"
                          @click="handleMarkAsRead(notification.id)"
                        >
                          <el-icon><Check /></el-icon>
                        </el-button>
                        <el-button
                          circle
                          size="small"
                          :loading="isProcessingAction === `dismiss_${notification.id}`"
                          @click="handleDismiss(notification.id)"
                        >
                          <el-icon><Close /></el-icon>
                        </el-button>
                      </div>
                    </div>

                    <div class="notification-message">{{ notification.message }}</div>

                    <!-- Кнопки действий для приглашений -->
                    <div
                      v-if="isInvitationType(notification.type)"
                      class="notification-invitation-actions"
                    >
                      <el-button
                        type="success"
                        size="small"
                        :loading="isProcessingAction === `accept_${notification.id}`"
                        @click="handleAccept(notification.id)"
                      >
                        Принять
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        :loading="isProcessingAction === `reject_${notification.id}`"
                        @click="handleReject(notification.id)"
                      >
                        Отклонить
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-dropdown>

        <!-- Profile Menu -->
        <el-dropdown trigger="click" placement="bottom-end">
          <div class="profile-trigger">
            <el-icon :size="24"><User /></el-icon>
            <span>{{ userStore.email }}</span>
          </div>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-switch
                  v-model="isDark"
                  active-text="Dark"
                  inactive-text="Light"
                  @change="themeStore.toggleTheme"
                />
              </el-dropdown-item>

              <el-dropdown-item divided>
                <router-link to="/settings" class="dropdown-item">
                  <el-icon><Setting /></el-icon>
                  Settings
                </router-link>
              </el-dropdown-item>

              <el-dropdown-item>
                <el-button link @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  Logout
                </el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useNotificationsStore } from '@/stores/notifications'
import { useRouter } from 'vue-router'
import {
  User,
  Setting,
  SwitchButton,
  Bell,
  Check,
  Close,
  Document,
  UserFilled,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  Menu
} from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { NotificationType } from '@/types/notifications'
import { createBoardInviteNotification, createTeamInviteNotification } from '@/services/notificationFactory'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const notificationsStore = useNotificationsStore()

const isProcessingAction = ref<string | null>(null)

const isDark = computed({
  get: () => themeStore.isDark,
  set: (value) => themeStore.toggleTheme(value),
})

// Загружаем уведомления при монтировании компонента
onMounted(async () => {
  await notificationsStore.fetchNotifications()
})

// Проверка типа приглашения
const isInvitationType = (type: NotificationType) => {
  return type === 'board_invite' || type === 'team_invite'
}

// Форматирование времени
const formatTime = (date: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'только что'
  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} ч назад`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} дн назад`

  return date.toLocaleDateString('ru-RU')
}

// Универсальный обработчик действий
const handleNotificationAction = async (actionType: string, notificationId: string) => {
  const actionKey = `${actionType}_${notificationId}`
  isProcessingAction.value = actionKey

  try {
    const result = await notificationsStore.handleNotificationAction({
      type: actionType as any,
      notificationId
    })

    if (result.success) {
      ElMessage.success(result.message || 'Действие выполнено успешно')

      // Если есть URL для перехода, переходим
      if (result.redirectUrl) {
        router.push(result.redirectUrl)
      }
    } else {
      ElMessage.error(result.error || 'Произошла ошибка')
    }
  } catch (error) {
    ElMessage.error('Произошла ошибка при выполнении действия')
    console.error('Notification action error:', error)
  } finally {
    isProcessingAction.value = null
  }
}

// Обработчики конкретных действий
const handleAccept = (notificationId: string) => {
  handleNotificationAction('accept', notificationId)
}

const handleReject = (notificationId: string) => {
  handleNotificationAction('reject', notificationId)
}

const handleMarkAsRead = (notificationId: string) => {
  handleNotificationAction('mark_read', notificationId)
}

const handleDismiss = (notificationId: string) => {
  handleNotificationAction('dismiss', notificationId)
}

// Функция для тестирования добавления уведомлений
const addTestNotification = () => {
  const currentUserId = 'user_123' // В реальном приложении получаем из userStore
  const testNotifications = [
    createBoardInviteNotification(
      currentUserId,
      'Новая тестовая доска',
      'Test User',
      'test@example.com',
      `board_${Date.now()}`,
      'editor'
    ),
    createTeamInviteNotification(
      currentUserId,
      'Тестовая команда',
      'Another User',
      'another@example.com',
      Math.floor(Math.random() * 1000),
      'member'
    )
  ]

  const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)]
  notificationsStore.addNotification(randomNotification)
  ElMessage.info('Добавлено тестовое уведомление')
}

// Обработчик выхода из системы
const handleLogout = () => {
  userStore.logout()
  router.push('/auth')
}

</script>

<style scoped lang="scss">
.app-header {
  margin: 12px;
  border-radius: 12px;
  z-index: 100000;
  height: 60px;
  background-color: var(--el-bg-color-overlay);
  border: 2px solid var(--el-border-color);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 24px;
  }

  .logo-link {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--el-text-color-primary);
    text-decoration: none;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .nav-links {
    display: flex;
    gap: 2rem;

    .nav-link {
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 6px;
      text-decoration: none;
      color: var(--el-text-color-regular);
      transition: all 0.2s;

      &:hover {
        color: var(--el-text-color-primary);
        background-color: var(--el-fill-color-light);
      }

      &.router-link-exact-active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .notifications-trigger,
  .profile-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .notifications-trigger {
    padding: 8px;
  }

  // Стили для выпадающего меню профиля
  :deep(.el-dropdown-menu) {
    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 0 16px;
      text-decoration: none;
      color: var(--el-text-color-primary);

      .el-icon {
        margin-right: 8px;
      }

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .el-dropdown-menu__item {
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &.is-active {
        color: var(--el-color-primary);
      }
    }
  }
}

// Стили для уведомлений
.notifications-dropdown-content {
  width: 400px;
  max-height: 500px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow);
  border: 1px solid var(--el-border-color);
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  .notifications-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  .header-actions-buttons {
    display: flex;
    gap: 8px;
  }
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-dark);
    border-radius: 3px;
  }
}

.empty-notifications {
  padding: 40px 20px;
  text-align: center;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-lighter);
  }

  &.unread {
    background-color: var(--el-color-primary-light-9);
    border-left: 3px solid var(--el-color-primary);
  }

  &:last-child {
    border-bottom: none;
  }
}

.notification-content {
  .notification-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 8px;

    .notification-type-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notification-info {
      flex: 1;
      min-width: 0;

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
        line-height: 1.3;
      }

      .notification-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }
  }

  .notification-message {
    font-size: 14px;
    color: var(--el-text-color-regular);
    line-height: 1.4;
    margin-bottom: 12px;
    padding-left: 36px;
  }

  .notification-invitation-actions {
    display: flex;
    gap: 8px;
    padding-left: 36px;
  }
}

// Responsive
@media (max-width: 768px) {
  .app-header {
    margin: 8px;

    .header-content {
      padding: 0 16px;
    }
  }

  .nav-links {
    display: none !important;
  }

  .mobile-nav-dropdown {
    display: block !important;
  }

  .notifications-dropdown-content {
    width: 320px;
  }

  .profile-trigger span {
    display: none;
  }

  .notification-message,
  .notification-invitation-actions {
    padding-left: 0;
  }

  .notification-header {
    .notification-info {
      .notification-title {
        font-size: 13px;
      }
    }
  }
}

@media (min-width: 769px) {
  .mobile-nav-dropdown {
    display: none !important;
  }
}

.burger-menu-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>
