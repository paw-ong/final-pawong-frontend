import React, {useEffect, useState} from "react";
import {Link} from 'react-router-dom';
import './PetCard.css';
import PropTypes from 'prop-types';
import client from "../../../api/client";
import FavoriteButton from "../../common/FavoriteButton";

// API 기본 URL 설정 - Nginx 프록시 사용 시 상대 경로 사용
const API_BASE_URL = '';  // 빈 문자열로 설정하면 현재 호스트로 요청됨

const formatDate = (dateString) => {
  if (!dateString) return '날짜 정보 없음';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '.').slice(0, -1); // "2024.03.19" 형식으로 변환
};

function PetCard({ pet, type }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // // 디버깅을 위해 pet 객체를 콘솔에 출력
  // useEffect(() => {
  //   // console.log('PetCard에 전달된 pet:', pet);
  // }, [pet]);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    
    // 로그인 상태에서만 찜 상태 확인
    if (userToken && pet.id) {
      // 초기 찜 상태 확인 API 호출
      // console.log(`찜 상태 확인 API 호출: /api/users/favorites/${pet.id}/status`);
      client.get(`/users/favorites/${pet.id}/status`)
      .then(response => {
        // console.log('찜 상태 응답:', response);
        setIsFavorite(response.data.isInFavorites);
      })
      .catch(error => console.error('찜 상태 확인 실패: ', error));
    }
  }, [pet.id]);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);
  }, []);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    
    const userToken = localStorage.getItem('userToken');
    
    if (!userToken) {
      alert('로그인이 필요한 서비스입니다!');
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

  const renderInfoItem = (label, value) => {
    if (!value) return null;
    return (
      <div className="info-item">
        <span className="info-label">{label}</span>
        <span className="info-value">{value}</span>
      </div>
    );
  };

  return (
    <Link to={`/${type}/${pet.id}`} className="pet-card-link">
      <div className="pet-card">
        <div className="pet-card-img-container">
          <img src={pet.imgUrl} alt={pet.name || '동물 사진'} className="pet-card-img"/>
        </div>
        <div className="pet-card-content">
          <div className="pet-card-header">
            <h3 className="pet-upKindNm">{pet.kindNm}</h3>
            <div className="pet-favorite-container">
              <FavoriteButton
                isFavorite={isFavorite}
                onClick={handleFavoriteClick}
                className="pet-card-favorite-btn"
              />
            </div>
          </div>
          <div className="pet-card-info">
            <div className="pet-info-item">
              <strong>성별</strong>
              <span>{pet.sexCd}</span>
            </div>
            <div className="pet-info-item">
              <strong>나이</strong>
              <span>{pet.age}</span>
            </div>
            {pet.neuterYn && (
              <div className="pet-info-item">
                <strong>중성화 여부</strong>
                <span>{pet.neuterYn}</span>
              </div>
            )}
          </div>
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