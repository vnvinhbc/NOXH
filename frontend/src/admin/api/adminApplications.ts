import api from '@/api/axios'
import type { ApiResponse } from '@/types'
import type { AdminApplicationOverviewResponse, AdminApplicationResponse, AdminApplicationStatus } from '@/admin/types'

export const adminApplicationsApi = {
  getAll: (status?: AdminApplicationStatus, limit = 250) =>
    api.get<ApiResponse<AdminApplicationResponse[]>>('/admin/applications', {
      params: { ...(status ? { status } : {}), limit },
    }),

  getOverview: () =>
    api.get<ApiResponse<AdminApplicationOverviewResponse>>('/admin/applications/overview'),

  getById: (id: string) =>
    api.get<ApiResponse<AdminApplicationResponse>>(`/admin/applications/${id}`),

  updateStatus: (id: string, status: AdminApplicationStatus, reason?: string) =>
    api.patch<ApiResponse<AdminApplicationResponse>>(`/admin/applications/${id}/status`, { status, reason }),
}
