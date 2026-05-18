import api from './axios'
import type { ApiResponse, UserResponse } from '@/types'

export const userApi = {
  getMyInfo: () => api.get<ApiResponse<UserResponse>>('/users/my-info'),

  updateProfile: (data: {
    fullName?: string
    phoneNumber?: string
    dateOfBirth?: string
    gender?: string
    province?: string
    district?: string
    ward?: string
    currentAddress?: string
    occupation?: string
    incomePerMonth?: number
    householdSize?: number
    priorityCategory?: string
  }) => api.put<ApiResponse<UserResponse>>('/users/my-info', data),

  submitKyc: (data: {
    fullName: string
    dateOfBirth?: string
    gender?: string
    cccdNumber: string
    permanentAddress?: string
    province?: string
    district?: string
    ward?: string
    occupation?: string
    incomePerMonth?: number
    householdSize?: number
    priorityCategory?: string
  }) => api.post<ApiResponse<UserResponse>>('/users/kyc', data),
}
