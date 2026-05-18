import api from './axios'
import type { ApiResponse, ProjectResponse } from '@/types'

export const projectApi = {
  getAll: () => api.get<ApiResponse<ProjectResponse[]>>('/projects'),
  getById: (id: string) => api.get<ApiResponse<ProjectResponse>>(`/projects/${id}`),
}
