import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import WebSocketService from '../../services/WebSocketService';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './ChatRoom.module.css';
import client from '../../api/client';
import userImage from '../../assets/images/user.jpg';

function formatDateWithDay(date) {
  const d = new Date(Number(date));
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

const ChatRoom = () => {
  const { id, roomId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [animalData, setAnimalData] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    let isMounted = true;
    const connectAndSubscribe = async () => {
      try {
          await WebSocketService.connect();
          WebSocketService.subscribe(`/user/queue/chat/${roomId}`, (message) => {
            if (!isMounted) return;
            const receivedMessage = JSON.parse(message.body);
            setMessages(prev => [...prev, receivedMessage]);
          });
          WebSocketService.subscribe(`/user/queue/read-receipts/${roomId}`, (message) => {
            if (!isMounted) return;
            const readMessage = JSON.parse(message.body);
            setMessages(prev => {
              const updated = prev.map(msg =>
                Number(msg.senderId) === Number(user?.userId) &&
                msg.chatMessageId <= readMessage.lastReadMessageId
                  ? { ...msg, status: 'READ' }
                  : msg
              );
              return updated;
            });
          });
          WebSocketService.send(`/app/chat.read/${roomId}`, {});
      } catch (error) {
        console.error('WebSocket 연결 실패:', error);
      }
    };
    connectAndSubscribe();
    return () => {
      isMounted = false;
      WebSocketService.unsubscribe(`/user/queue/read-receipts/${roomId}`);
      WebSocketService.unsubscribe(`/user/queue/chat/${roomId}`);
      WebSocketService.disconnect();
    };
  }, [roomId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await client.get(`/chat/rooms/${roomId}/messages`);
        setMessages(response.data.chatMessageDetails || []);
        scrollToBottom();
      } catch (error) {
        console.error('메시지 가져오기 실패:', error);
      }
    };
    fetchMessages();
    return () => {
      // 컴포넌트 언마운트 시 구독 해제
      WebSocketService.unsubscribe(`/user/queue/chat/${roomId}`);
    };
  }, [roomId]);

  useEffect(() => {
    client.get(`/lost-animals/lost-posts/${id}`).then(res => setAnimalData(res.data.lostPostDetailDto));
  }, [id]);

  const getOtherProfileImage = (message) => {
    if (!animalData || !user) return userImage;
  
    // 내 userId와 authorId가 같으면 상대방은 profileImage
    if (animalData.authorId === user.userId) {
      return message.senderProfileImage || userImage;
    }
    // 다르면 상대방 프로필 이미지는 공고의 imageUrl
    return animalData.imageUrl || userImage;
  };
  const getOtherNickname = (animalData, user, messages) => {
    if (!animalData || !user) return '';
    // 내가 공고 작성자가 아니면 공고 작성자가 상대방
    if (animalData.authorId !== user.userId) {
      return animalData.author; // 공고 작성자 닉네임
    }
    // 내가 공고 작성자라면, 상대방은 채팅 메시지의 senderName
    // 가장 최근 메시지에서 내 메시지가 아닌 첫 메시지의 senderName을 찾음
    const otherMsg = messages.find(msg => Number(msg.senderId) !== Number(user.userId));
    return otherMsg ? otherMsg.senderName : '';
  };

  // 읽음 요청 함수
  const sendReadReceipt = () => {
    WebSocketService.send(`/app/chat.read/${roomId}`, {});
  };

  // 채팅방 페이지에 진입했을 때, 그리고 포커스/가시성 복귀 시에만 읽음 요청
  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        sendReadReceipt();
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    // 마운트 시에도 한 번 실행 (채팅방 진입)
    handleFocusOrVisible();

    return () => {
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, [roomId]);

  // 3. 새 메시지 도착 시(상대방이 보낸 메시지일 때만)
  useEffect(() => {
    if (!messages.length) return;
    if (document.visibilityState !== 'visible') return;
    if (window.focus !== true) return;
    
    const lastMsg = messages[messages.length - 1];
    if (Number(lastMsg.senderId) !== Number(user?.userId)) {
      sendReadReceipt();
    }
  }, [messages, user, roomId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const chatMessage = {
        content: newMessage,
        createdAt: Date.now() // 에폭크 타임(밀리초)으로 전송
      };

      WebSocketService.send(`/app/chat.send/${roomId}`,chatMessage);
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const renderMessage = (message) => {
    const isMyMessage = Number(message.senderId) === Number(user?.userId);
    const messageDate = new Date(Number(message.createdAt));
    const timeString = isNaN(messageDate.getTime())
      ? '시간 정보 없음'
      : messageDate.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
    // 읽음/안읽음 숫자 표시
    let unreadCount = null;
    if (isMyMessage && message.status === 'SENT') {
      unreadCount = <span className={styles.unreadCount}>1</span>;
    }

    return (
      <div
        key={message.chatMessageId}
        className={`${styles.messageRow} ${
          isMyMessage ? styles.myMessageRow : styles.otherMessageRow
        }`}
      >
        {!isMyMessage && (
        <img
          src={getOtherProfileImage(message)}
          alt="프로필"
          className={styles.profileImage}
          />
        )}
        {isMyMessage && (
          <span className={styles.timestampLeft}>
            {unreadCount && <span className={styles.unreadCountWrapper}>{unreadCount}</span>}
            {timeString}
            </span>
        )}
        <div
          className={`${styles.message} ${
            isMyMessage ? styles.myMessage : styles.otherMessage
          }`}
        >
          <div className={styles.messageContent}>
            <p>{message.content}</p>
          </div>
        </div>
        {!isMyMessage && (
          <span className={styles.timestampRight}>{timeString}</span>
        )}
        {/* 내 메시지: 말풍선 → 프로필 */}
        {isMyMessage && (
          <img
            src={user?.profileImage || userImage}
            alt="프로필"
            className={styles.profileImage}
          />
        )}
      </div>
    );
  };

  const renderMessagesWithDateDivider = (messages) => {
    let lastDate = null;
    return messages.map((message, idx) => {
      const messageDate = new Date(Number(message.createdAt));
      const dateKey = `${messageDate.getFullYear()}-${messageDate.getMonth()}-${messageDate.getDate()}`;
      const showDateDivider = lastDate !== dateKey;
      lastDate = dateKey;

      return (
        <React.Fragment key={message.chatMessageId}>
          {showDateDivider && (
            <div className={styles.dateDivider}>
              <span className={styles.dateText}>{formatDateWithDay(message.createdAt)}</span>
            </div>
          )}
          {renderMessage(message)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="main-content">
      <div className={styles.chatRoom}>
        <div className={styles.chatHeader}>
          <img
            src={animalData?.imageUrl || userImage}
            alt="공고 이미지"
            className={styles.headerAnimalImage}
          />
          <span className={styles.headerNickname}>
            {getOtherNickname(animalData, user, messages)}
          </span>
        </div>
        
        <div className={styles.messagesContainer}>
          {renderMessagesWithDateDivider(messages)}
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
    </div>
  );
};

export default ChatRoom; 