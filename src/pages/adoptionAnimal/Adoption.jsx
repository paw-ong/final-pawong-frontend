import React, { useState } from "react";
import AdoptionSearchBar from "../components/pet/AdoptionSearchBar";
import AdoptionResultList from "../components/pet/AdoptionResultList";
import client from "../api/client";

function Adoption() {
  const [isSearch, setIsSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // 검색 함수: AdoptionSearchBar에서 호출
  const handleSearch = async (params) => {
    // 검색 시작 시 즉시 검색 모드로 변경하여 기존 데이터 초기화
    setIsSearch(true);
    // 기존 검색 결과 초기화
    setSearchResults(null);
    setLoading(true);
    
    try {
      const urlParams = new URLSearchParams();
      params.selectedKinds.forEach((kind) => urlParams.append("upKindCds", kind));
      if (params.sex) {
        urlParams.append("sexCd", params.sex);
      }
      if (params.neuter) {
        urlParams.append("neuterYn", params.neuter);
      }
      if (params.searchTerm && params.searchTerm.trim()) {
        urlParams.append("searchTerm", params.searchTerm.trim());
      }
      if (params.addresses && params.addresses.length > 0) {
        params.addresses.forEach((address) => urlParams.append("regions", address));
      }
      const url = `/adoptions/search?${urlParams.toString()}`;
      const { data } = await client.get(url);
      

      // if (!res.ok) throw new Error("검색 실패");
      // const data = await res.json();
      
      // 검색 결과 설정
      setSearchResults(data);
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 오류 발생");
      
      // 검색 실패 시 일반 모드로 복귀
      setIsSearch(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdoptionSearchBar onSearch={handleSearch} />
      <AdoptionResultList 
        isSearch={isSearch} 
        searchResults={searchResults} 
        loading={loading} 
      />
    </div>
  );
}

export default Adoption;