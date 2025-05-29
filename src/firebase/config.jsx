import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import firebaseConfig from './firebaseConfig';


// Initialize Firebase
const app = initializeApp(firebaseConfig);
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