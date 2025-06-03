// Firebase SDK를 먼저 로드
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase 설정 파일 로드
importScripts('/firebaseConfig.js');

// Service Worker에서 Firebase 초기화
const firebaseApp = firebase.initializeApp(firebaseConfig, 'sw-app');

// Firebase Messaging 인스턴스 가져오기
const messaging = firebase.messaging(firebaseApp);

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
