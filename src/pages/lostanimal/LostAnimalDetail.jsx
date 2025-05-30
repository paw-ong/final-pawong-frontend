import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import client from "../../api/client";
import userImage from '../../assets/images/user.jpg';
import "./LostAnimal.css";
import { AuthContext } from "../../contexts/AuthContext";

function LostAnimalDetail() {
  const { id } = useParams();
  const currentLocation = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const { user, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  // 카카오맵 SDK 로드
  useEffect(() => {
    let isMounted = true;

    const loadKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        const script = document.createElement('script');
        script.id = 'kakao-map-sdk';
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=477f4899afec6f55a1621413a0296cb3&autoload=false&libraries=services`;
        script.async = true;
        
        script.onload = () => {
          if (!isMounted) return;
          window.kakao.maps.load(() => {
            if (!isMounted) return;
            if (data?.geoPoint && mapContainerRef.current) {
              setTimeout(() => {
                if (isMounted) {
                  initMap();
                }
              }, 100);
            }
          });
        };

        document.head.appendChild(script);
      } else if (data?.geoPoint && mapContainerRef.current) {
        setTimeout(() => {
          if (isMounted) {
            initMap();
          }
        }, 100);
      }
    };

    loadKakaoMap();

    return () => {
      isMounted = false;
    };
  }, [data]);

  // 지도 초기화 함수
  const initMap = () => {
    if (!window.kakao || !window.kakao.maps || !data?.geoPoint || !mapContainerRef.current) return;
    
    try {
      const { latitude, longitude } = data.geoPoint;
      
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3
      };

      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(latitude, longitude)
      });

      // 마커를 지도에 표시
      marker.setMap(map);

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${data.location || '분실 장소'}</div>`
      });

      // 인포윈도우를 마커 위에 표시
      infowindow.open(map, marker);
    } catch (error) {
      console.error('지도 초기화 중 오류 발생:', error);
    }
  };

  // 데이터가 변경될 때마다 지도 업데이트
  useEffect(() => {
    if (window.kakao && window.kakao.maps && data?.geoPoint && mapContainerRef.current) {
      setTimeout(() => {
        initMap();
      }, 100);
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postType = currentLocation.state?.postType;
        const url = `/lost-animals/lost-posts/${id}`;
        
        const response = await client.get(url);
        
        if (response && response.data && response.data.lostPostDetailDto) {
          setData(response.data.lostPostDetailDto);
        } else {
          setError('데이터 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('API Error:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentLocation.state]);

  // 채팅 버튼 클릭 핸들러
  const handleChatButtonClick = async () => {
    if (!data || !isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    // 작성자인 경우 채팅방 목록 페이지로 이동
    if (isLoggedIn && user?.userId === data.authorId) {
      navigate(`/chatrooms/post/${data.lostPostId}`);
      return;
    }

    // 작성자가 아닌 경우 기존 로직 실행
    const requestData = {
      postId: Number(data.lostPostId),
      authorId: Number(data.authorId)
    };
    
    try {
      const response = await client.post('/chat/rooms', requestData);
      
      if (response && response.data && response.data.chatRoomId) {
        window.location.href = `/chat/${response.data.chatRoomId}`;
      }
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      
      if (error.status === 401 || error.status === 403) {
        alert('로그인이 필요하거나 권한이 없습니다.');
      } else if (error.code === 'CHATROOM_POST_ERROR') {
        alert('채팅방을 생성할 수 없습니다');
      } else {
        alert('채팅방 생성 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div className="lost-animal-container">로딩 중...</div>;
  if (error || !data) return <div className="lost-animal-container">{error || '데이터 없음'}</div>;

  // 데이터 구조 확인을 위한 로깅
  const {
    lostPostId,
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
    author,
    authorId,
    createdAt
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
          alt="실종 동물"
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
            <th colSpan={2} style={{ textAlign: 'left', padding: 12, fontSize: 18, width: '50%' }}>🐾 실종 신고자 정보</th>
            <td colSpan={2} style={{ textAlign: 'right', padding: 12, fontSize: 14, width: '50%' }}>작성일: {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</td>
          </tr>
          <tr>
            <td style={{ width: '25%', fontWeight: 600, padding: 12 }}>신고자</td>
            <td style={{ width: '25%', padding: 12 }}>{author || '-'}</td>
            <td style={{ width: '25%', fontWeight: 600, padding: 12 }}>실종 일자</td>
            <td style={{ width: '25%', padding: 12 }}>{date || '-'}</td>
          </tr>
          <tr style={{ background: '#f7f7f7' }}>
            <th colSpan={4} style={{ textAlign: 'left', padding: 12, fontSize: 18 }}>🐾 실종 장소</th>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>실종 장소</td>
            <td colSpan={3} style={{ padding: 12 }}>{location || '-'}</td>
          </tr>
          <tr>
            <td colSpan={4} style={{ padding: 12 }}>
              <div 
                ref={mapContainerRef} 
                style={{ 
                  width: '100%', 
                  height: '300px',
                  borderRadius: '8px',
                  border: '1px solid #eee'
                }}
              />
            </td>
          </tr>
          <tr style={{ background: '#f7f7f7' }}>
            <th colSpan={4} style={{ textAlign: 'left', padding: 12, fontSize: 18 }}>🐾 실종 동물 정보</th>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>동물 종류</td>
            <td style={{ padding: 12 }}>{upKindNm || '-'}</td>
            <td style={{ fontWeight: 600, padding: 12 }}>품종</td>
            <td style={{ padding: 12 }}>{kindNm || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, padding: 12 }}>색상</td>
            <td style={{ padding: 12 }}>{color || '-'}</td>
            <td style={{ fontWeight: 600, padding: 12 }}>성별</td>
            <td style={{ padding: 12 }}>{sexText}</td>
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
            <td style={{ fontWeight: 600, padding: 12 }}>추가 설명</td>
            <td colSpan={3} style={{ padding: 12 }}>{content || '-'}</td>
          </tr>
          </tbody>
        </table>
      
      {/* 채팅하기 버튼 */}
      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
        {isLoggedIn && user?.userId === data.authorId ? (
          <button 
            onClick={handleChatButtonClick}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            요청된 채팅으로 이동
          </button>
        ) : (
          <button 
            onClick={handleChatButtonClick}
            style={{
              backgroundColor: '#FF8A3D',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            채팅하기
          </button>
        )}
      </div>
    </div>
  );
}

export default LostAnimalDetail;
