import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import LostAnimalSearchBar from "../../components/pet/search/LostAnimalSearchBar";
import LostAnimalResultList from "../../components/pet/list/LostAnimalResultList";
import LostAnimalTab from "../../components/pet/tab/LostAnimalTab";
import "./LostAnimal.css";

function LostAnimal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // 초기 상태를 URL 파라미터와 동기화
    return searchParams.get('type') || 'LOST';
  });

  // URL 쿼리 파라미터 변경 감지
  useEffect(() => {
    const type = searchParams.get('type') || 'LOST';
    if (type !== activeTab) {
      setActiveTab(type);
    }
  }, [searchParams]);

  const handleSearch = (results) => {
    setSearchResults(results);
    setIsSearch(true);
  };

  const handleSearchStart = () => {
    setLoading(true);
  };

  const handleSearchEnd = () => {
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSearch(false);
    setSearchResults(null);
    // URL 쿼리 파라미터 업데이트
    if (tab === 'LOST') {
      setSearchParams({});
    } else {
      setSearchParams({ type: tab });
    }
  };

  return (
    <div className="lost-animal-container">
      <LostAnimalSearchBar 
        onSearch={handleSearch}
        onSearchStart={handleSearchStart}
        onSearchEnd={handleSearchEnd}
      />
      <LostAnimalTab 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <LostAnimalResultList 
        isSearch={isSearch}
        searchResults={searchResults}
        loading={loading}
        type={activeTab}
      />
    </div>
  );
}

export default LostAnimal;