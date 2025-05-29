// src/services/notificationService.js
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase/config";
import client from "../api/client";

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

export async function requestNotificationPermission() {
  try {
    // 0. 로컬 스토리지에서 토큰 확인
    const existingToken = localStorage.getItem('fcm_token');
    if (existingToken) {
      console.log('기존 FCM 토큰 사용');
      // 기존 토큰이 있어도 서버에 전송
      try {
        await saveTokenToServer(existingToken);
        console.log('기존 토큰 서버 등록 완료');
      } catch (error) {
        console.error('기존 토큰 서버 등록 실패:', error);
        // 서버 등록에 실패하면 토큰을 새로 요청
        localStorage.removeItem('fcm_token');
        // 계속 진행하여 새 토큰 요청
      }
      return { success: true, token: existingToken };
    }

    // 1. 브라우저 알림 권한 요청
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error('알림 권한이 거부되었습니다.');
    }

    // 2. FCM 토큰 요청
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    if (token) {
      // 3. 서버에 토큰 저장 및 로컬 스토리지에 저장
      await saveTokenToServer(token);
      localStorage.setItem('fcm_token', token);
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
    // 서버 저장 실패 시 로컬 스토리지에서도 제거
    localStorage.removeItem('fcm_token');
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

// 토큰 무효화 시 호출할 함수
export function clearFcmToken() {
  localStorage.removeItem('fcm_token');
}