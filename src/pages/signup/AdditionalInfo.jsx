// src/pages/AdditionalInfo.jsx
import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../../api/client'
import { AuthContext } from '../../contexts/AuthContext'
import nicknameIcon from '../../assets/images/info/user.png'
import placeholderIcon from '../../assets/images/info/placeholder.png'
import phoneIcon from '../../assets/images/info/phone.png'
import styles from './AdditionalInfo.module.css'
import emailIcon from '../../assets/images/info/email.svg'
import { useQueryClient } from '@tanstack/react-query'

export default function AdditionalInfo() {
  const [form, setForm] = useState({ nickname: '', region: '', tel: '', email: '', verificationCode: '' })
  const [errors, setErrors] = useState({})
  const [user, setUser] = useState(null)
  const [registered, setRegistered] = useState(false)
  const navigate = useNavigate()
  const [ searchParams ] = useSearchParams();
  const token = searchParams.get('token');
  const status = searchParams.get('status');
  const [isEmailChecked, setIsEmailChecked] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const queryClient = useQueryClient();
  // useEffect(() => {
  //   if (token) {
  //     // AuthContext.login 으로 토큰 저장하고 /auth/me 호출해서 user 상태 세팅
  //     login(token)
  //     .catch(() => {
  //       alert('카카오 로그인 실패: ' + (err.response?.data?.message || err.message))
  //       navigate('/login')  
  //     })
  //   }
  // }, [searchParams, login, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

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

  const checkEmailDuplicate = async () => {
    if (!validateEmail(form.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
      return;
    }

    try {
      console.log('이메일 중복 확인 요청:', form.email);
      const response = await client.get(`/mail/is-email-exist?email=${form.email}`);
      console.log('이메일 중복 확인 응답:', response.data);
      
      if (response.data.exists) {
        setErrors(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
        setIsEmailChecked(false);
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
        setIsEmailChecked(true);
        alert('사용 가능한 이메일입니다.');
      }
    } catch (err) {
      console.error('이메일 중복 확인 에러:', err.response?.data || err);
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인 중 오류가 발생했습니다.' }));
      setIsEmailChecked(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sendVerificationCode = async () => {
    if (!isEmailChecked) {
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인이 필요합니다.' }));
      return;
    }

    setIsSendingCode(true);
    try {
      console.log('인증코드 발송 요청:', form.email);
      const response = await client.post(`/mail/six?email=${encodeURIComponent(form.email)}`);
      console.log('인증코드 발송 응답:', response.data);
      
      setCountdown(1800); // 30분 = 1800초
      alert('인증코드가 이메일로 발송되었습니다.');
    } catch (err) {
      console.error('인증코드 발송 에러:', err.response?.data || err);
      if (err.response?.data?.message) {
        setErrors(prev => ({ ...prev, email: err.response.data.message }));
      } else {
        setErrors(prev => ({ ...prev, email: '인증코드 발송 중 오류가 발생했습니다.' }));
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!form.verificationCode) {
      setErrors(prev => ({ ...prev, verificationCode: '인증코드를 입력해주세요.' }));
      return;
    }

    try {
      console.log('인증코드 검증 요청:', form.verificationCode);
      const response = await client.post('/mail/verifications', {
        email: form.email,
        authCode: form.verificationCode
      });
      console.log('인증코드 검증 응답:', response.data);
      
      if (response.data) {
        setIsEmailVerified(true);
        setCountdown(0);
        alert('이메일 인증이 완료되었습니다.');
      } else {
        setErrors(prev => ({ ...prev, verificationCode: '인증코드가 일치하지 않습니다.' }));
      }
    } catch (err) {
      console.error('인증코드 검증 에러:', err.response?.data || err);
      if (err.response?.data?.message) {
        setErrors(prev => ({ ...prev, verificationCode: err.response.data.message }));
      } else {
        setErrors(prev => ({ ...prev, verificationCode: '인증코드가 일치하지 않습니다.' }));
      }
    }
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
      
      // 이메일이 변경되면 중복 확인 상태 초기화
      if (name === 'email') {
        setIsEmailChecked(false);
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

    // 이메일 중복 확인 여부 검사
    if (!isEmailChecked) {
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인이 필요합니다.' }));
      return;
    }

    // 이메일 인증 여부 검사
    if (!isEmailVerified) {
      setErrors(prev => ({ ...prev, email: '이메일 인증이 필요합니다.' }));
      return;
    }

    // 전화번호 유효성 검사
    if (!validatePhone(form.tel)) {
      setErrors(prev => ({ ...prev, tel: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' }));
      return;
    }

    try {
      const { verificationCode, ...signupData } = form;
      
      console.log('회원가입 요청 데이터:', {
        ...signupData,
        token,
        status
      });
      
      const res = await client.post('/auth/signup', signupData)
      console.log('회원가입 응답:', res.data);
      
      if(res.data.status === 'ACTIVE') {
        // 사용자 정보 캐시 무효화 및 갱신
        await queryClient.invalidateQueries(['currentUser']);
        console.log('로그인 성공, 메인 페이지로 이동');
        navigate('/main')
      } else {
        console.error('회원가입 실패:', res.response?.data?.message || res.message);
        alert('회원가입 실패: ' + (res.response?.data?.message || res.message))
      }
    } catch (err) {
      console.error('회원가입 에러:', err.response?.data || err);
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
          <div style={styles.emailContainer}>
            <input
              style={{...styles.input, borderColor: errors.email ? '#ff4d4f' : '#ccc'}}
              name="email"
              type="email"
              value={form.email}
              placeholder="이메일을 입력해주세요."
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={checkEmailDuplicate}
              style={styles.checkButton}
              disabled={!form.email || !validateEmail(form.email)}
            >
              중복확인
            </button>
          </div>
        </div>
        {errors.email && <div style={styles.errorText}>{errors.email}</div>}

        {isEmailChecked && !isEmailVerified && (
          <div style={styles.verificationContainer}>
            <div style={styles.verificationInputContainer}>
              <input
                style={{...styles.input, borderColor: errors.verificationCode ? '#ff4d4f' : '#ccc'}}
                name="verificationCode"
                value={form.verificationCode}
                placeholder="인증코드 6자리"
                onChange={handleChange}
                maxLength={6}
              />
              <button
                type="button"
                onClick={sendVerificationCode}
                style={styles.checkButton}
                disabled={isSendingCode || countdown > 0}
              >
                {countdown > 0 ? `재발송 (${formatTime(countdown)})` : '인증코드 발송'}
              </button>
            </div>
            {countdown > 0 && (
              <>
                <div style={styles.verificationActions}>
                  <button
                    type="button"
                    onClick={verifyCode}
                    style={styles.verifyButton}
                  >
                    인증하기
                  </button>
                  <span style={styles.countdownText}>
                    남은 시간: {formatTime(countdown)}
                  </span>
                </div>
                {errors.verificationCode && (
                  <div style={{...styles.errorText, marginLeft: 0, marginTop: 8}}>{errors.verificationCode}</div>
                )}
              </>
            )}
          </div>
        )}

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
  emailContainer: {
    display: 'flex',
    gap: '10px',
    flex: 1,
  },
  checkButton: {
    padding: '8px 16px',
    fontSize: '0.875rem',
    borderRadius: '4px',
    backgroundColor: '#EAD8C0',
    color: '#3E3232',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.3s ease',
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
  },
  verificationContainer: {
    marginLeft: '55px',
    marginBottom: '15px',
  },
  verificationInputContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  verificationActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  verifyButton: {
    padding: '8px 16px',
    fontSize: '0.875rem',
    borderRadius: '4px',
    backgroundColor: '#EAD8C0',
    color: '#3E3232',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  countdownText: {
    fontSize: '0.875rem',
    color: '#666',
  },
}
