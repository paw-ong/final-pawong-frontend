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
  { label: "실종", value: "LOST" },
  { label: "발견/보호", value: "FOUND" },
  { label: "구조", value: "RESCUE" },
];

function LostAnimalSearchBar({ onSearch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKinds, setSelectedKinds] = useState([]);
  const [sex, setSex] = useState("ALL");
  const [type, setType] = useState("LOST");
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
      setAutocompleteList(data.autocompletes || []);
      setSelectedIndex(-1);
    } catch (error) {
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

  // 검색 버튼 클릭 시
  const handleSearch = () => {
    const addressStrings = selectedAddresses.map(addr => {
      if (addr.district === "전체") {
        return addr.city;
      }
      return `${addr.city} ${addr.district}`;
    });

    onSearch({
      selectedKinds,
      sex: sex === "ALL" ? undefined : sex,
      type,
      searchTerm,
      addresses: addressStrings,
    });
  };
  
  const handleAddressSelect = (addresses) => {
    setSelectedAddresses(addresses);
    setIsModalOpen(false);
  };

  const handleRemoveAddress = (id) => {
    setSelectedAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  return (
    <div className="lost-animal-search-bar-wrapper">
      <div className="lost-animal-search-bar">
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
            <label className="filter-label">유형</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              {TYPE_MAP.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-row">
          <div className="search-input-wrapper">
            <div className="search-input-container">
              <div className="selected-addresses">
                {selectedAddresses.map((addr) => (
                  <span key={addr.id} className="address-tag">
                    {addr.district === "전체" ? addr.city : `${addr.city} ${addr.district}`}
                    <button
                      type="button"
                      className="remove-address-btn"
                      onClick={() => handleRemoveAddress(addr.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="검색어를 입력하세요"
                value={searchTerm}
                onChange={handleSearchTermChange}
                onKeyDown={handleKeyDown}
              />
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
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            지역 선택
          </PrimaryButton>
          <PrimaryButton onClick={handleSearch}>
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