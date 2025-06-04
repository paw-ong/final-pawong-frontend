// InAppNotification.jsx 수정
import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './InAppNotification.css';

const InAppNotification = ({ notification, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    console.log('[알림 클릭] 데이터:', notification);
    
    // 직접 window.location.href 사용
    const currentPath = window.location.pathname;
    const targetPath = notification.type === 'CHAT' 
      ? `lostAnimal/detail/${notification.postId}/chat/${notification.targetId}`
      : `lostAnimal/detail/${notification.targetId}`;
    
    console.log('[알림 이동] 현재 경로:', currentPath);
    console.log('[알림 이동] 목표 경로:', targetPath);
    
    if (currentPath === `/${targetPath}`) {
      console.log('[알림 이동] 이미 같은 페이지에 있음, 새로고침');
      window.location.reload();
    } else {
      console.log('[알림 이동] 새 페이지로 이동');
      window.location.href = `${window.location.origin}/${targetPath}`;
    }
    
    onClose();
  };

  return (
    <div 
      className="in-app-notification" 
      onClick={handleClick} 
      style={{ cursor: 'pointer' }}
    >
      <div className="notification-header">
        <h4>{notification.title}</h4>
        <button 
          className="close-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          &times;
        </button>
      </div>
      <p>{notification.message}</p>
    </div>
  );
};

export default InAppNotification;
