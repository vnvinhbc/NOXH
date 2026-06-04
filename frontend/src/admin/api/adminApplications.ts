import api from '@/api/axios'
import type { ApiResponse } from '@/types'
import type { AdminApplicationResponse, AdminApplicationStatus } from '@/admin/types'

export const adminApplicationsApi = {
  getAll: (status?: AdminApplicationStatus) =>
    api.get<ApiResponse<AdminApplicationResponse[]>>('/admin/applications', {
      params: status ? { status } : undefined,
    }),

  updateStatus: (id: string, status: AdminApplicationStatus, reason?: string) =>
    api.patch<ApiResponse<AdminApplicationResponse>>(`/admin/applications/${id}/status`, { status, reason }),
}
