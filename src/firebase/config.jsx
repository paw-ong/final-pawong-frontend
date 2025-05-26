import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCrL_4VifmlMncW15zt5ES1e2QwJM1NuVg",
  authDomain: "pawong-e6e02.firebaseapp.com",
  projectId: "pawong-e6e02",
  storageBucket: "pawong-e6e02.firebasestorage.app",
  messagingSenderId: "582136713985",
  appId: "1:582136713985:web:fe629e7f112fa1c18cc100",
  measurementId: "G-ETSC80ERZC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };