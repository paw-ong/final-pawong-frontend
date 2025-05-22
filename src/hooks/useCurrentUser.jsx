import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

const stored = localStorage.getItem('userPublic')
  ? JSON.parse(localStorage.getItem('userPublic'))
  : undefined

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => client.get('/user/me').then(r => r.data),
        placeholderData: stored,
        onSuccess: data => {
            // 민감하지 않은 공개필드만 골라 다시 저장
            localStorage.setItem('userPublic', JSON.stringify({
              nickname: data.nickname,
              profileImage:   data.profileImage,
              region:   data.region,
              // …이 외에 공개해도 무방한 최소한의 정보만
            }));
          },
        staleTime: 1000 * 60 * 5,    // 5분
        cacheTime: 1000 * 60 * 30,   // 30분
        refetchOnWindowFocus: false, // 창 포커스 복귀 시 재요청 안 함
    })
}