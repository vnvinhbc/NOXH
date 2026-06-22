import api from '@/api/axios'
import type { ApiResponse, ApartmentUnitResponse } from '@/types'
import type { AdminHousingStockOverviewResponse } from '@/admin/types'

export const adminHousingStockApi = {
  getOverview: (projectId: string) =>
    api.get<ApiResponse<AdminHousingStockOverviewResponse>>('/admin/housing-stock/overview', {
      params: { projectId },
    }),

  getUnits: (projectId: string, status?: string) =>
    api.get<ApiResponse<ApartmentUnitResponse[]>>('/admin/housing-stock', {
      params: status && status !== 'ALL' ? { projectId, status } : { projectId },
    }),
}
