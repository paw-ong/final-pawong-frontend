import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';
import { Client } from '@stomp/stompjs';
import { createRoot } from 'react-dom/client';
import React from 'react';
import AuthRequiredModal from '../components/auth/AuthRequiredModal.jsx';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.commonHeaders = {};
    this.onAuthError = null;
    this.subscriptions = new Map();  // 구독 관리를 위한 Map 추가
  }

  // 인증 오류 콜백 설정
  setAuthErrorCallback(callback) {
    this.onAuthError = callback;
  }

  // 인증 오류 처리
  handleAuthError() {
    if (this.onAuthError) {
      this.onAuthError();
    }
  }

  // 웹소켓 연결
  connect() {
    console.log('웹소켓 연결 시도');
    const csrfToken = Cookies.get('XSRF-TOKEN');
    
    // 이미 연결되어 있다면 재연결하지 않음
    if (this.connected && this.stompClient?.connected) {
      console.log('[STOMP] Already connected');
      return Promise.resolve();
    }

    const socket = new SockJS('/ws', null, {
      withCredentials: true,
      timeout: 5000
    });

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('[STOMP]', str);
      },
      reconnectDelay: 5000,  // 5초 후 재연결 시도
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        'X-XSRF-TOKEN': `${csrfToken}`
      }
    });

    this.stompClient.onStompError = (frame) => {
      console.error('[STOMP] Error:', frame);
      if (frame.headers.message?.includes('Failed to send message')) {
        console.error('[STOMP] Authentication failed');
        this.handleAuthError();
      }
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('[WebSocket] Connection closed:', event);
      this.connected = false;
      // 연결이 끊어지면 자동으로 재연결 시도
      setTimeout(() => {
        if (!this.connected) {
          this.connect();
        }
      }, 5000);
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('[WebSocket] Error:', event);
      this.connected = false;
    };

    return new Promise((resolve, reject) => {
      this.stompClient.activate();
      
      this.stompClient.onConnect = (frame) => {
        console.log('[STOMP] Connected successfully:', frame);
        this.connected = true;
        resolve(frame);
      };

      this.stompClient.onStompError = (frame) => {
        console.error('[STOMP] Connection error:', frame);
        this.connected = false;
        reject(frame);
      };
    });
  }

  // 웹소켓 연결 해제
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  // 웹소켓 구독
  subscribe(destination, callback) {
    if (!this.connected) {
      console.error('[STOMP] Cannot subscribe: Not connected');
      return;
    }

    console.log('[STOMP] Subscribing to:', destination);
    const subscription = this.stompClient.subscribe(destination, (message) => {
      console.log('[STOMP] Received message:', message);
      try {
        const parsedMessage = JSON.parse(message.body);
        console.log('[STOMP] Parsed message:', parsedMessage);
        callback(parsedMessage);
      } catch (error) {
        console.error('[STOMP] Message parsing error:', error);
        callback(message.body);
      }
    });
    
    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  // 웹소켓 구독 해제
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      console.log('[STOMP] Unsubscribing from:', destination);
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

    // 연결 여부 확인
    isConnected() {
      return this.stompClient && this.connected;
    }
  
  // 웹소켓 메시지 전송
  send(destination, body) {
    if (!this.connected) {
      console.error('[STOMP] Cannot send: Not connected');
      return;
    }
    this.stompClient.publish({
      destination,
      body: JSON.stringify(body)
    });
  }
}

export default new WebSocketService(); 