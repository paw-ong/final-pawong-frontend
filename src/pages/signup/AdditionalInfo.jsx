// src/pages/AdditionalInfo.jsx
import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../../api/client'
import { AuthContext } from '../../contexts/AuthContext'
import nicknameIcon from '../../assets/images/info/user.png'
import placeholderIcon from '../../assets/images/info/placeholder.png'
import phoneIcon from '../../assets/images/info/phone.png'
import emailIcon from '../../assets/images/info/email.svg'

export default function AdditionalInfo() {
  const [form, setForm] = useState({ nickname: '', region: '', tel: '', email: '' })
  const [errors, setErrors] = useState({})
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

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // 010으로 시작하는 11자리 숫자 또는 하이픈(-)이 포함된 형식 검사
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (value) => {
    // 숫자와 하이픈만 남기고 모두 제거
    const numbers = value.replace(/[^\d-]/g, '');
    
    // 하이픈 제거
    const cleanNumbers = numbers.replace(/-/g, '');
    
    // 11자리 숫자인 경우에만 포맷팅
    if (cleanNumbers.length === 11) {
      return `${cleanNumbers.slice(0, 3)}-${cleanNumbers.slice(3, 7)}-${cleanNumbers.slice(7)}`;
    }
    
    return numbers;
  };

  const handleChange = e => {
    const { name, value } = e.target
    
    if (name === 'tel') {
      // 전화번호 입력 시 자동 포맷팅
      const formattedValue = formatPhoneNumber(value);
      setForm(prev => ({ ...prev, [name]: formattedValue }));
      
      // 전화번호 유효성 검사
      if (!formattedValue) {
        setErrors(prev => ({ ...prev, tel: '전화번호를 입력해주세요.' }));
      } else if (!validatePhone(formattedValue)) {
        setErrors(prev => ({ ...prev, tel: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' }));
      } else {
        setErrors(prev => ({ ...prev, tel: '' }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      
      // 이메일 유효성 검사
      if (name === 'email') {
        if (!value) {
          setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요.' }));
        } else if (!validateEmail(value)) {
          setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
        } else {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      }
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    // 이메일 유효성 검사
    if (!validateEmail(form.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
      return;
    }

    // 전화번호 유효성 검사
    if (!validatePhone(form.tel)) {
      setErrors(prev => ({ ...prev, tel: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' }));
      return;
    }

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
            style={{...styles.input, borderColor: errors.tel ? '#ff4d4f' : '#ccc'}}
            name="tel"
            value={form.tel}
            placeholder="전화번호를 입력해주세요. (예: 010-1234-5678)"
            onChange={handleChange}
            required
          />
        </div>
        {errors.tel && <div style={styles.errorText}>{errors.tel}</div>}

        <div style={styles.formGroup}>
          <img 
            src={emailIcon}
            alt="이메일" 
            style={styles.labelIcon} />
          <input
            style={{...styles.input, borderColor: errors.email ? '#ff4d4f' : '#ccc'}}
            name="email"
            type="email"
            value={form.email}
            placeholder="이메일을 입력해주세요."
            onChange={handleChange}
            required
          />
        </div>
        {errors.email && <div style={styles.errorText}>{errors.email}</div>}

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
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: '0.875rem',
    marginTop: '-10px',
    marginBottom: '10px',
    marginLeft: '55px',
  },
}
