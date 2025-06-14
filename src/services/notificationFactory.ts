import type {
  Notification,
  CreateNotificationConfig,
  BoardInviteData,
  TeamInviteData,
  SystemData,
  InfoData
} from '@/types/notifications'

// Фабрика для создания уведомлений
export class NotificationFactory {

  // Базовый метод создания уведомления
  private static createBase(config: CreateNotificationConfig): Notification {
    return {
      id: this.generateId(),
      type: config.type,
      title: config.title,
      message: config.message,
      createdAt: new Date(),
      isRead: false,
      userId: config.userId,
      data: config.data
    }
  }

  // Генерация уникального ID
  private static generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Создание приглашения на доску
  static createBoardInvite(
    userId: string,
    boardData: BoardInviteData
  ): Notification {
    return this.createBase({
      type: 'board_invite',
      userId,
      title: 'Приглашение на доску',
      message: `${boardData.inviterName} пригласил вас на доску "${boardData.boardName}"`,
      data: boardData
    })
  }

  // Создание приглашения в команду
  static createTeamInvite(
    userId: string,
    teamData: TeamInviteData
  ): Notification {
    return this.createBase({
      type: 'team_invite',
      userId,
      title: 'Приглашение в команду',
      message: `${teamData.inviterName} пригласил вас в команду "${teamData.teamName}"`,
      data: teamData
    })
  }

  // Создание системного уведомления
  static createSystemNotification(
    userId: string,
    title: string,
    message: string,
    systemData?: SystemData
  ): Notification {
    return this.createBase({
      type: 'system',
      userId,
      title,
      message,
      data: systemData
    })
  }

  // Создание информационного уведомления
  static createInfoNotification(
    userId: string,
    title: string,
    message: string,
    infoData?: InfoData
  ): Notification {
    return this.createBase({
      type: 'info',
      userId,
      title,
      message,
      data: infoData
    })
  }

  // Создание уведомления об успехе
  static createSuccessNotification(
    userId: string,
    title: string,
    message: string,
    infoData?: InfoData
  ): Notification {
    return this.createBase({
      type: 'success',
      userId,
      title,
      message,
      data: infoData
    })
  }

  // Создание предупреждения
  static createWarningNotification(
    userId: string,
    title: string,
    message: string,
    infoData?: InfoData
  ): Notification {
    return this.createBase({
      type: 'warning',
      userId,
      title,
      message,
      data: infoData
    })
  }

  // Универсальный метод создания по конфигу
  static create(config: CreateNotificationConfig): Notification {
    return this.createBase(config)
  }
}

// Вспомогательные функции для быстрого создания уведомлений
export const createBoardInviteNotification = (
  userId: string,
  boardName: string,
  inviterName: string,
  inviterEmail: string,
  boardId: string,
  role: 'viewer' | 'editor' | 'admin' = 'editor'
) => {
  return NotificationFactory.createBoardInvite(userId, {
    boardId,
    boardName,
    inviterName,
    inviterEmail,
    role
  })
}

export const createTeamInviteNotification = (
  userId: string,
  teamName: string,
  inviterName: string,
  inviterEmail: string,
  teamId: number,
  role: 'member' | 'admin' = 'member'
) => {
  return NotificationFactory.createTeamInvite(userId, {
    teamId,
    teamName,
    inviterName,
    inviterEmail,
    role
  })
}
