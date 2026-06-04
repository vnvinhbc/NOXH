import api from '@/api/axios'
import type { ApiResponse, AuthResponse } from '@/types'

export const adminAuthApi = {
  login: (data: { identifier: string; password: string; otp: string }) =>
    api.post<ApiResponse<AuthResponse>>('/admin/auth/login', data),
}
