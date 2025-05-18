import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../../api/client";
import userImage from '../../assets/images/user.jpg';
import "./LostAnimal.css";

function LostAnimalDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data for ID:', id);
      try {
        const url = `/lost-animals/${id}?type=lost-posts`;
        console.log('Request URL:', url);
        
        const response = await client.get(url);
        console.log('API Response:', response);
        
        if (response && response.data && response.data.lostPostDetailDto) {
          console.log('Response data:', response.data.lostPostDetailDto);
          setData(response.data.lostPostDetailDto);
        } else {
          console.error('Invalid response format:', response);
          setError('데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('API Error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          request: error.request
        });
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="lost-animal-container">로딩 중...</div>;
  if (error || !data) return <div className="lost-animal-container">{error || '데이터 없음'}</div>;

  console.log('화면에 표시할 데이터:', data);

  // 데이터 구조 확인을 위한 로깅
  const {
    date,
    upKindNm,
    kindNm,
    color,
    sexCd,
    age,
    imageUrl,
    specialMark,
    content,
    rfidCd,
    location,
    author
  } = data;

  // 성별 한글 변환
  const sexText = sexCd === 'M' ? '수컷' : sexCd === 'F' ? '암컷' : '미상';

  return (
    <div className="lost-animal-container" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '32px',
      border: '1px solid #e0e0e0',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <img 
          src={imageUrl || userImage} 
          alt="분실동물" 
          style={{ 
            width: 400, 
            height: 400, 
            objectFit: 'cover', 
            borderRadius: 12,
            border: '1px solid #eee'
          }}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = userImage;
          }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
        <tbody>
          <tr style={{ background: '#f7f7f7' }}>
            <th colSpan={4} style={{ textAlign: 'left', padding: 12, fontSize: 18 }}>🐾 분실신고자 정보</th>
          </tr>
          <tr>
            <td style={{ width: '25%', fontWeight: 600, padding: 12 }}>신고자</td>
            <td style={{ width: '25%', padding: 12 }}>{author || '-'}</td>
            <td style={{ width: '25%', fontWeight: 600, padding: 12 }}>분실일자</td>
            <td style={{ width: '25%', padding: 12 }}>{date || '-'}</td>
          </tr>
          <tr style={{ background: '#f7f7f7' }}>
            <th colSpan={4} style={{ textAlign: 'left', padding: 12, fontSize: 18 }}>🐾 분실장소</th>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>분실장소</td>
            <td colSpan={3} style={{ padding: 12 }}>{location || '-'}</td>
          </tr>
          <tr style={{ background: '#f7f7f7' }}>
            <th colSpan={4} style={{ textAlign: 'left', padding: 12, fontSize: 18 }}>🐾 분실동물 정보</th>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>동물종류</td>
            <td style={{ padding: 12 }}>{upKindNm || '-'}</td>
            <td style={{ fontWeight: 600, padding: 12 }}>품종</td>
            <td style={{ padding: 12 }}>{kindNm || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>색상</td>
            <td style={{ padding: 12 }}>{color || '-'}</td>
            <td style={{ fontWeight: 600, padding: 12 }}>성별</td>
            <td style={{ padding: 12 }}>{sexText || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>나이</td>
            <td style={{ padding: 12 }}>{age ? `${age}살` : '-'}</td>
            <td style={{ fontWeight: 600, padding: 12 }}>RFID 번호</td>
            <td style={{ padding: 12 }}>{rfidCd || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>특징</td>
            <td colSpan={3} style={{ padding: 12 }}>{specialMark || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>추가설명</td>
            <td colSpan={3} style={{ padding: 12 }}>{content || '-'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default LostAnimalDetail;
