import api from './axios'
import type { ApiResponse, AuthResponse, UserResponse } from '@/types'

export const authApi = {
  register: (data: {
    fullName: string
    email: string
    phoneNumber?: string
    password: string
    dateOfBirth?: string
    gender?: string
  }) => api.post<ApiResponse<UserResponse>>('/auth/register', data),

  login: (data: { identifier: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  verifyOtp: (email: string, otp: string) =>
    api.post<ApiResponse<boolean>>('/auth/verify-otp', { email, otp }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { email, otp, newPassword }),

  refresh: () => api.post<ApiResponse<AuthResponse>>('/auth/refresh'),

  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
}
