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
  }

  handleAuthError() {
    // 로컬 스토리지의 토큰 제거
    localStorage.removeItem('userToken');
    
    // 모달을 표시할 div 생성
    const modalContainer = document.createElement('div');
    modalContainer.id = 'auth-modal-container';
    document.body.appendChild(modalContainer);

    // React 컴포넌트 렌더링
    const root = createRoot(modalContainer);
    root.render(
      React.createElement(AuthRequiredModal, {
        isOpen: true,
        onClose: () => {
          root.unmount();
          document.body.removeChild(modalContainer);
          window.location.href = '/login';  // 페이지 리다이렉션
        }
      })
    );
  }

  connect(onConnect, onError) {
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
      
      const socket = new SockJS('/ws?token=' + token);
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: this.commonHeaders,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onWebSocketClose: (event) => {
          console.log('WebSocket Closed:', event);
          this.connected = false;
        },
        onWebSocketError: (event) => {
          console.error('WebSocket Error:', event);
          this.connected = false;
          this.handleAuthError();
        }
      });

      this.stompClient.onConnect = (frame) => {
        console.log('STOMP Connected Successfully:', frame);
        this.connected = true;
        if (onConnect) onConnect(frame);
        resolve(frame);
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP Error Headers:', frame.headers);
        console.error('STOMP Error Body:', frame.body);
        console.error('STOMP Error Command:', frame.command);
        this.connected = false;
        
        // 인증 관련 에러인 경우
        if (frame.headers['message']?.includes('401') || 
            frame.headers['message']?.includes('403') ||
            frame.body?.includes('Unauthorized') ||
            frame.body?.includes('Forbidden')) {
          this.handleAuthError();
        }
        
        if (onError) onError(frame);
        reject(frame);
      };

      console.log('Activating STOMP Client...');
      this.stompClient.activate();
    });
  }

  disconnect() {
    if (this.stompClient) {
      console.log('Disconnecting STOMP Client...');
      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  subscribe(destination, callback) {
    if (!this.connected) {
      console.error('Cannot subscribe: WebSocket is not connected');
      return null;
    }
    console.log('Subscribing to:', destination);
    return this.stompClient.subscribe(destination, callback);
  }

  send(destination, body) {
    if (!this.connected) {
      console.error('Cannot send: WebSocket is not connected');
      return;
    }
    console.log('Sending message to:', destination, 'Body:', body);
    this.stompClient.publish({
      destination: destination,
      body: JSON.stringify(body)
    });
  }
}

export default new WebSocketService(); 