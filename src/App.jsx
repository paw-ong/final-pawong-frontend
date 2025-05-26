import React, {useContext, useEffect, useRef, useState} from "react";
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
import { getFcmToken } from "./firebase/fcm.jsx";
import { createContext } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase/config.jsx";

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
  const { user } = useContext(AuthContext);

  // FCM 토큰 요청 중복 방지를 위한 ref
  const fcmInitialized = useRef(false);

  // 로그인된 사용자가 있을 때만 FCM 토큰 요청 (한 번만)
  useEffect(() => {
    const initializeFCMForLoggedInUser = async () => {
      // 이미 초기화되었거나 로그인된 사용자가 없으면 리턴
      if (fcmInitialized.current || !user) {
        if (!user) {
          console.log("로그인하지 않은 사용자 - FCM 토큰 요청 생략");
          setFcmToken(null);
          fcmInitialized.current = false; // 로그아웃 시 초기화 상태 리셋
        }
        return;
      }

      try {
        console.log("로그인된 사용자 감지 - FCM 토큰 요청 시작");
        fcmInitialized.current = true; // 중복 실행 방지

        const token = await getFcmToken();
        if (token) {
          console.log("FCM 토큰 획득 성공:", token);
          setFcmToken(token);
          console.log("FCM 토큰 서버 등록 성공");
        }
      } catch (error) {
        console.error("FCM 토큰 처리 실패:", error);
        fcmInitialized.current = false; // 실패 시 다시 시도할 수 있도록 리셋
      }
    };

    initializeFCMForLoggedInUser();
  }, [user]); // user 상태 변화 감지

  // FCM 메시지 수신 처리 (로그인 여부와 관계없이 설정)
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('포그라운드 메시지 수신:', payload);

      // adoptionId가 있으면 actionUrl 구성
      const adoptionId = payload.data?.adoptionId;
      const actionUrl = adoptionId ? `/adoptions/${adoptionId}` : null;

      // 새 알림 생성
      const newNotification = {
        id: Date.now(),
        title: payload.notification?.title || '알림',
        message: payload.notification?.body || '새로운 메시지가 있습니다',
        actionUrl: actionUrl,
        timestamp: new Date().toISOString(),
        read: false
      };

      // 알림 목록에 추가
      setNotifications(prev => [newNotification, ...prev].slice(0, 20));

      // 현재 표시할 알림 설정
      setNotification({
        title: newNotification.title,
        message: newNotification.message,
        actionUrl: newNotification.actionUrl
      });

      // 2초 후 자동으로 알림 닫기
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

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
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        fcmToken
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
                element={user ? <MyPage /> : <Navigate to="/login" replace />}
            />
            <Route path="signup/additional-info" element={<AdditionalInfo />} />
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
      </NotificationContext.Provider>
  );
}

export default App;
