import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import './AdoptionDetail.css';
import userImage from '../assets/images/user.jpg'
import likeImg from '../assets/images/like/like.png';
import unlikeImg from '../assets/images/like/unlike.png';
import client from "../api/client";

function AdoptionDetail() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [adoptionData, setAdoptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdoptionData = async () => {
      try {
        const response = await client.get(`/adoptions/${id}`);
        console.log(response); // 전체 응답 확인
        console.log(response.data); // 실제 데이터 확인
        setAdoptionData(response.data);
      } catch (error) {
        console.error('Error fetching adoption data:', error);
        setModalMsg('데이터를 불러오는데 실패했습니다.');
        setShowModal(true);
        setTimeout(() => setShowModal(false), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionData();
  }, [id]);

  // 찜 상태 확인
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    
    if (userToken && id) {
      client.get(`/users/me/favorites/${id}/status`)
        .then(response => {
          setIsFavorite(response.data.inFavorites);
        })
        .catch(error => console.error('찜 상태 확인 실패: ', error));
    }
  }, [id]);

  const handleFavoriteClick = () => {
    const userToken = localStorage.getItem('userToken');
    
    if (!userToken) {
      setModalMsg('로그인이 필요한 서비스입니다!');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500);
      return;
    }
    
    client.post(`/users/me/favorites/${id}`)
      .then(response => {
        setIsFavorite(response.data.inFavorites);
        setModalMsg(response.data.inFavorites ? "즐겨찾기에 추가하였습니다." : "즐겨찾기가 해제되었습니다.");
        setShowModal(true);
        setTimeout(() => setShowModal(false), 1500);
      })
      .catch(error => {
        console.error('찜 처리 실패: ', error);
        setModalMsg('찜 처리에 실패했습니다.');
        setShowModal(true);
        setTimeout(() => setShowModal(false), 1500);
      });
  };

  const displayValue = (value) => {
    return value || '추가예정';
  };

  const calculateAge = (birthYear) => {
    if (!birthYear) return '문의바람';
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return age < 1 ? '나이 측정 불가' : `${age}세`;
  };

  if (loading) {
    return <div className="adoption-container">로딩 중...</div>;
  }

  if (!adoptionData) {
    return <div className="adoption-container">데이터를 불러올 수 없습니다.</div>;
  }

  const { adoptionDetailDto, shelterDetailDto } = adoptionData;

  return (
    <div className="adoption-container-row">
      <div className="adoption-container">
        <div className="adoption-center-row">
          <div className="adoption-image-info-group">
            <div className="adoption-image-box">
              <img src={adoptionDetailDto.popfile2 || userImage} alt="이미지" />
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
            <div className="adoption-info-box">
              <div className="shelter-info">
                <div className="shelter-info-item">
                  <span className="shelter-info-label">품종명</span>
                  <span className="shelter-info-value">{displayValue(adoptionDetailDto.kindNm)}</span>
                </div>
                <div className="shelter-info-item">
                  <span className="shelter-info-label">성별</span>
                  <span className="shelter-info-value">
                    {adoptionDetailDto.sexCd === 'M' ? (
                      <span style={{fontSize: '24px', color: '#2196F3'}}>♂</span>
                    ) : adoptionDetailDto.sexCd === 'F' ? (
                      <span style={{fontSize: '24px', color: '#FF69B4'}}>♀</span>
                    ) : (
                      <span>확인불가</span>
                    )}
                  </span>
                </div>
                <div className="shelter-info-item">
                  <span className="shelter-info-label">중성화여부</span>
                  <span className="shelter-info-value">
                    {adoptionDetailDto.neuterYn === 'Y' ? (
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png" 
                        alt="완료" 
                        style={{width: '18px', height: '18px'}}
                      />
                    ) : adoptionDetailDto.neuterYn === 'N' ? (
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" 
                        alt="미완료" 
                        style={{width: '18px', height: '18px'}}
                      />
                    ) : (
                      <span>확인 불가</span>
                    )}
                  </span>
                </div>
                <div className="shelter-info-item">
                  <span className="shelter-info-label">체중</span>
                  <span className="shelter-info-value">{displayValue(adoptionDetailDto.weight)}</span>
                </div>
                <div className="shelter-info-item">
                  <span className="shelter-info-label">나이</span>
                  <span className="shelter-info-value">{calculateAge(adoptionDetailDto.age)}</span>
                </div>
                <div className="shelter-info-item">
                  <span className="shelter-info-label">색상</span>
                  <span className="shelter-info-value">{displayValue(adoptionDetailDto.colorCd)}</span>
                </div>
                <div className="shelter-info-item">
                  <span className="shelter-info-label">구조번호</span>
                  <span className="shelter-info-value">{displayValue(adoptionDetailDto.desertionNo)}</span>
                </div>
                <div className="shelter-info-item">
                  <span className="shelter-info-label">공고종료일</span>
                  <span className="shelter-info-value">{displayValue(adoptionDetailDto.noticeEdt)}</span>
                </div>
                <div className="shelter-info-item full-width">
                  <span className="shelter-info-label">특이사항</span>
                  <span className="shelter-info-value">{displayValue(adoptionDetailDto.tagsField)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="adoption-bottom-box">
          <div className="shelter-info">
            <div className="shelter-info-item">
              <span className="shelter-info-label">동물보호센터명</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.careNm)}</span>
            </div>
            <div className="shelter-info-item">
              <span className="shelter-info-label">전화번호</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.careTel)}</span>
            </div>
            <div className="shelter-info-item">
              <span className="shelter-info-label">휴무일</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.closeDay)}</span>
            </div>
            <div className="shelter-info-item">
              <span className="shelter-info-label">구조대상동물</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.saveTrgtAnimal)}</span>
            </div>
            <div className="shelter-info-item">
              <span className="shelter-info-label">동물보호센터 유형</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.divisionNm)}</span>
            </div>
            <div className="shelter-info-item">
              <span className="shelter-info-label">운영시간</span>
              <span className="shelter-info-value">
                {displayValue(`${shelterDetailDto.weekOprStime} - ${shelterDetailDto.weekOprEtime}`)}
              </span>
            </div>
            <div className="shelter-info-item">
              <span className="shelter-info-label">수의사 인원수</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.vetPersonCnt)}</span>
            </div>
            <div className="shelter-info-item">
              <span className="shelter-info-label">사양관리사 인원수</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.specsPersonCnt)}</span>
            </div>
            <div className="shelter-info-item full-width">
              <span className="shelter-info-label">소재지 도로명 주소</span>
              <span className="shelter-info-value">{displayValue(shelterDetailDto.careAddr)}</span>
            </div>
            <div className="shelter-info-notice">
            입양 안내 및 기타 문의 사항은 유선 연락 바랍니다
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="adoption-modal">
          {modalMsg}
        </div>
      )}
    </div>
  );
}

export default AdoptionDetail;
