import React, {useEffect, useState, useContext} from "react";
import {Link} from 'react-router-dom';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import AuthRequiredModal from '../../auth/AuthRequiredModal';
import './PetCard.css';
import likeImg from '../../../assets/images/like/like.png';
import unlikeImg from '../../../assets/images/like/unlike.png';
import PropTypes from 'prop-types';
import client from "../../../api/client";
import { AuthContext } from "../../../contexts/AuthContext";

// API 기본 URL 설정 - Nginx 프록시 사용 시 상대 경로 사용
const API_BASE_URL = '';  // 빈 문자열로 설정하면 현재 호스트로 요청됨

function PetCard({ pet, type }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { data: user } = useCurrentUser();
  const isLoggedIn = !!user;
  const { handleShowAuthModal } = useContext(AuthContext);

  useEffect(() => {
    // 로그인 상태에서만 초기 찜 상태 확인 API 호출
    if (isLoggedIn) {
      client.get(`/users/favorites/${pet.id}/status`, {
        headers: {
          'X-Skip-Auth-Error': 'true'
        }
      })
      .then(response => {
        setIsFavorite(response.data.isInFavorites);
      })
      .catch(error => console.error('찜 상태 확인 실패: ', error));
    }
  }, [pet.id, isLoggedIn]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      handleShowAuthModal();
      return;
    }
    
    console.log(`찜하기 토글 API 호출: /api/users/favorites/${pet.id}/toggle`);
    client.post(`/users/favorites/${pet.id}/toggle`)
    .then(response => {
      console.log('찜 처리 응답222:', response);
      setIsFavorite(response.data.isInFavorites);
    })
    .catch(error => {
      console.error('찜 처리 실패: ', error);
    });
  };

  return (
    <Link to={`/${type}/${pet.id}`} className="card-link">
      <div className="card">
        <div className="card-img-container">
          <img src={pet.imgUrl} alt={pet.name || '동물 사진'} className="card-img"/>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
            onClick={handleFavoriteClick}
            data-is-favorite={isFavorite}
          >
            <img 
              src={isFavorite ? likeImg : unlikeImg}
              alt={isFavorite ? "찜 해제" : "찜 하기"}
              className="favorite-icon"
              style={{ 
                width: isFavorite ? '20px' : '18px',
                height: isFavorite ? '20px' : '18px',
                transition: 'all 0.3s ease'
              }}
            />
          </button>
        </div>
        <div className="card-content">
          <p className="pet-kindNm">{pet.kindNm || '정보 없음'}</p>
          <div className="pet-info-row">
            <span className="pet-sexCd">{pet.sexCd || '정보 없음'}</span>
            <span className="info-divider">•</span>
            <span className="pet-age">{pet.age || '정보 없음'}</span>
          </div>
          <p className="pet-neuterYn">{pet.neuterYn || '중성화 정보 없음'}</p>
        </div>
      </div>
    </Link>
  );
}

PetCard.propTypes = {
  pet: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    upKindNm: PropTypes.string,
    sexCd: PropTypes.string,
    age: PropTypes.string,
    neuterYn: PropTypes.string,
  }).isRequired,
  type: PropTypes.string.isRequired,
};

export default PetCard;