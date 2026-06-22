import api from '@/api/axios'
import type { ApiResponse, ApartmentUnitResponse, LotteryEventResponse } from '@/types'

export const adminLotteryApi = {
  getEvents: () => api.get<ApiResponse<LotteryEventResponse[]>>('/admin/lottery-events'),

  createEvent: (data: { projectId: string; name: string; scheduledStartAt: string }) =>
    api.post<ApiResponse<LotteryEventResponse>>('/admin/lottery-events', data),

  deleteEvent: (eventId: string) =>
    api.delete<ApiResponse<void>>(`/admin/lottery-events/${eventId}`),

  lockEvent: (eventId: string) =>
    api.post<ApiResponse<LotteryEventResponse>>(`/admin/lottery-events/${eventId}/lock`),

  startEvent: (eventId: string, data: {
    xsmbDrawDate: string
    xsmbResult: string
    ethChainId: number
    ethBlockNumber: number
    ethBlockHash: string
    sourceNote?: string
  }) => api.post<ApiResponse<LotteryEventResponse>>(`/admin/lottery-events/${eventId}/start`, data),

  getAvailableApartments: (projectId: string) =>
    api.get<ApiResponse<ApartmentUnitResponse[]>>('/admin/lottery-events/apartment-units', {
      params: { projectId },
    }),
}
