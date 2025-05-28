import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import './ChatRoomsByPost.css';

function ChatRoomsByPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await client.get('chat/rooms', {
          params: { postId }
        });
        if (response.data && response.data.chatRoomsDetails) {
          setChatRooms(response.data.chatRoomsDetails);
        }
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error);
        setError('채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [postId]);

  const handleChatRoomClick = (chatRoomId) => {
    navigate(`/chat/${chatRoomId}`);
  };

  if (loading) return <div className="chat-rooms-container">로딩 중...</div>;
  if (error) return <div className="chat-rooms-container">{error}</div>;

  return (
    <div className="chat-rooms-container">
      <h2>채팅방 목록</h2>
      <div className="chat-rooms-list">
        {chatRooms.length === 0 ? (
          <div className="no-chat-rooms">
            요청된 채팅이 없습니다.
          </div>
        ) : (
          chatRooms.map((room) => (
            <div
              key={room.chatRoomId}
              className={`chat-room-item ${room.status === 'INACTIVE' ? 'inactive' : ''}`}
              onClick={() => handleChatRoomClick(room.chatRoomId)}
            >
              <div className="chat-room-image">
                <img 
                  src={room.lostPostInfo.imageUrl} 
                  alt={`${room.lostPostInfo.kindNm}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-image.jpg';
                  }}
                />
              </div>
              <div className="chat-room-info">
                <div className="chat-room-header">
                  <span className="participant-name">{room.participantUserName}</span>
                  <span className={`chat-room-status ${room.status.toLowerCase()}`}>
                    {room.status === 'ACTIVE' ? '🟢 진행중' : '🔴 종료됨'}
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