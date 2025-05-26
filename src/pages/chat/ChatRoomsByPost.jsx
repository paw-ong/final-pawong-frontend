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
        const response = await client.get(`chat/rooms/post/${postId}`);
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
        {chatRooms.map((room) => (
          <div
            key={room.chatRoomId}
            className="chat-room-item"
            onClick={() => handleChatRoomClick(room.chatRoomId)}
          >
            <div className="chat-room-image">
              <img 
                src={room.lostPostInfo.imageUrl} 
                alt={`${room.lostPostInfo.kindNm}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-image.jpg'; // 기본 이미지로 대체
                }}
              />
            </div>
            <div className="chat-room-info">
              <h3>{room.participantUserName}</h3>
              <p className="kind">{room.lostPostInfo.kindNm}</p>
              <p className="location">{room.lostPostInfo.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatRoomsByPost; 