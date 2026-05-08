import apiClient from '../../../lib/axios'
import type { LoginRequest, LoginResponse, SignupVerifyRequest, SignupRequest } from '../types'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  verifySignup: async (data: SignupVerifyRequest): Promise<void> => {
    await apiClient.post('/auth/signup/verify', data)
  },

  signup: async (data: SignupRequest): Promise<void> => {
    await apiClient.post('/auth/signup', data)
  },
}
