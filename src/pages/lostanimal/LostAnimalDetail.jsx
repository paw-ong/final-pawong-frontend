import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import client from "../../api/client";
import userImage from '../../assets/images/user.jpg';
import "./LostAnimalDetail.css";
import { AuthContext } from "../../contexts/AuthContext";
import styles from './LostAnimalDetail.module.css';

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
        window.location.href = `/lostAnimal/detail/${data.lostPostId}/chat/${response.data.chatRoomId}`;
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
    <div className="lost-animal-detail-container">
      <div className="lost-animal-detail-image-container">
        <img 
          src={imageUrl || userImage} 
          alt="실종 동물"
          className="lost-animal-detail-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = userImage;
          }}
        />
      </div>
      <table className="lost-animal-detail-table">
        <tbody>
          <tr className="lost-animal-detail-header">
            <th colSpan={2}>🐾  실종 신고자 정보</th>
            <td colSpan={2}>작성일: {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</td>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">신고자</td>
            <td>{author || '-'}</td>
            <td className="lost-animal-detail-label">실종 일자</td>
            <td>{date || '-'}</td>
          </tr>
          <tr className="lost-animal-detail-header">
            <th colSpan={4}>🐾  실종 장소</th>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">실종 장소</td>
            <td colSpan={3}>{location || '-'}</td>
          </tr>
          <tr>
            <td colSpan={4}>
              <div 
                ref={mapContainerRef} 
                className="lost-animal-detail-map"
              />
            </td>
          </tr>
          <tr className="lost-animal-detail-header">
            <th colSpan={4}>🐾  실종 동물 정보</th>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">품종</td>
            <td>{upKindNm} {kindNm || '-'}</td>
            <td className="lost-animal-detail-label">색상</td>
            <td>{color || '-'}</td>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">성별</td>
            <td>{sexText}</td>
            <td className="lost-animal-detail-label">나이</td>
            <td>{age || '-'}</td>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">특징</td>
            <td colSpan={3}>{specialMark || '-'}</td>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">RFID</td>
            <td colSpan={3}>{rfidCd || '-'}</td>
          </tr>
          </tbody>
        </table>
      
      {/* 채팅하기 버튼 */}
      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
        {isLoggedIn && user?.userId === data.authorId ? (
          <button 
            onClick={handleChatButtonClick}
            className={styles.chatButton}
          >
            요청된 채팅으로 이동
          </button>
        ) : (
          <button 
            onClick={handleChatButtonClick}
            className={styles.chatButton}
          >
            채팅하기
          </button>
        )}
      </div>
    </div>
  );
}

export default LostAnimalDetail;
