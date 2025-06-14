// Базовые типы уведомлений
export type NotificationType =
  | 'board_invite'
  | 'team_invite'
  | 'system'
  | 'info'
  | 'warning'
  | 'success'

// Базовая структура уведомления
export interface BaseNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: Date
  isRead: boolean
  userId: string // ID пользователя, которому адресовано уведомление
}

// Данные для приглашения на доску
export interface BoardInviteData {
  boardId: string
  boardName: string
  inviterName: string
  inviterEmail: string
  inviterAvatar?: string
  role?: 'viewer' | 'editor' | 'admin'
}

// Данные для приглашения в команду
export interface TeamInviteData {
  teamId: number
  teamName: string
  inviterName: string
  inviterEmail: string
  inviterAvatar?: string
  role?: 'member' | 'admin'
}

// Системные данные
export interface SystemData {
  version?: string
  updateUrl?: string
  severity?: 'low' | 'medium' | 'high'
}

// Общие данные для информационных уведомлений
export interface InfoData {
  actionUrl?: string
  actionText?: string
}

// Объединение всех возможных данных
export type NotificationData =
  | BoardInviteData
  | TeamInviteData
  | SystemData
  | InfoData
  | null

// Полная структура уведомления
export interface Notification extends BaseNotification {
  data?: NotificationData
}

// Специализированные типы уведомлений
export interface BoardInviteNotification extends BaseNotification {
  type: 'board_invite'
  data: BoardInviteData
}

export interface TeamInviteNotification extends BaseNotification {
  type: 'team_invite'
  data: TeamInviteData
}

export interface SystemNotification extends BaseNotification {
  type: 'system'
  data?: SystemData
}

export interface InfoNotification extends BaseNotification {
  type: 'info' | 'warning' | 'success'
  data?: InfoData
}

// Действия над уведомлениями
export interface NotificationAction {
  type: 'accept' | 'reject' | 'dismiss' | 'mark_read'
  notificationId: string
  additionalData?: any
}

// Результат действия
export interface NotificationActionResult {
  success: boolean
  message?: string
  error?: string
  redirectUrl?: string
}

// Конфигурация для создания уведомления
export interface CreateNotificationConfig {
  type: NotificationType
  userId: string
  title: string
  message: string
  data?: NotificationData
  priority?: 'low' | 'normal' | 'high'
  expiresAt?: Date
}

// Фильтры для уведомлений
export interface NotificationFilters {
  type?: NotificationType[]
  isRead?: boolean
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}
