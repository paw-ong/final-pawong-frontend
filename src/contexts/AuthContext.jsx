// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useQueryClient } from '@tanstack/react-query'
import AuthRequiredModal from '../components/auth/AuthRequiredModal'
import client from '../api/client'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const queryClient = useQueryClient();

  // React Query 훅에서 user 데이터, 로딩/에러 상태 가져오기
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useCurrentUser()

  // 전역 이벤트 리스너 등록
  useEffect(() => {
    const handleShowAuthModal = () => {
      setShowAuthModal(true);
    };

    window.addEventListener('showAuthModal', handleShowAuthModal);

    return () => {
      window.removeEventListener('showAuthModal', handleShowAuthModal);
    };
  }, []);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await client.post('/auth/logout');
      // React Query 캐시 초기화
      queryClient.clear();
      // 로컬 스토리지의 토큰 제거
      localStorage.removeItem('token');
      navigate('/main');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 에러가 발생해도 로컬 상태는 정리
      queryClient.clear();
      localStorage.removeItem('token');
      navigate('/main');
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: Boolean(user),
      showAuthModal,
      setShowAuthModal,
      handleShowAuthModal,
      handleCloseAuthModal,
      handleLogout
    }}>
      {children}
      <AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={handleCloseAuthModal} 
      />
    </AuthContext.Provider>
  )
}