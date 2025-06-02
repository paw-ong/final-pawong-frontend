// src/firebase/NotificationButton.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../App.jsx';
import './NotificationButton.css';
import { FaBell } from 'react-icons/fa';
import { requestNotificationPermission, getNotificationPermissionStatus } from '../services/notificationService';
import NotificationGuideModal from '../components/notification/NotificationGuideModal';

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    setFcmToken,
  } = useContext(NotificationContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 읽지 않은 알림 개수
  const unreadCount = notifications?.filter(notif => !notif.read)?.length || 0;

  // 컴포넌트 마운트 시 권한 상태 확인
  useEffect(() => {
    const checkAndRequestToken = async () => {
      const currentStatus = getNotificationPermissionStatus();
      const existingToken = localStorage.getItem('fcm_token');
      console.log('현재 알림 권한 상태:', currentStatus);
      
      if (currentStatus === 'granted') {
        if (existingToken) {
          console.log('기존 FCM 토큰 발견!');
          setFcmToken(existingToken);
        } else {
          console.log('FCM 토큰 재요청 시작');
          try {
            const result = await requestNotificationPermission();
            if (result.success) {
              console.log('FCM 토큰 재발급 성공:', result.token);
              setFcmToken(result.token);
            } else {
              console.error('FCM 토큰 재발급 실패:', result.error);
            }
          } catch (error) {
            console.error('FCM 토큰 재발급 중 오류:', error);
          }
        }
      }
      
      setPermissionStatus(currentStatus);
    };

    checkAndRequestToken();
  }, [setFcmToken]);

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

  // 알림 권한 요청 처리
  const handlePermissionRequest = async () => {
    if (isRequestingPermission) return;

    console.log('NotificationButton: 알림 권한 요청 시작');
    setIsRequestingPermission(true);
    setShowGuideModal(false);

    try {
      console.log('NotificationButton: requestNotificationPermission 호출 전');
      const result = await requestNotificationPermission();
      console.log('NotificationButton: requestNotificationPermission 결과:', result);

      if (result.success) {
        setPermissionStatus('granted');
        setFcmToken(result.token);
        console.log('NotificationButton: FCM 토큰 설정 완료:', result.token);
        alert('알림이 활성화되었습니다! 🔔');
        window.location.reload();
      } else {
        setPermissionStatus('denied');
        console.log('NotificationButton: 알림 활성화 실패:', result.error);
        alert(`알림 활성화 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('NotificationButton: 알림 설정 중 오류:', error);
      alert('알림 설정 중 오류가 발생했습니다.');
      setPermissionStatus('denied');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // 사전 안내 모달 표시
  const handleShowGuide = () => {
    setShowGuideModal(true);
    setIsOpen(false);
  };

  // 알림 클릭 처리
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      console.log("이동할 URL:", notification.actionUrl);
    }
    setIsOpen(false);
  };

  // 시간 포맷팅
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // 권한 상태에 따른 버튼 클래스
  const getButtonClass = () => {
    let baseClass = 'notification-button';
    if (permissionStatus === 'granted') {
      baseClass += ' granted';
    } else if (permissionStatus === 'denied') {
      baseClass += ' denied';
    }
    return baseClass;
  };

  const getButtonTitle = () => {
    switch (permissionStatus) {
      case 'granted':
        return '알림이 활성화되었습니다';
      case 'denied':
        return '알림이 차단되었습니다. 브라우저 설정에서 허용해주세요';
      default:
        return '알림 설정하기';
    }
  };

  return (
      <>
        <div className={`notification-button-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
          <button
              className={getButtonClass()}
              onClick={() => setIsOpen(!isOpen)}
              title={getButtonTitle()}
              aria-label="알림"
          >
            <div className="notification-icon-wrapper">
              {isRequestingPermission ? (
                  '⏳'
              ) : (
                  <>
                    <FaBell />
                    {permissionStatus !== 'granted' && (
                        <span className="permission-denied-indicator">×</span>
                    )}
                  </>
              )}
            </div>
            {unreadCount > 0 && permissionStatus === 'granted' && (
                <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {isOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>알림</h3>
                  <div className="notification-actions">
                    {permissionStatus !== 'granted' && (
                        <button
                            onClick={handleShowGuide}
                            className="permission-request-btn"
                        >
                          알림 설정
                        </button>
                    )}
                    {notifications && notifications.length > 0 && (
                        <>
                          <button onClick={markAllAsRead}>모두 읽음</button>
                          <button onClick={clearAllNotifications}>모두 삭제</button>
                        </>
                    )}
                  </div>
                </div>

                {/* 권한 상태 안내 */}
                {permissionStatus === 'denied' && (
                    <div className="permission-notice denied">
                      <p>알림이 차단되었습니다.</p>
                      <p>브라우저 설정에서 알림을 허용해주세요.</p>
                      <div className="browser-settings-guide">
                        <small>주소창 왼쪽 🔒 아이콘 → 알림 → 허용</small>
                      </div>
                    </div>
                )}

                {permissionStatus === 'default' && (
                    <div className="permission-notice default">
                      <p>알림을 설정하면 새로운 소식을 받아볼 수 있어요!</p>
                      <button
                          onClick={handleShowGuide}
                          className="inline-setup-btn"
                      >
                        지금 설정하기
                      </button>
                    </div>
                )}

                <div className="notification-list">
                  {!notifications || notifications.length === 0 ? (
                      <div className="no-notifications">
                        {permissionStatus === 'granted'
                            ? '새로운 알림이 없습니다'
                            : '알림을 설정하면 새로운 소식을 받아볼 수 있어요'
                        }
                      </div>
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

        {/* 사전 안내 모달 */}
        <NotificationGuideModal
            isOpen={showGuideModal}
            onClose={() => setShowGuideModal(false)}
            onProceed={handlePermissionRequest}
        />
      </>
  );
};

export default NotificationButton;
