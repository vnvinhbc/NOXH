import api from '@/api/axios'
import type { ApiResponse, ApartmentUnitResponse } from '@/types'

export const adminHousingStockApi = {
  getUnits: (projectId: string, status?: string) =>
    api.get<ApiResponse<ApartmentUnitResponse[]>>('/admin/housing-stock', {
      params: status && status !== 'ALL' ? { projectId, status } : { projectId },
    }),
}
