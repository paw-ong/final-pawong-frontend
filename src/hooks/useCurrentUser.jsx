import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => client.get('/user/me', {
            headers: {
                'X-Skip-Auth-Error': 'true'
            }
        }).then(r => r.data),
        retry: 1,
        staleTime: 0,                // 항상 최신 데이터로 간주
        cacheTime: 1000 * 60 * 5,   // 5분 동안 캐시 유지
        refetchOnWindowFocus: true, // 창 포커스 시 재요청
        refetchOnMount: true,       // 컴포넌트 마운트 시 재요청
        refetchOnReconnect: true,   // 네트워크 재연결 시 재요청
    })
}