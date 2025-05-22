import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import WebSocketService from '../../services/WebSocketService';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './ChatRoom.module.css';

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 웹소켓 연결
  useEffect(() => {
    console.log(user);
    const connectWebSocket = async () => {
      try {
        console.log('Attempting to connect WebSocket...');
        await WebSocketService.connect(
          (frame) => {
            console.log('WebSocket connection callback triggered', frame);
            setConnected(true);
            // 연결 성공 메시지 추가
            const systemMessage = {
              sender: 'System',
              content: '연결 성공',
              timestamp: new Date().toISOString()
            };
            console.log('Adding system message:', systemMessage);
            setMessages(prev => {
              console.log('Previous messages:', prev);
              return [...prev, systemMessage];
            });
          },
          (error) => {
            console.error('WebSocket Connection Error:', error);
            setConnected(false);
            setSubscribed(false);
          }
        );
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      WebSocketService.disconnect();
      setConnected(false);
    };
  }, []);

  // 메시지 상태 변경 감지를 위한 useEffect
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  // 채팅방 구독
  const handleSubscribe = () => {
    if (!connected) {
      console.error('WebSocket is not connected');
      return;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // 구독 경로 수정 - 서버 설정에 맞춤
    const subscribePath = `/user/queue/chat/${roomId}`;
    console.log('Attempting to subscribe to:', subscribePath);
    console.log(user);
    
    subscriptionRef.current = WebSocketService.subscribe(
      subscribePath,
      (message) => {
        console.log('Received message:', message);
        const receivedMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, receivedMessage]);
      }
    );
    setSubscribed(true);

    // 입장 메시지 전송
    const chatMessage = {
      roomId: roomId,
      sender: 'System',
      content: `${user?.nickname || 'Anonymous'}님이 방에 입장하였습니다.`,
      timestamp: new Date().toISOString(),
    };
    
    // 메시지 전송 경로 수정 - 서버 설정에 맞춤
    const sendPath = `/app/chat.send/${roomId}`;
    console.log('Sending enter message to:', sendPath);
    console.log(user);
    console.log(roomId);
    console.log(chatMessage);
    WebSocketService.send(sendPath, chatMessage);
  };

  // 채팅방 구독 해제
  const handleUnsubscribe = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
      setSubscribed(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !connected || !subscribed) return;

    console.log(user);

    const message = {
      roomId: roomId,
      sender: user?.nickname || 'Anonymous',
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    // 메시지 전송 경로 수정 - 서버 설정에 맞춤
    const sendPath = '/app/chat.sendMessage';
    console.log('Sending message to:', sendPath);
    WebSocketService.send(sendPath, message);
    setNewMessage('');
  };

  return (
    <div className={styles.chatRoom}>
      <div className={styles.chatHeader}>
        <h2>채팅방 {roomId}</h2>
        <div className={styles.connectionStatus}>
          {connected && (
            <button 
              onClick={subscribed ? handleUnsubscribe : handleSubscribe}
              className={styles.subscribeButton}
            >
              {subscribed ? '구독 해제' : '구독하기'}
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.messagesContainer}>
        {console.log('Rendering messages:', messages)}
        {messages.map((message, index) => {
          console.log('Rendering message:', message);
          return (
            <div
              key={index}
              className={`${styles.message} ${
                message.sender === 'System' 
                  ? styles.systemMessage 
                  : message.sender === user?.username 
                    ? styles.myMessage 
                    : styles.otherMessage
              }`}
            >
              <div className={styles.messageContent}>
                <p>{message.content}</p>
                <span className={styles.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className={styles.messageInput}
          // disabled={!connected || !subscribed}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          // disabled={!connected || !subscribed}
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatRoom; 