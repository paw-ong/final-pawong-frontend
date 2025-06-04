import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WebSocketService from '../../services/WebSocketService';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './ChatRoom.module.css';
import client from '../../api/client';
import backArrow from '../../assets/images/icons/back-arrow.svg';
import kebabMenu from '../../assets/images/icons/kebab-menu.svg';
import defaultImage from '../../assets/images/lostpost/default.png';

function formatDateWithDay(date) {
  const d = new Date(Number(date));
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

const ChatRoom = () => {
  const { id, roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [animalData, setAnimalData] = useState(null);
  const [isChatActive, setIsChatActive] = useState(true);
  const [chatRoomInfo, setChatRoomInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 채팅방 정보 확인 및 게시글 검증
  useEffect(() => {
    const checkChatRoomInfo = async () => {
      try {
        // 채팅방 정보 조회
        const chatRoomResponse = await client.get(`/chat/rooms/${roomId}/info`);
        const chatRoomDetail = chatRoomResponse.data.chatRoomDetail;
        setChatRoomInfo(chatRoomDetail);
        setIsChatActive(chatRoomDetail.status === 'ACTIVE');

        // 첫 접속 시 모달 표시
        if (chatRoomDetail.latestMessageContent === "") {
          setIsWelcomeModalOpen(true);
        }

        // 게시글 정보 조회
        const postResponse = await client.get(`/lost-animals/lost-posts/${id}`);
        const postDetail = postResponse.data.lostPostDetailDto;

        // 게시글 ID 검증
        if (postDetail.lostPostId !== chatRoomDetail.lostPostInfo.postId) {
          alert('채팅방에 접속할 수 없습니다.');
          navigate('/chatrooms');
          return;
        }

        setAnimalData(postDetail);
      } catch (error) {
        alert('채팅방에 접속할 수 없습니다.');
        navigate('/chatrooms');
      }
    };

    checkChatRoomInfo();
  }, [roomId, id, navigate]);

  useEffect(() => {
    let isMounted = true;
    const connectAndSubscribe = async () => {
      try {
          await WebSocketService.connect();
          WebSocketService.subscribe(`/user/queue/chat/${roomId}`, (message) => {
            if (!isMounted) return;
            setMessages(prev => [...prev, message]);
          });
          WebSocketService.subscribe(`/user/queue/read-receipts/${roomId}`, (message) => {
            if (!isMounted) return;
            
            setMessages(prev => {
              const updated = prev.map(msg => {
                const isMyMessage = Number(msg.senderId) === Number(user?.userId);
                const shouldUpdate = isMyMessage && msg.chatMessageId <= message.lastReadMessageId;
                return shouldUpdate ? { ...msg, status: 'READ' } : msg;
              });
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
      // WebSocketService.disconnect();  // 언마운트되도 연결 끊지 않기
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

  const getOtherProfileImage = (message) => {
    if (!animalData || !user) return defaultImage;
  
    // 내 userId와 authorId가 같으면 상대방은 profileImage
    if (animalData.authorId === user.userId) {
      return message.senderProfileImage || defaultImage;
    }
    // 다르면 상대방 프로필 이미지는 공고의 imageUrl
    return animalData.imageUrl || defaultImage;
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

  const handleDeactivateChat = async () => {
    if (!isChatActive) {
      alert("이미 비활성화된 채팅입니다!");
      setIsModalOpen(false);
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const confirmDeactivation = async () => {
    try {
      await client.patch(`/chat/rooms/${roomId}`);
      alert("채팅방이 비활성화 됐습니다!");
      setIsChatActive(false);
    } catch (error) {
      console.error('채팅방 비활성화 실패:', error);
      alert('채팅방 비활성화에 실패했습니다.');
    }
    setIsConfirmModalOpen(false);
    setIsModalOpen(false);
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
            src={user?.profileImage || defaultImage}
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
            src={backArrow}
            alt="뒤로 가기"
            className={styles.backButton}
            onClick={() => navigate('/chatrooms')}
          />
          <img
            src={animalData?.imageUrl || defaultImage}
            alt="공고 이미지"
            className={styles.headerAnimalImage}
          />
          <div className={styles.headerInfo}>
            <span className={styles.headerNickname}>
              {getOtherNickname(animalData, user, messages)}
            </span>
            {chatRoomInfo && (
              <span className={styles.headerSubInfo}>
                {chatRoomInfo.lostPostInfo.kindNm} | {chatRoomInfo.lostPostInfo.location}
              </span>
            )}
          </div>
          <button 
            className={styles.goToPostButton}
            onClick={() => navigate(`/lostAnimal/detail/${chatRoomInfo?.lostPostInfo.postId}`)}
          >
            공고로 이동
          </button>
          <img
            src={kebabMenu}
            alt="메뉴"
            className={styles.kebabMenu}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        
        {/* 메뉴 모달 */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <button 
                className={styles.modalButton}
                onClick={() => {
                  setIsModalOpen(false);
                  navigate('/lostAnimal');
                }}
              >
                다른 실종 공고 찾기
              </button>
              <button 
                className={styles.modalButton}
                onClick={handleDeactivateChat}
              >
                채팅 비활성화
              </button>
            </div>
          </div>
        )}

        {/* 확인 모달 */}
        {isConfirmModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsConfirmModalOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <p>더 이상 상대와 채팅하지 않으실 예정인가요? 채팅방이 즉시 비활성화 됩니다!</p>
              <div className={styles.modalButtons}>
                <button 
                  className={styles.confirmButton}
                  onClick={confirmDeactivation}
                >
                  예
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  아니요
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 환영 모달 */}
        {isWelcomeModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsWelcomeModalOpen(false)}>
            <div className={`${styles.modal} ${styles.welcomeModal}`} onClick={e => e.stopPropagation()}>
              <div className={styles.welcomeContent}>
                <p>💬 자유롭게 채팅을 시작하세요! 언제든 준비될 때 메시지를 보내보세요.</p>
                <p>🐾 반려동물이 주인을 잘 찾아갈 수 있도록 기여하는 여러분이 있어 세상이 한층 아름다워집니다.</p>
                <p>🚫 모종의 이유로 공고가 마감되거나 더 이상 채팅을 진행할 의향이 없는 경우, 채팅방을 비활성화 할 수 있습니다.</p>
              </div>
              <button 
                className={styles.welcomeCloseButton}
                onClick={() => setIsWelcomeModalOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}

        <div className={styles.messagesContainer}>
          {renderMessagesWithDateDivider(messages)}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.inputForm}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isChatActive ? "메시지를 입력하세요..." : "비활성화된 채팅방입니다"}
            className={styles.messageInput}
            disabled={!isChatActive}
            style={{ 
              backgroundColor: !isChatActive ? '#f0f0f0' : 'white',
              cursor: !isChatActive ? 'not-allowed' : 'text'
            }}
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={!isChatActive}
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom; 