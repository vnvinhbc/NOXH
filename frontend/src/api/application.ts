import api from './axios'
import type { ApiResponse, ApplicationResponse, DashboardResponse } from '@/types'

export const applicationApi = {
  getAll: () => api.get<ApiResponse<ApplicationResponse[]>>('/applications'),

  getById: (id: string) => api.get<ApiResponse<ApplicationResponse>>(`/applications/${id}`),

  create: (data: {
    projectId: string
    province?: string
    district?: string
    ward?: string
    detailedAddress?: string
    householdSize?: number
    priorityCategory?: string
    incomePerMonth?: number
    taxCode?: string
  }) => api.post<ApiResponse<ApplicationResponse>>('/applications', data),

  getDashboard: () => api.get<ApiResponse<DashboardResponse>>('/dashboard'),
}
