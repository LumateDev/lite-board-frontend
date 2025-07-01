import { apiClient } from './axios'

export interface BoardCreate {
  title: string
  is_public: boolean
}

export interface BoardOut {
  id: string
  title: string
  owner_id: string
  created_at: string
  is_public: boolean
}

export const boardApi = {
  // Создание новой доски
  createBoard: async (boardData: BoardCreate): Promise<BoardOut> => {
    const response = await apiClient.post<BoardOut>('/boards/', boardData)
    return response.data
  },

  // Получение списка досок пользователя
  getMyBoards: async (): Promise<BoardOut[]> => {
    const response = await apiClient.get<BoardOut[]>('/boards/')
    return response.data
  },

  // Получение конкретной доски по ID
  getBoard: async (boardId: string): Promise<BoardOut> => {
    const response = await apiClient.get<BoardOut>(`/boards/${boardId}`)
    return response.data
  },

  // Обновление доски
  updateBoard: async (boardId: string, boardData: Partial<BoardCreate>): Promise<BoardOut> => {
    const response = await apiClient.put<BoardOut>(`/boards/${boardId}`, boardData)
    return response.data
  },

  // Удаление доски
  deleteBoard: async (boardId: string): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}`)
  }
} 