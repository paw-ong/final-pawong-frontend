import React, { useState, useEffect, useRef } from "react";
import AddressModal from "../modal/AddressModal";
import PrimaryButton from "../../common/PrimaryButton";
import client from "../../../api/client";
import "./AdoptionSearchBar.css";

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
const NEUTER_MAP = [
  { label: "전체", value: "ALL" },
  { label: "함", value: "Y" },
  { label: "안함", value: "N" },
];

function AdoptionSearchBar({ onSearch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKinds, setSelectedKinds] = useState([]); // ["DOG", ...]
  const [sex, setSex] = useState("ALL");
  const [neuter, setNeuter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [autocompleteList, setAutocompleteList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const [selectedAddresses, setSelectedAddresses] = useState([]); // 선택된 주소 저장

  // 자동완성 API 호출
  const fetchAutocomplete = async (keyword) => {
    if (!keyword.trim()) {
      setAutocompleteList([]);
      setSelectedIndex(-1);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await client.get(`/adoptions/search/autocomplete?keyword=${encodeURIComponent(keyword)}`);
      setAutocompleteList(data.autocompletes || []);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('자동완성 요청 실패:', error);
      setAutocompleteList([]);
      setSelectedIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 시 자동완성 요청
  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // 마지막 단어 추출
    const words = value.split(' ');
    const lastWord = words[words.length - 1];
    
    if (lastWord) {
      fetchAutocomplete(lastWord);
    } else {
      setAutocompleteList([]);
      setSelectedIndex(-1);
    }
  };

  // 자동완성 선택 처리
  const handleAutocompleteSelect = (selected) => {
    const words = searchTerm.split(' ');
    words[words.length - 1] = selected;
    const newSearchTerm = words.join(' ');
    setSearchTerm(newSearchTerm + ' ');
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
          // 선택과 동시에 스크롤
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
          // 선택과 동시에 스크롤
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

  // 검색 버튼 클릭 시
  const handleSearch = () => {

    // 선택된 주소를 문자열 배열로 변환
    const addressStrings = selectedAddresses.map(addr => {
      // 구/군이 "전체"인 경우 시/도만 반환
      if (addr.district === "전체") {
        return addr.city;
      }
      return `${addr.city} ${addr.district}`;
    });

    onSearch({
      selectedKinds,
      sex: sex === "ALL" ? undefined : sex,
      neuter: neuter === "ALL" ? undefined : neuter,
      searchTerm,
      addresses: addressStrings,
    });
  };
  
  const handleAddressSelect = (addresses) => {
    console.log("선택된 지역 목록:", addresses);
    setSelectedAddresses(addresses);
    setIsModalOpen(false);  // 선택 완료 후 모달 닫기
  };

  const handleRemoveAddress = (id) => {
    console.log("제거할 주소 ID:", id);
    setSelectedAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  return (
    <div className="adoption-search-bar-wrapper">
      <div className="adoption-search-bar">
        <div className="filter-row">
            <div className="filter-group">
                <label className="filter-label">품종</label>
                {KIND_MAP.map(k => (
                    <label key={k.value} className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={selectedKinds.includes(k.value)}
                        onChange={() => handleKindChange(k.value)}
                    />
                    <span>{k.label}</span>
                    </label>
                ))}
            </div>
          <div className="filter-group">
            <label className="filter-label">성별</label>
            <select value={sex} onChange={e => setSex(e.target.value)}>
              {SEX_MAP.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">중성화여부</label>
            <select value={neuter} onChange={e => setNeuter(e.target.value)}>
              {NEUTER_MAP.map((n) => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
          </div>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>지역조건추가</PrimaryButton>
        </div>
        <div className="search-row">
          <div className="search-input-wrapper">
            <div className="search-input-container">
              <input
                ref={searchInputRef}
                className="search-input"
                type="text"
                placeholder="포옹이 필요한 친구를 찾아보세요!"
                value={searchTerm}
                onChange={handleSearchTermChange}
                onKeyDown={handleKeyDown}
              />
              {selectedAddresses && selectedAddresses.length > 0 && (
                <div className="selected-addresses">
                  {selectedAddresses.map((address) => (
                    <div key={address.id} className="address-tag">
                      <span>{address.city} {address.district}</span>
                      <button 
                        onClick={() => handleRemoveAddress(address.id)}
                        className="remove-address-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {autocompleteList.length > 0 && (
              <ul className="autocomplete-list">
                {autocompleteList.map((item, index) => (
                  <li
                    key={index}
                    className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleAutocompleteSelect(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <PrimaryButton onClick={handleSearch}>검색</PrimaryButton>
        </div>
      </div>

      {isModalOpen && (
        <AddressModal onClose={() => setIsModalOpen(false)} onSelect={handleAddressSelect} />
      )}
    </div>
  );
}

export default AdoptionSearchBar; 