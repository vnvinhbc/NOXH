import api from './axios'
import type { ApiResponse, NotificationResponse } from '@/types'

export const notificationApi = {
  getAll: () => api.get<ApiResponse<NotificationResponse[]>>('/notifications'),

  markAllRead: () => api.put<ApiResponse<void>>('/notifications/read-all'),
}
