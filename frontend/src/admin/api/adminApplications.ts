import api from '@/api/axios'
import type { ApiResponse } from '@/types'
import type {
  AdminApplicationOverviewResponse,
  AdminApplicationPageResponse,
  AdminApplicationResponse,
  AdminApplicationStatus,
} from '@/admin/types'

export const adminApplicationsApi = {
  getAll: (status?: AdminApplicationStatus, page = 0, limit = 25) =>
    api.get<ApiResponse<AdminApplicationPageResponse>>('/admin/applications', {
      params: { ...(status ? { status } : {}), page, limit },
    }),

  getOverview: () =>
    api.get<ApiResponse<AdminApplicationOverviewResponse>>('/admin/applications/overview'),

  getById: (id: string) =>
    api.get<ApiResponse<AdminApplicationResponse>>(`/admin/applications/${id}`),

  updateStatus: (id: string, status: AdminApplicationStatus, reason?: string) =>
    api.patch<ApiResponse<AdminApplicationResponse>>(`/admin/applications/${id}/status`, { status, reason }),
}
