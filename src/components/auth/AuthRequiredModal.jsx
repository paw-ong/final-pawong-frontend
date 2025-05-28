import React from 'react';
import styles from './AuthRequiredModal.module.css';
import { useNavigate } from 'react-router-dom';

const AuthRequiredModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose && onClose();
    navigate('/login');
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <h3 className={styles.title}>로그인이 필요합니다</h3>
        <p className={styles.message}>세션이 만료되었거나 로그인이 필요합니다.</p>
        <button 
          className={styles.loginButton}
          onClick={handleLogin}
        >
          로그인 페이지로 이동
        </button>
        <button
          className={styles.closeButton}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </>
  );
};

export default AuthRequiredModal; 