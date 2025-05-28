import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => client.get('/user/me').then(r => r.data),
        retry: false,
        staleTime: 1000 * 60 * 5,    // 5분
        cacheTime: 1000 * 60 * 30,   // 30분
        refetchOnWindowFocus: false, // 창 포커스 복귀 시 재요청 안 함
    })
}