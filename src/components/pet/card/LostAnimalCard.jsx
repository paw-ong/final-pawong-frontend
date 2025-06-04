import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../../api/client';
import { AuthContext } from '../../../contexts/AuthContext';
import './LostAnimalCard.css';
import BookmarkButton from '../../common/BookmarkButton';

// 북마크 이미지 임포트
import bookmarkEmpty from '../../../assets/images/bookmark/unbookmark.png';
import bookmarkFilled from '../../../assets/images/bookmark/bookmark.png';

function LostAnimalCard({ post, type }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, handleShowAuthModal } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const endpoint = post.postType === 'FOSTER'
          ? `/users/bookmarks/lost-animals/lost-adoptions/${post.postId}/status`
          : `/users/bookmarks/lost-animals/lost-posts/${post.postId}/status`;

          const { data } = await client.get(endpoint, {
            headers: {
              'X-Skip-Auth-Error': 'true'
            }
          });
        setIsBookmarked(data.bookmarked);
      } catch (error) {
        console.error('북마크 상태 조회 실패:', error);
      }
    };

    fetchBookmarkStatus();
  }, [post.postId, post.postType]);

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
    e.preventDefault(); // 기본 동작 방지
    e.stopPropagation(); // 이벤트 전파 방지
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
    <a 
      href={post.postType === 'FOSTER' ? `/adoptions/${post.postId}` : `/lostAnimal/detail/${post.postId}`}
      className="lost-animal-card"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
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
            <BookmarkButton
              isBookmarked={isBookmarked}
              onClick={handleBookmarkToggle}
              disabled={isLoading}
            />
            {showError && (
              <div className="bookmark-error">
                오류가 발생했습니다. 잠시 후 다시 시도해주세요.
              </div>
            )}
          </div>
        </div>

        <div className="card-info">
          <div className="info-item">
            <strong>{getDateLabel()}</strong>
            <span>{post.happenedDate}</span>
          </div>
          <div className="info-item place-info">
            <strong>{getPlaceLabel()}</strong>
            <span>{post.happenedPlace}</span>
          </div>
          <div className="info-item">
            <strong>특징</strong>
            <span>{post.feature}</span>
          </div>
        </div>

        <div className="card-footer">
          <span className="author">
            {post.postType === 'FOSTER' ? '보호소' : '작성자'}: {post.author}
          </span>
          <span className="created-at">{post.createdAt}</span>
        </div>
      </div>
    </a>
  );
}

export default LostAnimalCard; 