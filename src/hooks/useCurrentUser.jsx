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
        staleTime: 1000 * 60 * 5,    // 5분
        cacheTime: 1000 * 60 * 30,   // 30분
        refetchOnWindowFocus: true, // 창 포커스 복귀 시 재요청
        refetchOnMount: true, // 컴포넌트 마운트 시 재요청
    })
}