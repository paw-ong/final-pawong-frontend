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

  // 로그인할 때마다 알림 권한 안내 모달 표시 (세션 기반)
  useEffect(() => {
    if (user) {
      const permissionStatus = getNotificationPermissionStatus();
      const sessionGuideShown = sessionStorage.getItem('notification-guide-shown');

      // 권한이 설정되지 않고, 이번 세션에서 아직 안내를 보지 않은 경우
      if (permissionStatus === 'default' && !sessionGuideShown) {
        // 로그인 후 1.5초 뒤에 안내 모달 표시 (자연스러운 타이밍)
        const timer = setTimeout(() => {
          setShowGuideModal(true);
          // 이번 세션에서 안내를 보여줬다는 표시를 sessionStorage에 저장
          sessionStorage.setItem('notification-guide-shown', 'true');
        }, 1500);

        return () => clearTimeout(timer);
      }
    } else {
      // 로그아웃 시 세션 스토리지 클리어
      sessionStorage.removeItem('notification-guide-shown');
    }
  }, [user]); // user 상태 변화 감지

  // FCM 포그라운드 메시지 리스너 초기화
  useEffect(() => {
    initializeForegroundMessaging();
  }, []);

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

        {/* 로그인할 때마다 자동 표시되는 사전 안내 모달 */}
        <NotificationGuideModal
            isOpen={showGuideModal}
            onClose={handleGuideModalClose}
            onProceed={handleGuideModalProceed}
        />
      </NotificationContext.Provider>
  );
}

export default App;
