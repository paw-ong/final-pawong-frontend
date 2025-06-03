import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import LostAnimalCard from "../card/LostAnimalCard.jsx";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./LostAnimalResultList.css";
import client from "../../../api/client";

function LostAnimalResultList({ isSearch, searchResults, loading, type = "LOST" }) {
  const [pets, setPets] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const observer = useRef();

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
  const fetchLostAnimals = async () => {
    if (isSearch) return; // 검색 모드면 실행하지 않음
    
    try {
      setLocalLoading(true);
      let endpoint = '/lost-animals';
      let params = {
        type: type,
        page: page - 1,
        size: 12
      };
      
      if (type === 'FOSTER') {
        endpoint = '/lost-animals/adoption';
        params = {
          page: page - 1,
          size: 12
        };
      }

      const response = await client.get(endpoint, { params });
      
      console.log('API Response Data:', response.data);
      console.log('LostPostCards:', response.data?.lostPostCards);
      console.log('First Card Data:', response.data?.lostPostCards?.[0]);
      
      // 첫 페이지일 경우 데이터 교체, 아닐 경우 추가
      if (page === 1) {
        setPets(response.data?.lostPostCards || []);
      } else {
        setPets(prevPets => [...prevPets, ...(response.data?.lostPostCards || [])]);
      }
      
      setHasMore(response.data?.hasNext || false);
    } catch (error) {
      console.error('Failed to fetch lost animal list:', error);
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
      console.log('검색 결과 업데이트:', searchResults);
      // 검색 결과로 데이터 교체
      setPets(searchResults.lostPostCards || []);
      setHasMore(searchResults.hasNext || false);
    }
  }, [isSearch, searchResults]);

  // 타입이 변경될 때 페이지 초기화 및 데이터 다시 로드
  useEffect(() => {
    setPage(1);
    setPets([]);
    setHasMore(true);
  }, [type]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (!isSearch) {
      fetchLostAnimals();
    }
  }, [page, isSearch, type]);

  // 검색 중이고 결과가 null이거나 아직 로드되지 않은 경우
  if (isSearch && (loading || !searchResults)) {
    return (
      <div className="lost-animal-result-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // 일반 모드에서 로딩 중이고 결과가 없는 경우
  if (!isSearch && localLoading && pets.length === 0) {
    return (
      <div className="lost-animal-result-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // 결과가 없는 경우
  if (!pets || pets.length === 0) {
    return <div className="lost-animal-result-empty">검색 결과가 없습니다.</div>;
  }

  return (
    <>
      <div className="lost-animal-result-grid">
        {pets.map((item, index) => (
          <div 
            key={`${item.postId}-${index}`} 
            ref={index === pets.length - 1 ? lastPetElementRef : null}
            className="lost-animal-result-item"
          >
            <LostAnimalCard post={item} type={type} />
          </div>
        ))}
      </div>
      {((!isSearch && localLoading) || (isSearch && loading)) && pets.length > 0 && (
        <div className="lost-animal-result-loading">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}

LostAnimalResultList.propTypes = {
  isSearch: PropTypes.bool,
  searchResults: PropTypes.object,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['LOST', 'FOUND', 'FOSTER'])
};

export default LostAnimalResultList; 