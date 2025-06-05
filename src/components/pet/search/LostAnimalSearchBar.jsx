import React, { useState, useEffect, useRef } from "react";
import AddressModal from "../modal/AddressModal";
import PrimaryButton from "../../common/PrimaryButton";
import client from "../../../api/client";
import "./LostAnimalSearchBar.css";

const KIND_MAP = [
  { label: "개", value: "DOG" },
  { label: "고양이", value: "CAT" },
  { label: "기타", value: "ETC" },
];

const SEX_MAP = [
  { label: "전체", value: "ALL" },
  { label: "암컷", value: "F" },
  { label: "수컷", value: "M" },
];

const TYPE_MAP = [
  { label: "전체", value: "ALL" },
  { label: "찾습니다", value: "LOST" },
  { label: "발견했어요", value: "FOUND" },
  { label: "보호중입니다", value: "FOSTER" },
];

function LostAnimalSearchBar({ onSearch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKinds, setSelectedKinds] = useState([]);
  const [sex, setSex] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [autocompleteList, setAutocompleteList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const [selectedAddresses, setSelectedAddresses] = useState([]);

  // 자동완성 API 호출
  const fetchAutocomplete = async (keyword) => {
    if (!keyword.trim()) {
      setAutocompleteList([]);
      setSelectedIndex(-1);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await client.get(`/lost-animals/search/autocomplete?keyword=${encodeURIComponent(keyword)}`);
      if (data && Array.isArray(data.autocompletes)) {
        setAutocompleteList(data.autocompletes);
      } else {
        setAutocompleteList([]);
      }
      setSelectedIndex(-1);
    } catch (error) {
      console.error('자동완성 요청 실패:', error);
      setAutocompleteList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 시 자동완성 요청 (디바운스 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchAutocomplete(searchTerm);
      } else {
        setAutocompleteList([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 검색어 변경 핸들러
  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // 자동완성 선택 처리
  const handleAutocompleteSelect = (selected) => {
    setSearchTerm(selected);
    setAutocompleteList([]);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

  // 키보드 네비게이션
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (autocompleteList.length > 0 && selectedIndex >= 0) {
        handleAutocompleteSelect(autocompleteList[selectedIndex]);
      } else {
        handleSearch();
      }
      return;
    }

    if (autocompleteList.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = selectedIndex < autocompleteList.length - 1 ? selectedIndex + 1 : selectedIndex;
        if (nextIndex !== selectedIndex) {
          setSelectedIndex(nextIndex);
          requestAnimationFrame(() => {
            const element = document.querySelector(`.autocomplete-item:nth-child(${nextIndex + 1})`);
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : selectedIndex;
        if (prevIndex !== selectedIndex) {
          setSelectedIndex(prevIndex);
          requestAnimationFrame(() => {
            const element = document.querySelector(`.autocomplete-item:nth-child(${prevIndex + 1})`);
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          });
        }
        break;
      case 'Escape':
        setAutocompleteList([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // 체크박스 핸들러
  const handleKindChange = (kind) => {
    setSelectedKinds((prev) =>
      prev.includes(kind)
        ? prev.filter((k) => k !== kind)
        : [...prev, kind]
    );
  };

  const handleTypeChange = (type) => {
    setSelectedType((prev) =>
      prev === type
        ? "ALL"
        : type
    );
  };

  // 검색 버튼 클릭 시
  const handleSearch = async () => {
    console.log('검색 시작 - 현재 상태:', {
      searchTerm,
      selectedKinds,
      sex,
      selectedType,
      selectedAddresses
    });

    if (!searchTerm.trim() && selectedKinds.length === 0 && sex === "ALL" && selectedType === "ALL" && selectedAddresses.length === 0) {
      console.log('검색 조건이 없어 검색을 수행하지 않습니다.');
      return;
    }

    const addressStrings = selectedAddresses.map(addr => {
      if (addr.district === "전체") {
        return addr.city;
      }
      return `${addr.city} ${addr.district}`;
    });

    const searchData = {
      type: selectedType === "ALL" ? undefined : selectedType,
      upKindCds: selectedKinds.length > 0 ? selectedKinds : undefined,
      sexCd: sex === "ALL" ? undefined : sex,
      regions: addressStrings.length > 0 ? addressStrings : undefined,
    };

    console.log('검색 데이터:', searchData);

    try {
      const response = await client.get('/lost-animals/search', {
        params: {
          ...searchData,
          page: 0,
          size: 20,
          sort: 'lostPostId,desc'
        },
        paramsSerializer: {
          indexes: null // 배열 파라미터를 반복되는 키로 변환
        }
      });

      console.log('검색 결과:', response.data);
      onSearch(response.data);
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색 중 오류가 발생했습니다.');
    }
  };
  
  const handleAddressSelect = (addresses) => {
    console.log('선택된 주소:', addresses); // 주소 선택 시 로그 추가
    setSelectedAddresses(addresses);
    setIsModalOpen(false);
  };

  const handleRemoveAddress = (id) => {
    setSelectedAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  return (
    <div className="lost-animal-search-bar-wrapper">
      <div className="lost-animal-search-bar">
        <div className="lost-animal-filter-row">
          <div className="lost-animal-filter-group">
            <label className="lost-animal-filter-label">품종</label>
            <div className="lost-animal-checkbox-group">
              {KIND_MAP.map(k => (
                <label key={k.value} className="lost-animal-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedKinds.includes(k.value)}
                    onChange={() => handleKindChange(k.value)}
                  />
                  <span>{k.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="lost-animal-filter-group">
            <label className="lost-animal-filter-label">성별</label>
            <select 
              value={sex} 
              onChange={e => setSex(e.target.value)}
              className="lost-animal-select"
            >
              {SEX_MAP.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="lost-animal-filter-group">
            <label className="lost-animal-filter-label">유형</label>
            <select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)}
              className="lost-animal-select"
            >
              {TYPE_MAP.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <PrimaryButton 
            className="lost-animal-primary-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            지역조건추가
          </PrimaryButton>
        </div>

        <div className="lost-animal-search-row">
          <div className="lost-animal-search-container">
            <div className="lost-animal-search-input-wrapper">
              <input
                ref={searchInputRef}
                className="lost-animal-search-input"
                type="text"
                placeholder="실종/발견된 반려동물을 검색해보세요"
                value={searchTerm}
                onChange={handleSearchTermChange}
                onKeyDown={handleKeyDown}
              />
              {selectedAddresses && selectedAddresses.length > 0 && (
                <div className="lost-animal-selected-addresses">
                  {selectedAddresses.map((address) => (
                    <div key={address.id} className="lost-animal-address-tag">
                      <span>{address.city} {address.district}</span>
                      <button 
                        onClick={() => handleRemoveAddress(address.id)}
                        className="lost-animal-remove-address-btn"
                        aria-label="주소 제거"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {isLoading && (
                <div className="lost-animal-search-loading">검색중...</div>
              )}
            </div>
            
            {autocompleteList.length > 0 && (
              <div className="lost-animal-autocomplete-list">
                {autocompleteList.map((item, index) => (
                  <div
                    key={index}
                    className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleAutocompleteSelect(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
          <PrimaryButton 
            className="lost-animal-primary-btn" 
            onClick={handleSearch}
          >
            검색
          </PrimaryButton>
        </div>
      </div>

      {isModalOpen && (
        <AddressModal
          onClose={() => setIsModalOpen(false)}
          onSelect={handleAddressSelect}
          selectedAddresses={selectedAddresses}
        />
      )}
    </div>
  );
}

export default LostAnimalSearchBar; 