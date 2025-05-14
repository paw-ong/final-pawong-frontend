import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import PrimaryButton from "../../components/common/PrimaryButton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
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
    latitude: 0,
    longitude: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const { data: presign } = await client.post("/images/presign-upload", {
          fileName: imageFile.name,
          contentType: imageFile.type,
          expiresInMinutes: 10,
          fileExtension: imageFile.name.substring(imageFile.name.lastIndexOf("."))
        });
        await fetch(presign.url, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile
        });
        imageUrl = presign.objectKey;
      }
      const response = await client.post('/lost-posts', {
        ...formData,
        imageUrl
      });
      if (response.status === 201) {
        alert('게시글이 성공적으로 작성되었습니다.');
        navigate('/lostAnimal');
      }
    } catch (error) {
      console.error('게시글 작성 중 오류 발생:', error);
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
      {uploading && <LoadingSpinner />}
      <form onSubmit={handleSubmit} className="lost-animal-write-form" id="lost-animal-create-form">
        <div className="lost-animal-main">
          <div className="lost-animal-main-basic-section">
            <label className="main-section-label">기본 정보</label>
            <div className="section-divider" />
            <div className="main-basic-row">
              <div className="main-basic-half">
                <div className="main-basic-pair">
                  <label>실종 날짜</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
              </div>
              <div className="main-basic-half">
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
            </div>
            <div className="main-basic-row">
              <div className="main-basic-half">
                <div className="main-basic-pair">
                  <label>성별</label>
                  <select name="sexCd" value={formData.sexCd} onChange={handleChange} required>
                    <option value="">선택해주세요</option>
                    {SEX_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="main-basic-half">
                <div className="main-basic-pair">
                  <label>품종</label>
                  <input type="text" name="kindNm" value={formData.kindNm} onChange={handleChange} placeholder="예: 리트리버" required />
                </div>
              </div>
            </div>
            <div className="main-basic-row">
              <div className="main-basic-half age-input">
                <div className="main-basic-pair">
                  <label>나이</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="예: 3" required />
                </div>
              </div>
              <div className="main-basic-half">
                <div className="main-basic-pair">
                  <label>색상</label>
                  <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="예: 흰색" required />
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
            {previewUrl && <img src={previewUrl} alt="미리보기" className="image-preview" />}
          </div>
        </div>
      </form>
    </div>
  );
}
