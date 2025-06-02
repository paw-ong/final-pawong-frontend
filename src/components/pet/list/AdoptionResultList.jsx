import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import PetCard from "../card/PetCard.jsx";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./AdoptionResultList.css";
import client from "../../../api/client";

// API 기본 URL 설정 - Nginx 프록시 사용 시 상대 경로 사용
const API_BASE_URL = '';  // 빈 문자열로 설정하면 현재 호스트로 요청됨

function AdoptionResultList({ isSearch, searchResults, loading, onRequireAuth }) {
  const [pets, setPets] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const observer = useRef();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 무한 스크롤을 위한 ref 콜백
  const lastPetElementRef = useCallback(node => {
    if (localLoading || loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [localLoading, loading, hasMore]);

  // 일반 목록 데이터 가져오기
  const fetchAdoptions = async () => {
    if (isSearch) return; // 검색 모드면 실행하지 않음
    
    try {
      setLocalLoading(true);
      const response = await client.get(`/adoptions`, {
        params: { page }
      });
      
      // 첫 페이지일 경우 데이터 교체, 아닐 경우 추가
      if (page === 1) {
        setPets(response.data.adoptionCards || []);
      } else {
        setPets(prevPets => [...prevPets, ...(response.data.adoptionCards || [])]);
      }
      
      setHasMore(response.data.hasNext);
    } catch (error) {
      console.error('Failed to fetch adoption list:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // 검색 모드 변경 시 데이터 초기화
  useEffect(() => {
    if (isSearch) {
      setPets([]);
    } else {
      // 일반 모드로 돌아갈 때 첫 페이지부터 다시 로드
      setPage(1);
    }
  }, [isSearch]);

  // 검색 결과가 변경될 때
  useEffect(() => {
    if (isSearch && searchResults) {
      console.log("검색 결과:", searchResults);
      // 검색 결과로 데이터 교체
      setPets(searchResults.adoptionCards || []);
      setHasMore(searchResults.hasNext || false);
    }
  }, [isSearch, searchResults]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (!isSearch) {
      fetchAdoptions();
    }
  }, [page, isSearch]);

  // API 응답을 PetCard 형식에 맞게 변환
  const formatPetData = (item) => {
    const currentYear = new Date().getFullYear();
    const ageInYears = item.age ? currentYear - item.age : null;
    const ageString = ageInYears ? `${ageInYears}살` : '나이 미상';
  
    return {
      id: item.adoptionId,  // 중요: adoptionId를 id로 매핑해야 PetCard의 API 호출이 정상 작동
      imgUrl: item.popfile1,
      kindNm: item.kindNm || '기타',
      sexCd: item.sexCd === 'M' ? '수컷' : item.sexCd === 'F' ? '암컷' : '미상',
      age: ageString,
      neuterYn: item.neuterYn === 'Y' ? 'O' : item.neuterYn === 'N' ? 'X' : '미상'
    };
  };

  // 검색 중이고 결과가 null이거나 아직 로드되지 않은 경우
  if (isSearch && (loading || !searchResults)) {
    return (
      <div className="adoption-result-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // 일반 모드에서 로딩 중이고 결과가 없는 경우
  if (!isSearch && localLoading && pets.length === 0) {
    return (
      <div className="adoption-result-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // 결과가 없는 경우
  if (!pets || pets.length === 0) {
    return <div className="adoption-result-empty">검색 결과가 없습니다.</div>;
  }

  return (
    <div className="adoption-result-container">
      <div className="adoption-result-grid">
        {pets.map((item, index) => (
          <div 
            key={`${item.adoptionId}-${index}`} 
            ref={index === pets.length - 1 ? lastPetElementRef : null}
            className="adoption-result-item"
          >
            <PetCard 
              pet={formatPetData(item)} 
              type="adoptions" 
              onRequireAuth={() => setShowAuthModal(true)}
            />
          </div>
        ))}
      </div>
      {((!isSearch && localLoading) || (isSearch && loading)) && pets.length > 0 && (
        <div className="adoption-result-loading">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

AdoptionResultList.propTypes = {
  isSearch: PropTypes.bool,
  searchResults: PropTypes.object,
  loading: PropTypes.bool
};

export default AdoptionResultList; 