import apiClient from '../../../lib/axios'
import type { DashboardData } from '../types'

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData>('/dashboard')
  return response.data
}
