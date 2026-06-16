import api from './axios'
import type { ApiResponse, LotteryVerificationResponse, UserLotterySummaryResponse } from '@/types'

export const lotteryApi = {
  getVerification: (eventId: string) =>
    api.get<ApiResponse<LotteryVerificationResponse>>(`/lottery-events/${eventId}/verification`),

  getMySummary: () =>
    api.get<ApiResponse<UserLotterySummaryResponse>>('/lottery-events/my-summary'),
}
