import React from "react";
import './Login.css';
import kakaoLoginBtn from '../assets/images/login/kakao_large.png'


function Login() {

  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost/oauth2/authorization/kakao';
  };

  return (
      <div className="login-container">
        <div className="login-box">
          <p className="login-title">포옹에 오신 것을 환영합니다!</p>

          <button className="kakao-login-link"
            onClick={handleKakaoLogin}>
            <img 
              src={kakaoLoginBtn} 
              alt="카카오 로그인" 
              className="kakao-login-btn" 
              style={{ width: '100%', height: '100%' }}
            />
          </button>
        </div>
      </div>
  );
}

export default Login;