import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Notification,
  NotificationAction,
  NotificationActionResult,
  NotificationFilters,
  BoardInviteData,
  TeamInviteData
} from '@/types/notifications'
import {
  NotificationFactory,
  createBoardInviteNotification,
  createTeamInviteNotification
} from '@/services/notificationFactory.ts'

export const useNotificationsStore = defineStore('notifications', () => {
  // Состояние
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Инициализация моковых данных
  const initMockData = () => {
    const currentUserId = 'user_123' // В реальном приложении получаем из userStore

    const mockNotifications: Notification[] = [
      // Приглашение на доску
      createBoardInviteNotification(
        currentUserId,
        'Проект UI/UX дизайна',
        'John Doe',
        'john.doe@example.com',
        'board_456',
        'editor'
      ),

      // Приглашение в команду
      createTeamInviteNotification(
        currentUserId,
        'Дизайн-студия "Креатив"',
        'Jane Smith',
        'jane.smith@example.com',
        42,
        'member'
      ),

      // Системное уведомление
      NotificationFactory.createSystemNotification(
        currentUserId,
        'Обновление системы',
        'Добавлены новые функции для совместной работы и улучшена производительность',
        { version: '2.1.0', severity: 'medium' }
      ),

      // Информационное уведомление
      NotificationFactory.createInfoNotification(
        currentUserId,
        'Добро пожаловать!',
        'Спасибо за регистрацию в Lite Board. Изучите наши возможности!',
        { actionUrl: '/tutorial', actionText: 'Начать обучение' }
      ),

      // Уведомление об успехе (уже прочитанное)
      {
        ...NotificationFactory.createSuccessNotification(
          currentUserId,
          'Доска создана',
          'Ваша новая доска "Планирование проекта" успешно создана'
        ),
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 день назад
      }
    ]

    // Устанавливаем разное время создания
    mockNotifications[0].createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 часа назад
    mockNotifications[1].createdAt = new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 часов назад
    mockNotifications[2].createdAt = new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 часов назад
    mockNotifications[3].createdAt = new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 дня назад

    notifications.value = mockNotifications
  }

  // Загрузка уведомлений
  const fetchNotifications = async (filters?: NotificationFilters) => {
    try {
      isLoading.value = true
      error.value = null

      // TODO: Заменить на реальный API вызов
      // const response = await apiClient.get('notifications', { params: filters })
      // notifications.value = response.data.map((notification: any) => ({
      //   ...notification,
      //   createdAt: new Date(notification.createdAt)
      // }))

      // Имитируем задержку сети
      await new Promise(resolve => setTimeout(resolve, 500))

      // Пока используем моковые данные
      if (notifications.value.length === 0) {
        initMockData()
      }

    } catch (err) {
      error.value = 'Не удалось загрузить уведомления'
      console.error('Fetch notifications error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Универсальный обработчик действий
  const handleNotificationAction = async (
    action: NotificationAction
  ): Promise<NotificationActionResult> => {
    try {
      const notification = notifications.value.find(n => n.id === action.notificationId)
      if (!notification) {
        throw new Error('Уведомление не найдено')
      }

      switch (action.type) {
        case 'accept':
          return await handleAcceptAction(notification)

        case 'reject':
          return await handleRejectAction(notification)

        case 'dismiss':
          return await handleDismissAction(notification)

        case 'mark_read':
          return await handleMarkReadAction(notification)

        default:
          throw new Error(`Неизвестное действие: ${action.type}`)
      }
    } catch (err) {
      console.error('Notification action error:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Неизвестная ошибка'
      }
    }
  }

  // Обработка принятия приглашения
  const handleAcceptAction = async (notification: Notification): Promise<NotificationActionResult> => {
    console.log('Accepting notification:', notification.id, notification.type)

    if (notification.type === 'board_invite') {
      const boardData = notification.data as BoardInviteData

      // TODO: Реальный API вызов
      // await apiClient.post(`boards/${boardData.boardId}/accept-invite`)

      console.log(`Принято приглашение на доску: ${boardData.boardName}`)

      // Удаляем уведомление после принятия
      removeNotificationLocal(notification.id)

      return {
        success: true,
        message: `Вы присоединились к доске "${boardData.boardName}"`,
        redirectUrl: `/board/${boardData.boardId}`
      }
    }

    if (notification.type === 'team_invite') {
      const teamData = notification.data as TeamInviteData

      // TODO: Реальный API вызов
      // await apiClient.post(`teams/${teamData.teamId}/accept-invite`)

      console.log(`Принято приглашение в команду: ${teamData.teamName}`)

      // Удаляем уведомление после принятия
      removeNotificationLocal(notification.id)

      return {
        success: true,
        message: `Вы присоединились к команде "${teamData.teamName}"`,
        redirectUrl: `/team/${teamData.teamId}`
      }
    }

    return {
      success: false,
      error: 'Данный тип уведомления не поддерживает принятие'
    }
  }

  // Обработка отклонения приглашения
  const handleRejectAction = async (notification: Notification): Promise<NotificationActionResult> => {
    console.log('Rejecting notification:', notification.id, notification.type)

    if (notification.type === 'board_invite') {
      const boardData = notification.data as BoardInviteData

      // TODO: Реальный API вызов
      // await apiClient.post(`boards/${boardData.boardId}/reject-invite`)

      console.log(`Отклонено приглашение на доску: ${boardData.boardName}`)

      // Удаляем уведомление после отклонения
      removeNotificationLocal(notification.id)

      return {
        success: true,
        message: 'Приглашение отклонено'
      }
    }

    if (notification.type === 'team_invite') {
      const teamData = notification.data as TeamInviteData

      // TODO: Реальный API вызов
      // await apiClient.post(`teams/${teamData.teamId}/reject-invite`)

      console.log(`Отклонено приглашение в команду: ${teamData.teamName}`)

      // Удаляем уведомление после отклонения
      removeNotificationLocal(notification.id)

      return {
        success: true,
        message: 'Приглашение отклонено'
      }
    }

    return {
      success: false,
      error: 'Данный тип уведомления не поддерживает отклонение'
    }
  }

  // Обработка скрытия уведомления
  const handleDismissAction = async (notification: Notification): Promise<NotificationActionResult> => {
    console.log('Dismissing notification:', notification.id)

    // TODO: Реальный API вызов
    // await apiClient.delete(`notifications/${notification.id}`)

    removeNotificationLocal(notification.id)

    return {
      success: true,
      message: 'Уведомление удалено'
    }
  }

  // Обработка отметки как прочитанное
  const handleMarkReadAction = async (notification: Notification): Promise<NotificationActionResult> => {
    console.log('Marking as read:', notification.id)

    // TODO: Реальный API вызов
    // await apiClient.patch(`notifications/${notification.id}/read`)

    notification.isRead = true

    return {
      success: true,
      message: 'Уведомление отмечено как прочитанное'
    }
  }

  // Локальное удаление уведомления
  const removeNotificationLocal = (notificationId: string) => {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }

  // Отметить все как прочитанные
  const markAllAsRead = async () => {
    try {
      // TODO: API вызов
      // await apiClient.patch('notifications/read-all')

      notifications.value.forEach(notification => {
        notification.isRead = true
      })

      console.log('Все уведомления отмечены как прочитанные')
    } catch (err) {
      error.value = 'Не удалось отметить все уведомления как прочитанные'
      console.error('Mark all as read error:', err)
    }
  }

  // Добавить новое уведомление (для тестирования)
  const addNotification = (notification: Notification) => {
    notifications.value.unshift(notification)
  }

  // Геттеры
  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
  )

  const sortedNotifications = computed(() =>
    [...notifications.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  const notificationsByType = computed(() =>
    (type: string) => notifications.value.filter(n => n.type === type)
  )

  return {
    // Состояние
    notifications,
    isLoading,
    error,

    // Геттеры
    unreadCount,
    sortedNotifications,
    notificationsByType,

    // Методы
    fetchNotifications,
    handleNotificationAction,
    markAllAsRead,
    addNotification
  }
})
