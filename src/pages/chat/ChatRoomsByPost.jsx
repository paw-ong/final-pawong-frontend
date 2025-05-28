import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import WebSocketService from '../../services/WebSocketService';
import { AuthContext } from '../../contexts/AuthContext';
import './ChatRoomsByPost.css';

function ChatRoomsByPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessageRooms, setNewMessageRooms] = useState(new Set());

  // 구독 추적용 refs
  const subscribedRoomsRef = useRef(new Set());
  const isWebSocketConnectedRef = useRef(false);

  // 1) 서버에서 방 목록 불러오기
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchChatRooms = async () => {
      setLoading(true);
      try {
        const response = await client.get('/chat/rooms', { params: { postId } });
        setChatRooms(response.data.chatRoomsDetails || []);
      } catch (e) {
        console.error('채팅방 목록 조회 실패:', e);
        setError('채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchChatRooms();
  }, [postId, isLoggedIn, navigate]);

  // 2) 최초 마운트 시 WebSocket 연결, 언마운트 시 정리
  useEffect(() => {
    if (!isLoggedIn) return;

    const connect = async () => {
      if (!isWebSocketConnectedRef.current) {
        try {
          await WebSocketService.connect();
          isWebSocketConnectedRef.current = true;
          console.log('[ByPost] WebSocket connected');
        } catch (e) {
          console.error('[ByPost] WebSocket 연결 실패:', e);
        }
      }
    };
    connect();

    return () => {
      // 모든 구독 해지
      subscribedRoomsRef.current.forEach(roomId => {
        WebSocketService.unsubscribe(`/user/queue/chat/${roomId}`);
      });
      subscribedRoomsRef.current.clear();
      // 연결 해제
      WebSocketService.disconnect();
      isWebSocketConnectedRef.current = false;
    };
  }, [isLoggedIn]);

  // 3) chatRooms 변경 시 ACTIVE 방들 구독 / 해지
  useEffect(() => {
    if (!isWebSocketConnectedRef.current || chatRooms.length === 0) return;

    const activeRoomIds = new Set(
      chatRooms
        .filter(r => r.status === 'ACTIVE')
        .map(r => r.chatRoomId)
    );

    // 3-1) 더 이상 ACTIVE가 아닌 방 구독 해지
    subscribedRoomsRef.current.forEach(roomId => {
      if (!activeRoomIds.has(roomId)) {
        WebSocketService.unsubscribe(`/user/queue/chat/${roomId}`);
        subscribedRoomsRef.current.delete(roomId);
      }
    });

    // 3-2) 새로운 ACTIVE 방 구독
    activeRoomIds.forEach(roomId => {
      if (!subscribedRoomsRef.current.has(roomId)) {
        const dest = `/user/queue/chat/${roomId}`;
        WebSocketService.subscribe(dest, message => {
          const payload = JSON.parse(message.body);
          setChatRooms(prev =>
            prev.map(r =>
              r.chatRoomId === roomId
                ? { ...r, latestMessageContent: payload.content }
                : r
            )
          );
          setNewMessageRooms(prev => {
            const next = new Set(prev);
            next.add(roomId);
            return next;
          });
        });
        subscribedRoomsRef.current.add(roomId);
      }
    });
  }, [chatRooms]);

  const handleChatRoomClick = (chatRoomId) => {
    setNewMessageRooms(prev => {
      const next = new Set(prev);
      next.delete(chatRoomId);
      return next;
    });
    navigate(`/chat/${chatRoomId}`);
  };

  if (loading) return <div className="chat-rooms-container">로딩 중...</div>;
  if (error)   return <div className="chat-rooms-container">{error}</div>;

  return (
    <div className="chat-rooms-container">
      <h2>채팅방 목록</h2>
      <div className="chat-rooms-list">
        {chatRooms.length === 0 ? (
          <div className="no-chat-rooms">
            요청된 채팅이 없습니다.
          </div>
        ) : (
          chatRooms.map(room => (
            <div
            key={room.chatRoomId}
            className={[
              'chat-room-item',
              room.status === 'INACTIVE' ? 'inactive' : '',
              newMessageRooms.has(room.chatRoomId) ? 'new-message' : ''
            ].join(' ')}
            onClick={() => handleChatRoomClick(room.chatRoomId)}
            >
              <div className="chat-room-image">
                <img 
                  src={room.lostPostInfo.imageUrl} 
                  alt={room.lostPostInfo.kindNm}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/default-image.jpg';
                  }}
                />
              </div>
              <div className="chat-room-info">
                <div className="chat-room-header">
                  <span className="participant-name">{room.participantUserName}</span>
                  <span className={`chat-room-status ${room.status.toLowerCase()}`}>
                    {room.status === 'ACTIVE' ? '🟢' : '🔴'}
                  </span>
                </div>
                <div className="chat-room-message">
                  {room.latestMessageContent || "새로운 채팅을 시작해보세요!"}
                </div>
                <div className="chat-room-footer">
                  <span className="chat-room-kind">{room.lostPostInfo.kindNm}</span>
                  <span className="divider">|</span>
                  <span className="chat-room-location">{room.lostPostInfo.location}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatRoomsByPost;
