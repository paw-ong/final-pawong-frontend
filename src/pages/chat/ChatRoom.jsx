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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 구독 해제
      WebSocketService.unsubscribe(`/user/queue/chat/${roomId}`);
    };
  }, [roomId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const chatMessage = {
        type: 'CHAT',
        content: newMessage,
        roomId: roomId,
        sender: user?.nickname || 'Anonymous',
        timestamp: Date.now()
      };

      await WebSocketService.connectAndSendMessage(
        `/app/chat.send/${roomId}`,
        chatMessage,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, receivedMessage]);
        },
        `/user/queue/chat/${roomId}`
      );

      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const renderMessage = (message) => {
    const isSystemMessage = message.sender === 'System';
    const isMyMessage = message.sender === user?.nickname;

    return (
      <div
        key={message.timestamp}
        className={`${styles.message} ${
          isSystemMessage 
            ? styles.systemMessage 
            : isMyMessage 
              ? styles.myMessage 
              : styles.otherMessage
        }`}
      >
        <div className={styles.messageContent}>
          {!isSystemMessage && (
            <span className={styles.sender}>{message.sender}</span>
          )}
          <p>{message.content}</p>
          <span className={styles.timestamp}>
            {new Date(parseInt(message.timestamp)).toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.chatRoom}>
      <div className={styles.chatHeader}>
        <h2>채팅방 {roomId}</h2>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className={styles.messageInput}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatRoom; 