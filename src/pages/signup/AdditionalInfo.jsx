// src/pages/AdditionalInfo.jsx
import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../../api/client'
import { AuthContext } from '../../contexts/AuthContext'
import nicknameIcon from '../../assets/images/info/user.png'
import placeholderIcon from '../../assets/images/info/placeholder.png'
import phoneIcon from '../../assets/images/info/phone.png'

export default function AdditionalInfo() {
  const [form, setForm] = useState({ nickname: '', region: '', tel: '' })
  const [user, setUser] = useState(null)
  const [registered, setRegistered] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext);
  const [ searchParams ] = useSearchParams();
  const token = searchParams.get('token');
  const status = searchParams.get('status');
  useEffect(() => {
    if (token) {
      // AuthContext.login 으로 토큰 저장하고 /auth/me 호출해서 user 상태 세팅
      login(token)
      .catch(() => {
        alert('카카오 로그인 실패: ' + (err.response?.data?.message || err.message))
        navigate('/login')  
      })
    }
  }, [searchParams, login, navigate]);

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await client.post('/auth/signup', form)
      if(res.data.status === 'ACTIVE') {
        await login(token, 'ACTIVE')
        // const userRes = await client.get('/user/me')
        // localStorage.setItem('userInfo', JSON.stringify(userRes.data))
        // setUser(userRes.data)
        // setRegistered(true)
        navigate('/main')
      } else {
        alert('회원가입 실패: ' + (res.response?.data?.message || res.message))
      }
    } catch (err) {
      alert('회원가입 실패: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div style={styles.container} className="additional-info-container">
      <h2 style={styles.title}>추가 정보 입력</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <img 
            src={nicknameIcon} 
            alt="닉네임" 
            style={styles.labelIcon} />
          <input
            style={styles.input}
            name="nickname"
            value={form.nickname}
            placeholder="닉네임을 입력해주세요."
            onChange={handleChange}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <img 
            src={placeholderIcon} 
            alt="지역" 
            style={styles.labelIcon} />
          <input
            style={styles.input}
            name="region"
            value={form.region}
            placeholder="지역을 입력해주세요."
            onChange={handleChange}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <img 
            src={phoneIcon}
            alt="전화번호" 
            style={styles.labelIcon} />
          <input
            style={styles.input}
            name="tel"
            value={form.tel}
            placeholder="전화번호를 입력해주세요."
            onChange={handleChange}
            required
          />
        </div>

        <button style={styles.button} type="submit">
          완료
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  title: {
    marginBottom: '20px',
    fontSize: '1.5rem',
    color: '#3E3232',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    display: 'flex',          // 가로 배치
    alignItems: 'center',     // 수직 중앙 정렬
    marginBottom: '15px',
  },
  label: {
    width: '90px',            // 라벨 고정 너비 (원하는 만큼 조절)
    marginRight: '10px',      // 라벨과 input 사이 간격
    fontSize: '1rem',
    color: '#3E3232',
    marginBottom: 0,          // flex row 에서 아래 여백 제거
  },
  labelIcon: {
    width: '25px',
    height: '25px',
    marginRight: '30px',
  },
  input: {
    flex: 1,                  // 남은 공간 모두 차지
    padding: '8px',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    marginTop: '24px',
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '5px',
    backgroundColor: '#EAD8C0',
    color: '#3E3232',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  }
}
