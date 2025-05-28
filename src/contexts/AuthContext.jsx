// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useQueryClient } from '@tanstack/react-query'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate()
// React Query 훅에서 user 데이터, 로딩/에러 상태 가져오기
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser()

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
