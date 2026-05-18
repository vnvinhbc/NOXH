import api from './axios'
import type { ApiResponse, Province, District } from '@/types'

export const provinceApi = {
  getAll: () => api.get<ApiResponse<Province[]>>('/provinces'),
  getDistricts: (code: number) => api.get<ApiResponse<District>>(`/provinces/${code}/districts`),
  getWards: (code: number) => api.get<ApiResponse<District>>(`/provinces/districts/${code}/wards`),
}
