// NotificationButton.jsx 수정
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../App.jsx';
import './NotificationButton.css';
import { FaBell } from 'react-icons/fa';

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useContext(NotificationContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // useNavigate 훅 사용

  // 읽지 않은 알림 개수
  const unreadCount = notifications?.filter(notif => !notif.read)?.length || 0;

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 알림 클릭 처리
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl); // window.location.href 대신 navigate 사용
      console.log("이동할 URL:", notification.actionUrl); // 디버깅용
    }
    setIsOpen(false);
  };

  // 시간 포맷팅
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
      <div className="notification-button-container" ref={dropdownRef}>
        <button
            className="notification-button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="알림"
        >
          <FaBell />
          {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {isOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>알림</h3>
                <div className="notification-actions">
                  <button onClick={markAllAsRead}>모두 읽음</button>
                  <button onClick={clearAllNotifications}>모두 삭제</button>
                </div>
              </div>

              <div className="notification-list">
                {!notifications || notifications.length === 0 ? (
                    <div className="no-notifications">알림이 없습니다</div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="notification-content">
                            <h4>{notif.title}</h4>
                            <p>{notif.message}</p>
                            <span className="notification-time">{formatTime(notif.timestamp)}</span>
                          </div>
                          <button
                              className="delete-notification"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                          >
                            ×
                          </button>
                        </div>
                    ))
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default NotificationButton;
