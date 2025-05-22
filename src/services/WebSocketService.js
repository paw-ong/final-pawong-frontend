import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';
import { Client } from '@stomp/stompjs';
// import Stomp from 'stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.commonHeaders = {};
  }

  connect(onConnect, onError) {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('userToken');
      const csrfToken = Cookies.get('XSRF-TOKEN');
      this.commonHeaders = {
        'Authorization': `Bearer ${token}`,
        'X-XSRF-TOKEN': `${csrfToken}`
      };
      console.log('WebSocket Connection Attempt - Token:', token);

      
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