import api from './axios'
import type { ApiResponse, LotteryVerificationResponse } from '@/types'

export const lotteryApi = {
  getVerification: (eventId: string) =>
    api.get<ApiResponse<LotteryVerificationResponse>>(`/lottery-events/${eventId}/verification`),
}
