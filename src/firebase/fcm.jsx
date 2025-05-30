import { getToken } from "firebase/messaging";
import { messaging } from "./config.jsx";

// FCM 토큰 요청 함수 (로그인 상태 확인 추가)
export async function getFcmToken() {
  try {
    // 로그인 상태 확인
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      console.log('로그인하지 않은 사용자 - FCM 토큰 요청 생략');
      return null;
    }

    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log('알림 권한이 거부되었습니다.');
      return null;
    }

    // FCM 토큰 요청
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY
    });

    if (!currentToken) {
      console.log('FCM 토큰을 가져올 수 없습니다.');
      return null;
    }

    // 토큰을 서버에 등록
    await registerTokenWithServer(currentToken);

    return currentToken;
  } catch (error) {
    console.error('FCM 토큰 요청 중 오류 발생:', error);
    return null;
  }
}

// 토큰을 서버에 등록하는 함수 (인증 헤더 추가)
async function registerTokenWithServer(token) {
  try {
    const userToken = localStorage.getItem('userToken');

    if (!userToken) {
      console.warn('사용자 인증 토큰이 없습니다. FCM 토큰 등록을 건너뜁니다.');
      return;
    }

    console.log('FCM 토큰이 서버에 등록되었습니다.');
  } catch (error) {
    console.error('FCM 토큰 서버 등록 실패:', error);

    // 상세한 에러 정보 로그
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('요청이 전송되지 않음:', error.request);
    } else {
      console.error('에러 메시지:', error.message);
    }
  }
}

// 별도로 토큰 등록만 하는 함수 (로그인 후 호출용)
export async function registerTokenToServer(token) {
  await registerTokenWithServer(token);
}