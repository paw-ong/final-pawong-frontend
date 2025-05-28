// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useQueryClient } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/common/LoadingSpinner'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()  
// React Query 훅에서 user 데이터, 로딩/에러 상태 가져오기
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser()

  useEffect(() => {
    if (!userLoading && userError) {
      navigate('/login', { replace: true });
    }
  }, [userLoading, userError, navigate]);

  if (userLoading) {
    return null
  }
  if (userError) {
    // 필요한 에러 처리
    console.error('현재 사용자 불러오기 실패')
    // 예: 로그인 페이지로 리다이렉트
    navigate('/login')
    return null
  }

  // 로그인 함수는 더 이상 토큰 로컬스토리지 직접 관리하지 않고,  
  // OAuthRedirectHandler 같은 곳에서 쿠키 세팅 후
  // React Query 캐시를 리프레시하도록 만듭니다.
  // const login = async () => {
  //   // (쿠키 세팅은 OAuthRedirectHandler에서 이미 됐다고 가정)
  //   await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  // };

  const logout = () => {
    // 서버에서 쿠키 삭제 API 호출 필요하면 클라이언트에서 요청
    document.cookie = 'ACCESS_TOKEN=; Max-Age=0; path=/;'
    // React Query 캐시 초기화
    // (queryClient.invalidateQueries('currentUser') 할 수도 있지만,
    // 간단히 새로고침 or navigate 처리)
    navigate('/login')
  }
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: Boolean(user),
      logout 
      }}>
      {children}
    </AuthContext.Provider>
  )
}
