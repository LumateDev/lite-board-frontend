import { apiClient } from './axios'

// Пригласить пользователя в команду
export async function inviteUserToTeam(teamId: string, email: string) {
  return apiClient.post(`/auth/teams/${teamId}/invite`, { email })
}

// Ответить на приглашение (accept/reject)
export async function respondToInvite(teamId: string, status: 'accepted' | 'rejected') {
  return apiClient.post('/auth/teams/respond', { team_id: teamId, status })
} 