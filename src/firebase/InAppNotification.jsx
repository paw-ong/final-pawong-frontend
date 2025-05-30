// InAppNotification.jsx 수정
import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './InAppNotification.css';

const InAppNotification = ({ title, message, onClose, actionUrl }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleAction = () => {
    if (actionUrl) {
      navigate(actionUrl); // window.location.href 대신 navigate 사용
    }
    onClose();
  };

  return (
      <div className="in-app-notification">
        <div className="notification-header">
          <h4>{title}</h4>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <p>{message}</p>
        {actionUrl && (
            <button className="action-btn" onClick={handleAction}>
              상세 보기
            </button>
        )}
      </div>
  );
};

export default InAppNotification;
