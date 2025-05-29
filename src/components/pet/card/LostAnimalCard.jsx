import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../../api/client';
import { AuthContext } from '../../../contexts/AuthContext';
import './LostAnimalCard.css';

// 북마크 이미지 임포트
import bookmarkEmpty from '../../../assets/images/bookmark/unbookmark.png';
import bookmarkFilled from '../../../assets/images/bookmark/bookmark.png';

function LostAnimalCard({ post, type }) {
  const navigate = useNavigate();
  const { isLoggedIn, handleShowAuthModal } = useContext(AuthContext);
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'LOST':
        return '#ff6b6b';
      case 'FOUND':
        return '#4dabf7';
      case 'FOSTER':
        return '#51cf66';
      default:
        return '#868e96';
    }
  };

  const getPostTypeText = (type) => {
    switch (type) {
      case 'LOST':
        return '실종';
      case 'FOUND':
        return '발견';
      case 'FOSTER':
        return '구조';
      default:
        return '';
    }
  };

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (isLoading) return;
    if (!isLoggedIn) {
      handleShowAuthModal();
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = post.postType === 'LOST' || post.postType === 'FOUND'
        ? `/users/bookmarks/lost-animals/lost-posts/${post.postId}/toggle`
        : `/users/bookmarks/lost-animals/lost-adoptions/${post.postId}/toggle`;

      const { data } = await client.post(endpoint);
      setIsBookmarked(data.bookmarked);
    } catch (error) {
      if (error.status && error.status === 401) {
        handleShowAuthModal();
      } else {
        alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    if (post.postType === 'FOSTER') {
      navigate(`/adoptions/${post.postId}`);
    } else {
      navigate(`/lostAnimal/detail/${post.postId}`, { state: { postType: post.postType } });
    }
  };

  const renderInfoItem = (label, value) => {
    if (!value || value.trim() === '') return null;
    return (
      <p><strong>{label}:</strong> {value}</p>
    );
  };

  const getDateLabel = () => {
    return post.postType === 'LOST' ? '실종일' : '발견일';
  };

  const getPlaceLabel = () => {
    return post.postType === 'LOST' ? '실종장소' : '발견장소';
  };

  return (
    <div className="lost-animal-card" onClick={handleCardClick}>
      <div className="post-type-badge" style={{ backgroundColor: getPostTypeColor(post.postType) }}>
        {getPostTypeText(post.postType)}
      </div>
      
      <div className="card-image">
        <img src={post.imageUrl} alt={`${post.kindNm} 이미지`} />
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3>{post.kindNm}</h3>
          <div className="bookmark-container">
            <button 
              className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmarkToggle}
              disabled={isLoading}
              data-is-bookmarked={isBookmarked}
            >
              <img 
                src={isBookmarked ? bookmarkFilled : bookmarkEmpty} 
                alt="북마크" 
                className="bookmark-icon"
              />
            </button>
          </div>
        </div>

        <div className="card-info">
          {renderInfoItem(getDateLabel(), post.happenedDate)}
          {renderInfoItem(getPlaceLabel(), post.happenedPlace)}
          {renderInfoItem('특징', post.feature)}
        </div>

        <div className="card-footer">
          <span className="author">
            {post.postType === 'FOSTER' ? '보호소' : '작성자'}: {post.author}
          </span>
          <span className="created-at">{post.createdAt}</span>
        </div>
      </div>
    </div>
  );
}

export default LostAnimalCard; 