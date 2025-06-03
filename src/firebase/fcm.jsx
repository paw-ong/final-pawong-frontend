import { getToken } from "firebase/messaging";
import { messaging } from "./config.jsx";
import { requestNotificationPermission } from "../services/notificationService";

// FCM 토큰 요청 함수 (로그인 상태를 매개변수로 받음)
export async function getFcmToken(isLoggedIn) {
  try {
    // 로그인 상태 확인
    if (!isLoggedIn) {
      console.log('로그인하지 않은 사용자 - FCM 토큰 요청 생략');
      return null;
    }

    // notificationService를 통해 토큰 요청
    const result = await requestNotificationPermission();
    if (result.success) {
      return result.token;
    }
    
    return null;
  } catch (error) {
    console.error('FCM 토큰 요청 중 오류 발생:', error);
    return null;
  }
}

// 별도로 토큰 등록만 하는 함수 (로그인 후 호출용)
export async function registerTokenToServer(token) {
  const result = await requestNotificationPermission();
  return result.success;
}