import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
function OAuthRedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const queryClient = useQueryClient();
  
    useEffect(() => {
      const status = searchParams.get('status');
  
        if (status === 'ACTIVE') {
            console.log('가입 완료');
            queryClient
            .invalidateQueries(['currentUser'])
            .then(() => {
              navigate('/main', { replace: true });
            });
        } else {
            console.log('추가 정보 입력 필요');
            navigate('/signup/additional-info');  // 추가 정보 입력 필요
        }
    }, [searchParams, navigate]);
  
    return <div>로그인 처리 중...</div>;
  }

export default OAuthRedirectHandler;
