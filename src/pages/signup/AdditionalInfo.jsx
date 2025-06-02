import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../../api/client'
import { AuthContext } from '../../contexts/AuthContext'
import nicknameIcon from '../../assets/images/info/user.png'
import placeholderIcon from '../../assets/images/info/placeholder.png'
import phoneIcon from '../../assets/images/info/phone.png'
import emailIcon from '../../assets/images/info/email.svg'
import { useQueryClient } from '@tanstack/react-query'
import styles from './AdditionalInfo.module.css'

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

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    
    if (name === 'tel') {
      const formattedValue = formatPhoneNumber(value);
      setForm(prev => ({ ...prev, [name]: formattedValue }));
      
      if (errors.tel) {
        setErrors(prev => ({ ...prev, tel: '' }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      
      if (name === 'email') {
        setIsEmailChecked(false);
        setIsEmailVerified(false);
        if (errors.email) {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      }
      
      if (name === 'verificationCode' && errors.verificationCode) {
        setErrors(prev => ({ ...prev, verificationCode: '' }));
      }
    }
  };

  const checkEmailDuplicate = async () => {
    if (!validateEmail(form.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
      return;
    }

    try {
      const response = await client.post('/auth/check-email', { email: form.email });
      if (response.data.available) {
        setIsEmailChecked(true);
        setErrors(prev => ({ ...prev, email: '' }));
        alert('사용 가능한 이메일입니다.');
      } else {
        setErrors(prev => ({ ...prev, email: '이미 사용 중인 이메일입니다.' }));
      }
    } catch (error) {
      console.error('이메일 중복 확인 실패:', error);
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인에 실패했습니다.' }));
    }
  };

  const sendVerificationCode = async () => {
    if (!isEmailChecked) {
      setErrors(prev => ({ ...prev, email: '이메일 중복 확인을 먼저 해주세요.' }));
      return;
    }

    setIsSendingCode(true);
    try {
      await client.post('/auth/send-verification', { email: form.email });
      setCountdown(300); // 5분
      alert('인증코드가 발송되었습니다.');
    } catch (error) {
      console.error('인증코드 발송 실패:', error);
      alert('인증코드 발송에 실패했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!form.verificationCode || form.verificationCode.length !== 6) {
      setErrors(prev => ({ ...prev, verificationCode: '6자리 인증코드를 입력해주세요.' }));
      return;
    }

    try {
      const response = await client.post('/auth/verify-code', {
        email: form.email,
        code: form.verificationCode
      });
      
      if (response.data.verified) {
        setIsEmailVerified(true);
        setCountdown(0);
        setErrors(prev => ({ ...prev, verificationCode: '' }));
        alert('이메일 인증이 완료되었습니다.');
      } else {
        setErrors(prev => ({ ...prev, verificationCode: '인증코드가 올바르지 않습니다.' }));
      }
    } catch (error) {
      console.error('인증코드 확인 실패:', error);
      setErrors(prev => ({ ...prev, verificationCode: '인증코드 확인에 실패했습니다.' }));
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
            style={{borderColor: errors.tel ? '#ff4d4f' : '#ccc'}}
            name="tel"
            value={form.tel}
            placeholder="전화번호를 입력해주세요. (예: 010-1234-5678)"
            onChange={handleChange}
            required
          />
        </div>
        {errors.tel && <div className={styles.errorText}>{errors.tel}</div>}

        <div className={styles.formGroup}>
          <img 
            src={emailIcon}
            alt="이메일" 
            className={styles.labelIcon} />
          <div className={styles.emailContainer}>
            <input
              className={styles.input}
              style={{borderColor: errors.email ? '#ff4d4f' : '#ccc'}}
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
              className={styles.checkButton}
              disabled={!form.email || !validateEmail(form.email)}
            >
              중복확인
            </button>
          </div>
        </div>
        {errors.email && <div className={styles.errorText}>{errors.email}</div>}

        {isEmailChecked && !isEmailVerified && (
          <div className={styles.verificationContainer}>
            <div className={styles.verificationInputContainer}>
              <input
                className={styles.input}
                style={{borderColor: errors.verificationCode ? '#ff4d4f' : '#ccc'}}
                name="verificationCode"
                value={form.verificationCode}
                placeholder="인증코드 6자리"
                onChange={handleChange}
                maxLength={6}
              />
              <button
                type="button"
                onClick={sendVerificationCode}
                className={styles.checkButton}
                disabled={isSendingCode || countdown > 0}
              >
                {countdown > 0 ? `재발송 (${formatTime(countdown)})` : '인증코드 발송'}
              </button>
            </div>
            {countdown > 0 && (
              <>
                <div className={styles.verificationActions}>
                  <button
                    type="button"
                    onClick={verifyCode}
                    className={styles.verifyButton}
                  >
                    인증하기
                  </button>
                  <span className={styles.countdownText}>
                    남은 시간: {formatTime(countdown)}
                  </span>
                </div>
                {errors.verificationCode && (
                  <div className={styles.errorText} style={{marginLeft: 0, marginTop: 8}}>{errors.verificationCode}</div>
                )}
              </>
            )}
          </div>
        )}

        <button className={styles.button} type="submit">
          완료
        </button>
      </form>
    </div>
  )
}
