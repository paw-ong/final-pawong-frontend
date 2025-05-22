// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import client from '../api/client'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  })
  // isRegistered 은 “추가 정보 입력까지 완료되어 백엔드에 ACTIVE 상태로 저장된 회원” 인지를 나타냄
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('status') === 'ACTIVE'
  })

  useEffect(() => {
    // 앱 시작 시 토큰 있으면 로컬 스토리지에 저장
    const token = localStorage.getItem('userToken')
    const status = localStorage.getItem('status')

    // 가입 완료시 /auth/me 호출해서 user 초기화
    if (token && status === 'ACTIVE') {
      setLoading(true)
      setIsRegistered(true)
      client.get('/user/me')
        .then(res => {
          setUser(res.data)
          setIsRegistered(true)
          localStorage.setItem('userInfo', JSON.stringify(res.data))
        })
        .catch((err) => {
          const { status, code } = err
          if (status === 404 && code === 'USER_NOT_FOUND') {
            alert('존재하지 않는 회원에 대한 접근입니다.')
            navigate('/login')
          }
          localStorage.removeItem('userToken')
          localStorage.removeItem('status')
          localStorage.removeItem('userInfo')
          setUser(null)
          setIsRegistered(false)
        })
        .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }, [isRegistered])

    // 로그인 핸들러: 토큰 받은 직후 status 가 ACTIVE 이면 바로 가입 완료
    const login = async (token, statusFromQuery) => {
        localStorage.setItem('userToken', token)
        const status = statusFromQuery || (user && user.status)
        localStorage.setItem('status', status)
        if (token && status === 'ACTIVE') {
          await client.get('/user/me')
          .then(res => {
            setUser(res.data)
            setIsRegistered(true)
          })
          .catch(() => {
            console.log('login 호출 오류')
            localStorage.removeItem('userToken')
            localStorage.removeItem('status')
          })
        }

        setLoading(true)
      }
    
    // 로그아웃 핸들러
    const logout = () => {
        localStorage.removeItem('userToken')
        localStorage.removeItem('status')
        localStorage.removeItem('userInfo')
        setUser(null)
        setIsRegistered(false)
        navigate('/login')
    }
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: Boolean(user),
      login, 
      logout 
      }}>
      {children}
    </AuthContext.Provider>
  )
}
