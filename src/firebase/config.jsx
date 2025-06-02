import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import firebaseConfig from './firebaseConfig.js';

// Initialize Firebase with a specific name
let app;
try {
  app = initializeApp(firebaseConfig, 'client-app');
} catch (error) {
  app = firebase.app('client-app');
}
const messaging = getMessaging(app);

// Service Worker 등록
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker 등록 성공:', registration.scope);
    })
    .catch(function(err) {
      console.log('Service Worker 등록 실패:', err);
    });
}

export { messaging };