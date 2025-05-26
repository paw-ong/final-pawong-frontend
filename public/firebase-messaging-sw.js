importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase 구성 정보
const firebaseConfig = {
  apiKey: "AIzaSyCrL_4VifmlMncW15zt5ES1e2QwJM1NuVg",
  authDomain: "pawong-e6e02.firebaseapp.com",
  projectId: "pawong-e6e02",
  storageBucket: "pawong-e6e02.firebasestorage.app",
  messagingSenderId: "582136713985",
  appId: "1:582136713985:web:fe629e7f112fa1c18cc100",
  measurementId: "G-ETSC80ERZC"
};

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
