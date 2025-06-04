import React, {useContext, useEffect, useRef, useState} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Adoption from "./pages/adoptionAnimal/Adoption.jsx";
import LostAnimal from "./pages/lostAnimal/LostAnimal.jsx";
import MainPage from "./pages/mainPage/MainPage.jsx";
import Login from "./pages/signup/Login.jsx";
import MyPage from "./pages/myPage/MyPage.jsx";
import AdoptionDetail from "./pages/adoptionAnimal/AdoptionDetail.jsx";
import LostAnimalCreate from "./pages/lostAnimal/LostAnimalCreate.jsx";
import LostAnimalDetail from "./pages/lostAnimal/LostAnimalDetail.jsx";
import OAuthRedirectHandler from "./components/auth/OAuthRedirectHandler.jsx";
import AdditionalInfo from "./pages/signup/AdditionalInfo.jsx";
import { AuthContext } from "./contexts/AuthContext";
import LostAnimalUpdate from "./pages/lostAnimal/LostAnimalUpdate.jsx";
import ChatRoom from "./components/chat/ChatRoom.jsx";
import InAppNotification from "./firebase/InAppNotification.jsx";
import { getFcmToken } from "./firebase/fcm.jsx";
import { createContext } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase/config.jsx";
import ChatRooms from './components/chat/ChatRooms.jsx';
import ChatRoomsByPost from './components/chat/ChatRoomsByPost.jsx';
import { initializeForegroundMessaging, getNotificationPermissionStatus, requestNotificationPermission } from "./services/notificationService";
import NotificationGuideModal from "./components/notification/NotificationGuideModal";
// 알림 상태를 공유하기 위한 Context 생성
export const NotificationContext = createContext();

function LostAnimalLost() {
  return null;
}

function LostAnimalFound() {
  return null;
}

function LostAnimalRescue() {
  return null;
}

function App() {
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [fcmToken, setFcmToken] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const { user, isLoading, isLoggedIn } = useContext(AuthContext);
  const [hasRequestedToken, setHasRequestedToken] = useState(false);
  const fcmInitialized = useRef(false);

  // FCM 메시지 수신 처리
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[알림 디버그] 전체 페이로드:', payload);
      console.log('[알림 디버그] data:', payload.data);

      const newNotification = {
        id: Date.now(),
        title: payload.notification?.title || '알림',
        message: payload.notification?.body || '새로운 메시지가 있습니다',
        type: payload.data?.type,
        targetId: payload.data?.targetId,
        postId: payload.data?.postId,
        targetType: payload.data?.targetType,
        timestamp: new Date().toISOString(),
        read: false
      };

      console.log('[알림 디버그] 생성된 알림 객체:', newNotification);

      setNotifications(prev => [newNotification, ...prev].slice(0, 20));
      setNotification(newNotification);

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // 로그아웃 시 상태 초기화
  useEffect(() => {
    if (!user) {
      setFcmToken(null);
      setHasRequestedToken(false);
      fcmInitialized.current = false;
      sessionStorage.removeItem('notification-guide-shown');
    }
  }, [user]);

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
      fcmToken,
      setFcmToken
    }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/main" replace />} />
          <Route path="main" element={<MainPage />} />
          <Route path="adoptions" element={<Adoption />} />
          <Route path="adoptions/:id" element={<AdoptionDetail />} />
          <Route path="lostAnimal" element={<LostAnimal />}>
            <Route index element={<Navigate to="lost" replace />} />
            <Route path="lost" element={<LostAnimalLost />} />
            <Route path="found" element={<LostAnimalFound />} />
            <Route path="rescue" element={<LostAnimalRescue />} />
          </Route>
          <Route path="lostAnimal/detail/:id" element={<LostAnimalDetail />} />
          <Route path="lostAnimal/create" element={<LostAnimalCreate />} />
          <Route path="lostAnimal/update/:postId" element={<LostAnimalUpdate />} />
          <Route path="oauth2/redirect" element={<OAuthRedirectHandler />} />
          <Route path="login" element={<Login />} />
          <Route
            path="myPage"
            element={isLoading ? (
              <div>Loading...</div>
            ) : isLoggedIn ? (
              <MyPage />
            ) : (
              <Navigate to="/login" replace />
            )}
          />
          <Route path="signup/additional-info" element={<AdditionalInfo />} />
          <Route path="lostAnimal/detail/:id/chat/:roomId" element={<ChatRoom />} />
          <Route path="chatrooms" element={<ChatRooms />} />
          <Route path="chatrooms/post/:postId" element={<ChatRoomsByPost />} />
        </Route>
      </Routes>

      {notification && (
        <InAppNotification
          notification={notification}
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