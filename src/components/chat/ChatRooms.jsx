import React, { useEffect, useState, useContext, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../contexts/AuthContext';
import './ChatRooms.css';
import WebSocketService from '../../services/WebSocketService';

function ChatRooms() {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessageRooms, setNewMessageRooms] = useState(new Set());
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);
  
  // 구독 상태를 추적하기 위한 ref
  const subscribedRoomsRef = useRef(new Set());
  const isWebSocketConnectedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const fetchChatRooms = async () => {
      try {
        const response = await client.get('/chat/rooms');
        setChatRooms(response.data.chatRoomsDetails);
      } catch (error) {
        console.error('채팅방 목록 조회 오류:', error);
        setError('채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [isLoggedIn, navigate]);

  // WebSocket 연결은 한 번만 수행
  useEffect(() => {
    if (!isLoggedIn) return;

    const connectWebSocket = async () => {
      try {
        if (!isWebSocketConnectedRef.current) {
          await WebSocketService.connect();
          isWebSocketConnectedRef.current = true;
          console.log('[ChatRooms] WebSocket connected');
        }
      } catch (error) {
        console.error('WebSocket 연결 오류:', error);
        isWebSocketConnectedRef.current = false;
      }
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 모든 구독 해지 및 연결 해제
    return () => {
      console.log('[ChatRooms] Cleaning up all subscriptions...');
      
      // 모든 구독 해지
      subscribedRoomsRef.current.forEach(roomId => {
        const destination = `/user/queue/chat/${roomId}`;
        WebSocketService.unsubscribe(destination);
      });
      
      subscribedRoomsRef.current.clear();
      isWebSocketConnectedRef.current = false;
      
      // WebSocket 연결 해제
      WebSocketService.disconnect();
    };
  }, [isLoggedIn]);

  // 채팅방 목록이 변경될 때 구독 관리
  useEffect(() => {
    if (!isLoggedIn || chatRooms.length === 0 || !isWebSocketConnectedRef.current) return;

    const manageSubscriptions = () => {
      const activeRoomIds = new Set(
        chatRooms
          .filter(room => room.status === 'ACTIVE')
          .map(room => room.chatRoomId)
      );

      // 더 이상 활성화되지 않은 방의 구독 해지
      subscribedRoomsRef.current.forEach(roomId => {
        if (!activeRoomIds.has(roomId)) {
          const destination = `/user/queue/chat/${roomId}`;
          WebSocketService.unsubscribe(destination);
          subscribedRoomsRef.current.delete(roomId);
          console.log(`[ChatRooms] Unsubscribed from room ${roomId}`);
        }
      });

      // 새로운 활성 방에 구독
      activeRoomIds.forEach(roomId => {
        if (!subscribedRoomsRef.current.has(roomId)) {
          const destination = `/user/queue/chat/${roomId}`;
          const subscription = WebSocketService.subscribe(
            destination,
            (message) => {
              const receivedMessage = JSON.parse(message.body);
              setChatRooms(prevRooms =>
                prevRooms.map(r =>
                  r.chatRoomId === roomId
                    ? { ...r, latestMessageContent: receivedMessage.content }
                    : r
                )
              );
              setNewMessageRooms(prev => { const next = new Set(prev); next.add(roomId); return next; });
            }
          );
          
          if (subscription) {
            subscribedRoomsRef.current.add(roomId);
            console.log(`[ChatRooms] Subscribed to room ${roomId}`);
          }
        }
      });
    };

    // WebSocket이 연결된 상태에서만 구독 관리
    if (WebSocketService.isConnected()) {
      manageSubscriptions();
    } else {
      // WebSocket이 연결되지 않은 경우 재연결 시도
      const reconnectAndSubscribe = async () => {
        try {
          await WebSocketService.connect();
          isWebSocketConnectedRef.current = true;
          manageSubscriptions();
        } catch (error) {
          console.error('WebSocket 재연결 실패:', error);
        }
      };
      reconnectAndSubscribe();
    }
  }, [chatRooms, isLoggedIn]);

  // 페이지 언로드 시 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('[ChatRooms] Page unloading, cleaning up...');
      subscribedRoomsRef.current.forEach(roomId => {
        const destination = `/user/queue/chat/${roomId}`;
        WebSocketService.unsubscribe(destination);
      });
      WebSocketService.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleChatRoomClick = (chatRoomId, room) => {
    setNewMessageRooms(prev => {
      const next = new Set(prev);
      next.delete(chatRoomId);
      return next;
    });
    navigate(`/lostAnimal/detail/${room.lostPostInfo.postId}/chat/${chatRoomId}`);
  };

  const sortedRooms = useMemo(() => {
    return [...chatRooms].sort((a, b) => {
      if (a.status === b.status) return 0;
      // a가 INACTIVE 면 뒤로, 아니면 앞으로
      return a.status === 'INACTIVE' ? 1 : -1;
    });
  }, [chatRooms]);

  if (loading) return <div className="chat-rooms-container">로딩 중...</div>;
  if (error) return <div className="chat-rooms-container">{error}</div>;

  return (
    <div className="chat-rooms-container">
      <h1>채팅 목록</h1>
      <div className="chat-rooms-list">
      {sortedRooms.length === 0 ? (
          <div className="no-chat-rooms">
            진행 중인 채팅이 없습니다.
          </div>
        ) : (
          sortedRooms.map(room => {
            const isAuthor = user?.userId === room.lostPostInfo.authorId;
            const postTypeLabel = room.lostPostInfo.postType === 'LOST' ? '실종' : '발견';
            
            return (
              <div
                key={room.chatRoomId}
                className={[
                  'chat-room-item',
                  room.status === 'INACTIVE' ? 'inactive' : '',
                  newMessageRooms.has(room.chatRoomId) ? 'new-message' : ''
                ].join(' ')}
                onClick={() => handleChatRoomClick(room.chatRoomId, room)}
                >
                <div className="chat-room-image">
                  <img src={room.lostPostInfo.imageUrl} alt="분실동물" />
                </div>
                <div className="chat-room-info">
                  
                  {/* ← 수정된 헤더 */}
                  <div className="chat-room-header">
                    <span className="chat-room-header-user">
                      {isAuthor ? '나의 공고' : room.lostPostInfo.author}
                    </span>
                    <span className="chat-room-header-sep">|</span>
                    <span className={`
                      chat-room-header-type
                      ${room.lostPostInfo.postType === 'LOST' ? 'lost' : 'found'}
                      `}
                    >
                      {postTypeLabel}
                    </span>
                    <span className={`chat-room-status ${room.status.toLowerCase()}`}>
                      {room.status === 'ACTIVE' ? '' : '종료된 채팅'}
                    </span>
                  </div>
                  
                  {/* 메시지 영역은 그대로 */}
                  <div className="chat-room-message">
                    {room.latestMessageContent || "새로운 채팅을 시작해보세요!"}
                  </div>
                  
                  {/* ← 수정된 푸터 */}
                  <div className="chat-room-footer">
                    <span className="chat-room-author">
                      {isAuthor
                        ? `${room.participantUserName}님`
                        : `📍 ${room.lostPostInfo.location}`
                      }
                    </span>
                    <span
                      className="post-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/lostAnimal/detail/${room.lostPostInfo.postId}`);
                      }}
                    >
                      공고로 이동 &gt;
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatRooms;
