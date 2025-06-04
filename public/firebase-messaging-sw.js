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
    icon: '/favicon.ico',
    data: {
      type: payload.data?.type,
      targetId: payload.data?.targetId
    },
    requireInteraction: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', function(event) {
  console.log('알림 클릭됨:', event);
  
  const notification = event.notification;
  const data = notification.data;
  notification.close();

  let url = '/';
  
  if (data.type === 'CHAT') {
    url = '/lostAnimal/detail/25';
  } else if (data.type === 'FOUND' || data.type === 'FOSTER') {
    url = `/lostAnimal/detail/${data.targetId}`;
  }

  // 클라이언트를 열거나 포커스
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(clientList => {
      // 이미 열린 탭이 있는지 확인
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // 열린 탭이 없으면 새로 열기
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
