// src/components/notification/NotificationGuideModal.jsx
import React from 'react';
import './NotificationGuideModal.css';

const NotificationGuideModal = ({ isOpen, onClose, onProceed }) => {
  if (!isOpen) return null;

  return (
      <div className="notification-guide-overlay">
        <div className="notification-guide-modal">
          <div className="notification-guide-header">
            <h3>🔔 알림 설정 안내</h3>
            <button className="guide-close-button" onClick={onClose}>×</button>
          </div>

          <div className="notification-guide-content">
            <div className="guide-intro">
              <p>포옹에서 새로운 소식을 알려드릴게요!</p>
              <ul>
                <li>실종 동물과 유사한 공고 알림</li>
                <li>채팅 메시지 알림</li>
              </ul>
            </div>

            <div className="guide-steps">
              <h4>📱 설정 방법</h4>
              <div className="step">
                <span className="step-number">1</span>
                <p>아래 '알림 허용하기' 버튼을 클릭하세요</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>브라우저에서 알림 권한 요청이 나타나면</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p><strong>'허용'</strong> 버튼을 클릭해주세요</p>
              </div>
            </div>

            <div className="browser-preview">
              <div className="browser-mockup">
                <div className="browser-notification">
                  <span className="notification-icon">🔒</span>
                  <span className="notification-text">포옹이 알림을 보내려고 합니다</span>
                  <div className="notification-buttons">
                    <button className="block-btn">차단</button>
                    <button className="allow-btn">허용</button>
                  </div>
                </div>
              </div>
              <p className="guide-tip">👆 위와 같은 창에서 <strong>'허용'</strong>을 선택해주세요!</p>
            </div>
          </div>

          <div className="notification-guide-footer">
            <button className="guide-cancel-btn" onClick={onClose}>
              나중에 하기
            </button>
            <button className="guide-proceed-btn" onClick={onProceed}>
              알림 허용하기
            </button>
          </div>
        </div>
      </div>
  );
};

export default NotificationGuideModal;
