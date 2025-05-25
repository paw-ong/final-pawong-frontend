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
    this.subscriptions = new Map();
  }

  // 인증 오류 처리
  handleAuthError() {
    localStorage.removeItem('userToken');
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'auth-modal-container';
    document.body.appendChild(modalContainer);

    const root = createRoot(modalContainer);
    root.render(
      React.createElement(AuthRequiredModal, {
        isOpen: true,
        onClose: () => {
          root.unmount();
          document.body.removeChild(modalContainer);
          window.location.href = '/login';
        }
      })
    );
  }

  // 웹소켓 연결
  async connect() {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('userToken');
      const csrfToken = Cookies.get('XSRF-TOKEN');

      if (!token) {
        this.handleAuthError();
        reject(new Error('No authentication token found'));
        return;
      }

      this.commonHeaders = {
        'Authorization': `Bearer ${token}`,
        'X-XSRF-TOKEN': `${csrfToken}`
      };
      
      const socket = new SockJS(
        '/ws?token=' + token,
        null,
        { transports: ['websocket'] }
      );

      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: this.commonHeaders,
        debug: (str) => {
          console.log('[STOMP]', str);
        },
        onWebSocketClose: () => {
          console.log('[WebSocket] Connection closed');
          this.connected = false;
          this.subscriptions.clear();
        },
        onWebSocketError: (event) => {
          console.error('[WebSocket] Error:', event);
          this.connected = false;
          this.subscriptions.clear();
          this.handleAuthError();
        }
      });

      this.stompClient.onConnect = (frame) => {
        console.log('[STOMP] Connected successfully');
        this.connected = true;
        resolve(frame);
      };

      this.stompClient.onStompError = (frame) => {
        console.error('[STOMP] Error:', frame);
        this.connected = false;
        this.subscriptions.clear();
        
        if (frame.headers['message']?.includes('401') || 
            frame.headers['message']?.includes('403') ||
            frame.body?.includes('Unauthorized') ||
            frame.body?.includes('Forbidden')) {
          this.handleAuthError();
        }
        
        reject(frame);
      };

      this.stompClient.activate();
    });
  }

  // 웹소켓 연결 해제
  disconnect() {
    if (this.stompClient) {
      console.log('[STOMP] Disconnecting...');
      this.stompClient.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  // 웹소켓 구독
  subscribe(destination, callback) {
    if (!this.connected) {
      console.error('[STOMP] Cannot subscribe: Not connected');
      return null;
    }

    if (this.subscriptions.has(destination)) {
      console.log('[STOMP] Already subscribed to:', destination);
      return this.subscriptions.get(destination);
    }

    console.log('[STOMP] Subscribing to:', destination);
    const subscription = this.stompClient.subscribe(destination, callback);
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

  // 웹소켓 메시지 전송
  send(destination, body) {
    if (!this.connected) {
      console.error('[STOMP] Cannot send: Not connected');
      return;
    }

    console.log('[STOMP] Sending message to:', destination);
    this.stompClient.publish({
      destination: destination,
      body: JSON.stringify(body)
    });
  }

  // 웹소켓 메시지 전송 및 구독
  async connectAndSendMessage(sendDestination, message, onMessageReceived, subscribeDestination) {
    try {
      if (!this.connected) {
        await this.connect();
      }

      if (!this.subscriptions.has(subscribeDestination)) {
        this.subscribe(subscribeDestination, onMessageReceived);
      }

      this.send(sendDestination, message);
    } catch (error) {
      console.error('[STOMP] Failed to connect and send message:', error);
      throw error;
    }
  }
}

export default new WebSocketService(); 