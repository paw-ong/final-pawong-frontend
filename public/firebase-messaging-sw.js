importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');
importScripts('./firebaseConfig.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || '알림';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 메시지',
    icon: payload.notification?.icon || '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
