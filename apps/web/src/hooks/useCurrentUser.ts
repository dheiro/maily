import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { queryKeys } from '../lib/query-keys'

export function useCurrentUser() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: api.auth.me,
    retry: false,
    staleTime: Infinity,
  })

  return {
    user: data?.username ?? null,
    loading: isLoading,
  }
}
