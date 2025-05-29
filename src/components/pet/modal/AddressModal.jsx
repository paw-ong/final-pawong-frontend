import React, { useState, useEffect } from "react";
import "./AddressModal.css";
import PrimaryButton from "../../common/PrimaryButton";
import addrData from "../../../assets/data/addr.json";

function AddressModal({ onClose, onSelect }) {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("전체");
  const [error, setError] = useState(null);
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  const [maxReached, setMaxReached] = useState(false);

  useEffect(() => {
    try {
      setCities(addrData.city);
    } catch (err) {
      console.error("Error loading address data:", err);
      setError("주소 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    setSelectedDistrict("전체");

    if (cityName === "none") {
      setDistricts([]);
      return;
    }

    const selectedCityData = cities.find((city) => city.name === cityName);
    if (selectedCityData) {
      setDistricts(selectedCityData.district);
    }
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  const handleAddAddress = () => {
    if (selectedCity && selectedCity !== "none" && selectedAddresses.length < 5) {
      const newAddress = {
        city: selectedCity,
        district: selectedDistrict,
        id: Date.now()
      };
      
      // 이미 선택된 지역인지 확인
      const isDuplicate = selectedAddresses.some(
        addr => addr.city === selectedCity && addr.district === selectedDistrict
      );

      if (!isDuplicate) {
        // 시/도 전체를 선택하는 경우
        if (selectedDistrict === "전체") {
          // 해당 시/도의 모든 하위 구/군 제거
          setSelectedAddresses(prev => 
            prev.filter(addr => addr.city !== selectedCity)
          );
        } else {
          // 시/도 전체가 이미 선택되어 있는지 확인
          const hasCityAll = selectedAddresses.some(
            addr => addr.city === selectedCity && addr.district === "전체"
          );
          
          if (hasCityAll) {
            // 이미 시/도 전체가 선택되어 있으면 추가하지 않음
            return;
          }
        }
        
        setSelectedAddresses(prev => [...prev, newAddress]);
      }
    } else if (selectedAddresses.length >= 5) {
      setMaxReached(true);
    }
  };

  const handleRemoveAddress = (id) => {
    const updatedAddresses = selectedAddresses.filter(addr => addr.id !== id);
    setSelectedAddresses(updatedAddresses);
    setMaxReached(updatedAddresses.length >= 5);
  };

  const handleSubmit = () => {
    if (selectedAddresses.length > 0) {
      onSelect(selectedAddresses);
      onClose();
    }
  };

  if (error) {
    return (
      <div className="address-modal-backdrop">
        <div className="address-modal">
          <h2>오류 발생</h2>
          <p>{error}</p>
          <PrimaryButton className="close-btn" onClick={onClose}>
            닫기
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="address-modal-backdrop">
      <div className="address-modal">
        <h2>지역 조건 추가</h2>
        <div className="address-select-container">
          <select 
            value={selectedCity} 
            onChange={handleCityChange}
            className="address-select"
          >
            <option value="none">도/시 선택</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="address-select"
            disabled={!selectedCity || selectedCity === "none"}
          >
            <option value="전체">전체</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <PrimaryButton 
            onClick={handleAddAddress} 
            disabled={!selectedCity || selectedCity === "none" || maxReached}
            className="add-address-btn"
          >
            추가
          </PrimaryButton>
        </div>
        
        {selectedAddresses.length > 0 && (
          <div className="selected-addresses-container">
            <h3>선택된 지역 ({selectedAddresses.length}/5)</h3>
            <div className="selected-addresses">
              {selectedAddresses.map((address) => (
                <div key={address.id} className="modal-address-tag">
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
          </div>
        )}

        {maxReached && (
          <p className="max-limit-message">최대 5개까지 선택 가능합니다.</p>
        )}

        <div className="address-modal-buttons">
          <PrimaryButton 
            onClick={handleSubmit} 
            disabled={selectedAddresses.length === 0}
          >
            선택 완료
          </PrimaryButton>
          <PrimaryButton className="close-btn" onClick={onClose}>
            닫기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default AddressModal;