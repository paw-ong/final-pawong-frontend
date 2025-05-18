import React, { useState, useEffect, useRef } from 'react';
import './LocationSelectModal.css';

const LocationSelectModal = ({ isOpen, onClose, onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || [37.5665, 126.9780]);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && window.kakao && window.kakao.maps) {
      setTimeout(() => {
        initMap();
      }, 0);
    }
  }, [isOpen]);

  const moveToCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = [latitude, longitude];
        
        // 지도 이동
        const moveLatLng = new window.kakao.maps.LatLng(latitude, longitude);
        map.setCenter(moveLatLng);
        
        // 마커 이동
        marker.setPosition(moveLatLng);
        
        // 상태 업데이트
        setPosition(newPosition);
        searchAddressFromCoords(latitude, longitude);
        setIsLoading(false);
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는데 실패했습니다.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  const searchAddressFromCoords = async (lat, lng) => {
    // Kakao JS SDK가 로드되었는지 확인
    if (typeof window.kakao === 'undefined' || !window.kakao.maps.services) {
      console.error('Kakao Maps SDK가 로드되지 않았습니다.');
      setAddress('주소를 찾을 수 없습니다.');
      return;
    }
  
    try {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length) {
          const addr = result[0].road_address ? result[0].road_address : result[0].address;
          const fullAddress = 
            `${addr.address_name}`;
          setAddress(fullAddress);
        } else {
          console.error('주소 변환 실패:', status);
          setAddress('주소를 찾을 수 없습니다.');
        }
      });
    } catch (error) {
      console.error('주소 검색 실패:', error);
      setAddress('주소를 찾을 수 없습니다.');
    }
  };

  const initMap = () => {
    if (!mapContainerRef.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(position[0], position[1]),
      level: 3
    };

    const newMap = new window.kakao.maps.Map(mapContainerRef.current, options);
    const newMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(position[0], position[1])
    });
    newMarker.setMap(newMap);

    // 초기 위치의 주소 검색
    searchAddressFromCoords(position[0], position[1]);

    window.kakao.maps.event.addListener(newMap, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      newMarker.setPosition(latlng);
      setPosition([latlng.getLat(), latlng.getLng()]);
      // 클릭한 위치의 주소 검색
      searchAddressFromCoords(latlng.getLat(), latlng.getLng());
    });

    setMap(newMap);
    setMarker(newMarker);
  };

  const handleConfirm = () => {
    onLocationSelect({
      latitude: position[0],
      longitude: position[1],
      address: address
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>위치 선택</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="map-container">
          <div ref={mapContainerRef} style={{ width: '100%', height: '400px' }}></div>
          <button 
            className="current-location-button"
            onClick={moveToCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? '위치 확인 중...' : '현재 위치로 이동'}
          </button>
        </div>
        <div className="modal-footer">
          {address && (
            <div className="selected-address">
              선택된 위치: {address}
            </div>
          )}
          <button className="confirm-button" onClick={handleConfirm}>
            위치 선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectModal; 