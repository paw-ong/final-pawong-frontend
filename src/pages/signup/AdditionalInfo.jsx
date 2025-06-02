// src/pages/AdditionalInfo.jsx
import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../../api/client'
import { AuthContext } from '../../contexts/AuthContext'
import nicknameIcon from '../../assets/images/info/user.png'
import placeholderIcon from '../../assets/images/info/placeholder.png'
import phoneIcon from '../../assets/images/info/phone.png'
import styles from './AdditionalInfo.module.css'

export default function AdditionalInfo() {
  const [form, setForm] = useState({ nickname: '', region: '', tel: '' })
  const [user, setUser] = useState(null)
  const [registered, setRegistered] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const [ searchParams ] = useSearchParams()
  const token = searchParams.get('token')
  const status = searchParams.get('status')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (token) {
      login(token)
      .catch(() => {
        alert('카카오 로그인 실패: ' + (err.response?.data?.message || err.message))
        navigate('/login')  
      })
    }
  }, [searchParams, login, navigate])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await client.post('/auth/signup', form)
      if(res.data.status === 'ACTIVE') {
        await login(token, 'ACTIVE')
        navigate('/main')
      } else {
        alert('회원가입 실패: ' + (res.response?.data?.message || res.message))
      }
    } catch (err) {
      alert('회원가입 실패: ' + (err.response?.data?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>추가 정보 입력</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <img 
            src={nicknameIcon} 
            alt="닉네임" 
            className={styles.labelIcon} />
          <input
            className={styles.input}
            name="nickname"
            value={form.nickname}
            placeholder="닉네임을 입력해주세요."
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <img 
            src={placeholderIcon} 
            alt="지역" 
            className={styles.labelIcon} />
          <input
            className={styles.input}
            name="region"
            value={form.region}
            placeholder="지역을 입력해주세요."
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <img 
            src={phoneIcon}
            alt="전화번호" 
            className={styles.labelIcon} />
          <input
            className={styles.input}
            name="tel"
            value={form.tel}
            placeholder="전화번호를 입력해주세요."
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리중...' : '완료'}
        </button>
      </form>
    </div>
  )
}
