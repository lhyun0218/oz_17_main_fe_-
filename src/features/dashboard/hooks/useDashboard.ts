import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/dashboardApi'

export const useDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 1000 * 60 * 5, // 5분
  })

  return { data, isLoading, isError }
}
