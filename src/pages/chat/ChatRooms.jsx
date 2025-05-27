import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { AuthContext } from '../../contexts/AuthContext';
import './ChatRooms.css';

function ChatRooms() {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

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

  const handleChatRoomClick = (chatRoomId) => {
    navigate(`/chat/${chatRoomId}`);
  };

  if (loading) return <div className="chat-rooms-container">로딩 중...</div>;
  if (error) return <div className="chat-rooms-container">{error}</div>;

  return (
    <div className="chat-rooms-container">
      <h1>채팅 목록</h1>
      <div className="chat-rooms-list">
        {chatRooms.length === 0 ? (
          <div className="no-chat-rooms">
            진행 중인 채팅이 없습니다.
          </div>
        ) : (
          chatRooms.map((room) => (
            <div
              key={room.chatRoomId}
              className={`chat-room-item ${room.status === 'INACTIVE' ? 'inactive' : ''}`}
              onClick={() => handleChatRoomClick(room.chatRoomId)}
            >
              <div className="chat-room-image">
                <img src={room.lostPostInfo.imageUrl} alt="분실동물" />
              </div>
              <div className="chat-room-info">
                <div className="chat-room-header">
                  <span className="chat-room-kind">{room.lostPostInfo.kindNm}</span>
                  <span className="chat-room-location">{room.lostPostInfo.location}</span>
                  <span className={`chat-room-status ${room.status.toLowerCase()}`}>
                    {room.status === 'ACTIVE' ? '🟢 진행중' : '🔴 종료됨'}
                  </span>
                </div>
                <div className="chat-room-message">
                  {room.latestMessageContent || "새로운 채팅을 시작해보세요!"}
                </div>
                <div className="chat-room-footer">
                  <span className="chat-room-author">공고 작성자: {room.lostPostInfo.author}</span>
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
          ))
        )}
      </div>
    </div>
  );
}

export default ChatRooms; 