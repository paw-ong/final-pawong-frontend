import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import PrimaryButton from "../../components/common/PrimaryButton";
import LocationSelectModal from "../../components/map/LocationSelectModal";
import defaultImage from "../../assets/images/lostpost/default.png";
import './LostAnimalCreate.css';

const POST_TYPE_OPTIONS = [
  { value: 'LOST', label: '실종 동물 게시글' },
  { value: 'FOUND', label: '발견 동물 게시글' }
];

const UP_KIND_OPTIONS = [
  { value: 'DOG', label: '개' },
  { value: 'CAT', label: '고양이' },
  { value: 'ETC', label: '기타' }
];

const SEX_OPTIONS = [
  { value: 'M', label: '수컷' },
  { value: 'F', label: '암컷' },
  { value: 'Q', label: '미상' }
];

export default function LostAnimalCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    postType: 'LOST',
    date: '',
    upKindNm: '',
    kindNm: '',
    color: '',
    sexCd: '',
    age: '',
    imageUrl: '',
    specialMark: '',
    content: '',
    rfidCd: '',
    location: '',
    latitude: null,
    longitude: null,
    address: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [locationError, setLocationError] = useState(false);

  // 카카오맵 SDK 로드
  useEffect(() => {
    if (!document.getElementById('kakao-map-sdk')) {
      const script = document.createElement('script');
      script.id = 'kakao-map-sdk';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=477f4899afec6f55a1621413a0296cb3&autoload=false&libraries=services`;
      script.async = true;
      
      script.onload = () => {
        window.kakao.maps.load(() => {
          // SDK 로드 완료 후 미리보기 지도 초기화
          if (formData.latitude && formData.longitude) {
            formData.latitude = 33.450701;
            formData.longitude = 126.570667;
          }
          initPreviewMap();
        });
      };

      script.onerror = (error) => {
        console.error("SDK 스크립트 로드 실패:", error);
      };

      document.head.appendChild(script);
    }
  }, []);

  // 미리보기 지도 초기화 함수
  const initPreviewMap = () => {
    if (!window.kakao || !window.kakao.maps) return;
    
    const container = document.getElementById('map-preview');
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(formData.latitude, formData.longitude),
      level: 3
    };

    const previewMap = new window.kakao.maps.Map(container, options);
    const previewMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(formData.latitude, formData.longitude)
    });
    previewMarker.setMap(previewMap);
  };

  // 위치가 변경될 때마다 미리보기 지도 업데이트
  useEffect(() => {
    if (window.kakao && window.kakao.maps && formData.latitude && formData.longitude) {
      initPreviewMap();
    }
  }, [formData.latitude, formData.longitude]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePostTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      postType: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      location: location.address,
      address: location.address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      setLocationError(true);
      return;
    }
    
    setLocationError(false);
    setUploading(true);
    try {
      let imageKey = null;
      if (imageFile) {
        const { data: presign } = await client.post("/images/presign-upload", {
          fileName: imageFile.name,
          contentType: imageFile.type,
          expiresInMinutes: 10,
          fileExtension: imageFile.name.substring(imageFile.name.lastIndexOf(".")),
          directoryName: "lost-post"
        });
        await fetch(presign.url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile
        });
        imageKey = presign.objectKey;
      }
      const response = await client.post('/lost-animals/lost-posts', {
        ...formData,
        imageKey
      });
      if (response.status === 201) {
        alert('게시글이 성공적으로 작성되었습니다.');
        navigate(`/lostAnimal/detail/${response.data.lostPostId}`);
      }
    } catch (error) {
      console.error('게시글 작성 중 오류 발생:', error);
      if(error.response.data.code === "LOCATION_REQUEST_ERROR") {
        alert('위치 정보 입력이 잘못되었습니다.');
        return;
      }
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="lost-animal-write-container">
      <div className="lost-animal-create-title-header">
        <button className="back-btn" type="button" onClick={() => navigate(-1)}>
          ←
        </button>
        <span className="lost-animal-create-title-text">실종 동물 공고 작성하기</span>
        <PrimaryButton type="submit" form="lost-animal-create-form">등록하기</PrimaryButton>
      </div>
      <form onSubmit={handleSubmit} className="lost-animal-write-form" id="lost-animal-create-form">
        <div className="lost-animal-main">
          <div className="lost-animal-main-basic-section">
            <label className="main-section-label">기본 정보</label>
            <div className="section-divider" />
            <div className="main-basic-row">
              <div className="main-basic-pair">
                <label>실종 날짜</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="main-basic-pair">
                <label>축종</label>
                <select name="upKindNm" value={formData.upKindNm} onChange={handleChange} required>
                  <option value="">선택해주세요</option>
                  {UP_KIND_OPTIONS.map(option => (
                    <option key={option.value} value={option.label}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="main-basic-row">
              <div className="main-basic-pair">
                <label>성별</label>
                <select name="sexCd" value={formData.sexCd} onChange={handleChange} required>
                  <option value="">선택해주세요</option>
                  {SEX_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="main-basic-pair">
                <label>품종</label>
                <input type="text" name="kindNm" value={formData.kindNm} onChange={handleChange} placeholder="예: 리트리버" required />
              </div>
            </div>
            <div className="main-basic-row">
              <div className="main-basic-pair age-input">
                <label>나이</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="예: 3" required />
              </div>
              <div className="main-basic-pair">
                <label>색상</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="예: 흰색" required />
              </div>
            </div>
            <div className="main-basic-row full-width">
              <div className="main-basic-full">
                <div className="main-basic-pair">
                  <label>마이크로칩 번호</label>
                  <input
                    type="text"
                    name="rfidCd"
                    value={formData.rfidCd}
                    onChange={handleChange}
                    placeholder="RFID 번호를 입력해주세요 (예: 410098100123456)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="lost-animal-section lost-animal-feature-section">
            <label>동물의 특징을 구체적으로 작성해주세요</label>
            <div className="section-divider" />
            <textarea
              name="specialMark"
              value={formData.specialMark}
              onChange={handleChange}
              placeholder="ex) 겁이 많고 낯선 사람을 무서워함, 왼쪽 귀가 접혀 있음, 목에 빨간색 목줄 착용, 사람을 잘 따름, 짖지 않음, '코코'라고 부르면 반응함 등"
              rows={6}
              required
            />
          </div>
          <div className="lost-animal-section lost-animal-detail-section">
            <label>추가 전달 사항</label>
            <div className="section-divider" />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="추가로 알리고 싶은 내용을 입력하세요."
              rows={4}
              required
            />
          </div>
        </div>
        <div className="lost-animal-sidebar">
          <div className="lost-animal-main-type-section">
            <label className="main-section-label">게시글 종류</label>
            <select name="postType" value={formData.postType} onChange={handlePostTypeChange}>
              {POST_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="lost-animal-main-type-section">
            <div className="location-label-container">
              <label className="main-section-label">
                {formData.postType === 'LOST' ? '실종 장소' : '발견 장소'}
                {locationError && (
                    <span className="location-error">장소를 선택해주세요</span>
                  )}
              </label>
              {formData.address && (
                <span className="selected-address-inline">
                  {formData.address}
                </span>
              )}
            </div>
            <div 
              className="location-map-preview" 
              onClick={() => {
                setIsMapModalOpen(true);
                setLocationError(false);
              }}
              style={{ height: '120px' }}
            >
              {formData.latitude && formData.longitude ? (
                <>
                  <div id="map-preview" style={{ width: '100%', height: '100%' }}></div>
                </>
              ) : (
                <div className="location-placeholder">
                  <span className="location-warning">* 지도를 클릭하여 위치를 선택해주세요</span>
                </div>
              )}
            </div>
          </div>

          <div className="lost-animal-image-section">
            <h3>이미지 첨부</h3>
            <input
              type="file"
              accept="image/*"
              id="image-upload-input"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <PrimaryButton type="button" onClick={() => document.getElementById('image-upload-input').click()}>
              이미지 선택
            </PrimaryButton>
            {imageFile && (
              <span className="selected-image-name">{imageFile.name}</span>
            )}
            {previewUrl && (
              <div className="image-preview-container">
                <img src={previewUrl} alt="미리보기" className="image-preview" />
                <button 
                  type="button" 
                  className="image-delete-btn"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl('');
                    setFormData(prev => ({
                      ...prev,
                      imageUrl: defaultImage
                    }));
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      <LocationSelectModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={formData.latitude && formData.longitude ? 
          [formData.latitude, formData.longitude] : null}
      />
    </div>
  );
}
