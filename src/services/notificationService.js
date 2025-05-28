// src/services/notificationService.js
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase/config";
import client from "../api/client";

export async function requestNotificationPermission() {
  try {
    // 1. 브라우저 알림 권한 요청
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('알림 권한이 거부되었습니다.');
    }

    // 2. VAPID 키 설정 (Vite 환경변수 사용)
    const vapidKey = import.meta.env.VITE_VAPID_KEY;

    if (!vapidKey) {
      console.warn('VAPID 키가 설정되지 않았습니다.');
      return { success: true, token: null };
    }

    // 3. FCM 토큰 요청
    const token = await getToken(messaging, { vapidKey });

    if (token) {
      // 4. 서버에 토큰 저장
      await saveTokenToServer(token);
      console.log('FCM 토큰 등록 완료:', token);
      return { success: true, token };
    } else {
      throw new Error('FCM 토큰을 가져올 수 없습니다.');
    }

  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return { success: false, error: error.message };
  }
}

async function saveTokenToServer(token) {
  try {
    await client.post('/fcm/token', { token });
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
}

export function initializeForegroundMessaging() {
  // 포그라운드 메시지 수신 리스너
  onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지 수신:', payload);

    const { title, body } = payload.notification || {};

    // 커스텀 알림 표시
    if (Notification.permission === 'granted') {
      new Notification(title || '알림', {
        body: body || '새로운 메시지가 도착했습니다.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      });
    }
  });
}

export function getNotificationPermissionStatus() {
  return Notification.permission;
}
