import React, {useContext, useEffect, useState} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Adoption from "./pages/adoptionAnimal/Adoption.jsx";
import LostAnimal from "./pages/lostanimal/LostAnimal.jsx";
import MainPage from "./pages/mainPage/MainPage.jsx";
import Login from "./pages/signup/Login.jsx";
import MyPage from "./pages/myPage/MyPage.jsx";
import AdoptionDetail from "./pages/adoptionAnimal/AdoptionDetail.jsx";
import LostAnimalDetail from "./pages/lostanimal/LostAnimalDetail.jsx";
import LostAnimalCreate from "./pages/lostanimal/LostAnimalCreate.jsx";
import OAuthRedirectHandler from "./components/auth/OAuthRedirectHandler.jsx";
import AdditionalInfo from "./pages/signup/AdditionalInfo.jsx";
import { AuthContext } from "./contexts/AuthContext";
import LostAnimalUpdate from "./pages/lostanimal/LostAnimalUpdate.jsx";
import ChatRoom from "./pages/chat/ChatRoom.jsx";
import InAppNotification from "./firebase/InAppNotification.jsx";
import { createContext } from "react";
import { initializeForegroundMessaging, getNotificationPermissionStatus, requestNotificationPermission } from "./services/notificationService";
import NotificationGuideModal from "./components/notification/NotificationGuideModal";

// 알림 상태를 공유하기 위한 Context 생성
export const NotificationContext = createContext();

function App() {
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const { user } = useContext(AuthContext);
  const [hasRequestedToken, setHasRequestedToken] = useState(false);

  // FCM 토큰 요청 및 알림 권한 처리 (로그인 시 한 번만)
  useEffect(() => {
    const requestToken = async () => {
      if (!user || hasRequestedToken) return;

      const permissionStatus = getNotificationPermissionStatus();

      if (permissionStatus === 'granted') {
        try {
          const result = await requestNotificationPermission();
          if (result.success) {
            setHasRequestedToken(true);
          }
        } catch (error) {
          console.error('토큰 요청 실패:', error);
        }
      } else if (permissionStatus === 'default' && !sessionStorage.getItem('notification-guide-shown')) {
        setShowGuideModal(true);
        sessionStorage.setItem('notification-guide-shown', 'true');
      }
    };

    requestToken();
  }, [user]);

  // 로그아웃 시 상태 초기화
  useEffect(() => {
    if (!user) {
      setHasRequestedToken(false);
      sessionStorage.removeItem('notification-guide-shown');
    }
  }, [user]);

  // FCM 포그라운드 메시지 리스너 초기화 (로그인 시 한 번만)
  useEffect(() => {
    if (user) {
      initializeForegroundMessaging();
    }
  }, [user]);

  // 사전 안내 모달 닫기
  const handleGuideModalClose = () => {
    setShowGuideModal(false);
  };

  // 사전 안내 모달에서 권한 요청 진행
  const handleGuideModalProceed = async () => {
    setShowGuideModal(false);

    try {
      const result = await requestNotificationPermission();
      if (result.success) {
        setHasRequestedToken(true);
        alert('알림이 활성화되었습니다! 🔔');
      } else {
        alert(`알림 활성화 실패: ${result.error}`);
      }
    } catch (error) {
      alert('알림 설정 중 오류가 발생했습니다.');
    }
  };

  // 알림 관련 함수들
  const markAsRead = (id) => {
    setNotifications(prev =>
        prev.map(notif =>
            notif.id === id ? {...notif, read: true} : notif
        )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
        prev.map(notif => ({...notif, read: true}))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev =>
        prev.filter(notif => notif.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
      <NotificationContext.Provider value={{
        notification,
        setNotification,
        notifications,
        setNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/main" replace />} />
            <Route path="main" element={<MainPage />} />
            <Route path="adoptions" element={<Adoption />} />
            <Route path="adoptions/:id" element={<AdoptionDetail />} />
            <Route path="lostAnimal" element={<LostAnimal />} />
            <Route path="lostAnimal/detail/:id" element={<LostAnimalDetail />} />
            <Route path="lostAnimal/create" element={<LostAnimalCreate />} />
            <Route path="lostAnimal/update/:postId" element={<LostAnimalUpdate />} />
            <Route path="oauth2/redirect" element={<OAuthRedirectHandler />} />
            <Route path="login" element={<Login />} />
            <Route
                path="myPage"
                element={user ? <MyPage /> : <Navigate to="/login" replace />}
            />
            <Route path="signup/additional-info" element={<AdditionalInfo />} />
            <Route path="chat/:roomId" element={<ChatRoom />} />
            <Route path="lostAnimal/detail/:id/chat/:roomId" element={<ChatRoom />} />
          </Route>
        </Routes>

        {/* 인앱 알림 컴포넌트 */}
        {notification && (
            <InAppNotification
                title={notification.title}
                message={notification.message}
                actionUrl={notification.actionUrl}
                onClose={() => setNotification(null)}
            />
        )}

        {/* 알림 권한 안내 모달 */}
        <NotificationGuideModal
            isOpen={showGuideModal}
            onClose={handleGuideModalClose}
            onProceed={handleGuideModalProceed}
        />
      </NotificationContext.Provider>
  );
}

export default App;