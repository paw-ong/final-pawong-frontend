import React, { useState } from "react";
import AddressModal from "../modal/AddressModal";
import PrimaryButton from "../../common/PrimaryButton";
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
  const [selectedAddresses, setSelectedAddresses] = useState([]);

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
            <div className="checkbox-group">
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
          <div className="address-container">
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
            <PrimaryButton onClick={() => setIsModalOpen(true)}>
              지역 선택
            </PrimaryButton>
          </div>
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