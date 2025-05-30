import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Team, TeamMember } from '@/interfaces'
import { apiClient } from '@/api/axios'

export const useTeamStore = defineStore('team', () => {
  // Состояние хранилища
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Инициализация тестовых данных (только при первом вызове)
  // const initMockData = () => {
  //   if (teams.value.length > 0) return
  //
  //   teams.value = [
  //     {
  //       id: 1,
  //       name: 'Основная команда',
  //       members: [
  //         {
  //           id: 1,
  //           name: 'Администратор',
  //           email: 'admin@example.com',
  //           role: 'admin',
  //           joinedAt: new Date()
  //         }
  //       ],
  //       createdAt: new Date()
  //     },
  //     {
  //       id: 2,
  //       name: 'Разработчики',
  //       members: [
  //         {
  //           id: 2,
  //           name: 'Разработчик',
  //           email: 'dev@example.com',
  //           role: 'member',
  //           joinedAt: new Date()
  //         }
  //       ],
  //       createdAt: new Date()
  //     }
  //   ]
  // }

  // Загрузка команд (с сохранением существующих данных)
  const fetchTeams = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await apiClient.get('auth/teams')
      const newTeams: Team[] = response.data.map((team: any) => ({
        ...team,
        createdAt: new Date(team.createdAt),
        members: team.members.map((m: any) => ({
          ...m,
          joinedAt: new Date(m.joinedAt)
        }))
      }))
      teams.value = newTeams
      return newTeams
    } catch (err) {
      error.value = 'Не удалось загрузить команды'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // Создание новой команды
  const createTeam = async (name: string) => {
    try {
      isLoading.value = true
      const response = await apiClient.post('auth/teams/create', { name })
      const newTeam: Team = {
        id: response.data.id,
        name,
        members: [],
        createdAt: new Date(response.data.createdAt),
      }
      teams.value.push(newTeam)
      return newTeam
    } catch (err) {
      error.value = 'Не удалось создать команду'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Удаление команды
  const deleteTeam = async (id: number) => {
    try {
      isLoading.value = true
      teams.value = teams.value.filter(team => team.id !== id)
      if (currentTeam.value?.id === id) {
        currentTeam.value = null
      }
    } catch (err) {
      error.value = 'Не удалось удалить команду'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Обновление команды
  const updateTeam = async (updatedTeam: Team) => {
    try {
      isLoading.value = true
      const index = teams.value.findIndex(t => t.id === updatedTeam.id)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }
      if (currentTeam.value?.id === updatedTeam.id) {
        currentTeam.value = updatedTeam
      }
    } catch (err) {
      error.value = 'Не удалось обновить команду'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Установка текущей команды
  const setCurrentTeam = (team: Team | null) => {
    currentTeam.value = team
  }

  // Приглашение участника
  const inviteMember = async (teamId: number, email: string) => {
    try {
      isLoading.value = true
      const teamIndex = teams.value.findIndex(t => t.id === teamId)
      if (teamIndex !== -1) {
        const newMember: TeamMember = {
          id: Date.now(),
          name: email.split('@')[0],
          email,
          role: 'member',
          joinedAt: new Date()
        }

        teams.value[teamIndex].members.push(newMember)

        if (currentTeam.value?.id === teamId) {
          currentTeam.value = { ...teams.value[teamIndex] }
        }
      }
    } catch (err) {
      error.value = 'Ошибка приглашения участника'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Изменение роли участника
  const updateMemberRole = async (teamId: number, memberId: number, role: 'member' | 'admin') => {
    try {
      isLoading.value = true
      const team = teams.value.find(t => t.id === teamId)
      if (team) {
        const member = team.members.find(m => m.id === memberId)
        if (member) {
          member.role = role
        }

        if (currentTeam.value?.id === teamId) {
          const currentMember = currentTeam.value.members.find(m => m.id === memberId)
          if (currentMember) {
            currentMember.role = role
          }
        }
      }
    } catch (err) {
      error.value = 'Ошибка изменения роли'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Удаление участника
  const removeMember = async (teamId: number, memberId: number) => {
    try {
      isLoading.value = true
      const team = teams.value.find(t => t.id === teamId)
      if (team) {
        team.members = team.members.filter(m => m.id !== memberId)

        if (currentTeam.value?.id === teamId) {
          currentTeam.value.members = currentTeam.value.members.filter(m => m.id !== memberId)
        }
      }
    } catch (err) {
      error.value = 'Ошибка удаления участника'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Состояние
    teams,
    currentTeam,
    isLoading,
    error,

    // Методы для команд
    fetchTeams,
    createTeam,
    deleteTeam,
    updateTeam,
    setCurrentTeam,

    // Методы для участников
    inviteMember,
    updateMemberRole,
    removeMember
  }
})
