import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import client from "../../api/client";
import defaultImage from '../../assets/images/lostpost/default.png';
import "./LostAnimalDetail.css";
import { AuthContext } from "../../contexts/AuthContext";
import styles from './LostAnimalDetail.module.css';
import LostAnimalCard from "../../components/pet/card/LostAnimalCard";

function LostAnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [similarAnimals, setSimilarAnimals] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingError, setIsSearchingError] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const hasCalledApi = useRef(false);
  const { user, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.userId);
    }
  }, [user]);

  // 카카오맵 SDK 로드
  useEffect(() => {
    let isMounted = true;

    const loadKakaoMap = () => {
      console.log('Loading Kakao Map SDK...');
      if (!window.kakao || !window.kakao.maps) {
        const script = document.createElement('script');
        script.id = 'kakao-map-sdk';
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=477f4899afec6f55a1621413a0296cb3&autoload=false&libraries=services`;
        script.async = true;
        
        script.onload = () => {
          console.log('Kakao Map SDK script loaded');
          if (!isMounted) return;
          window.kakao.maps.load(() => {
            console.log('Kakao Map SDK initialized');
            if (!isMounted) return;
            if (data?.lostGeoPoint && mapContainerRef.current) {
              console.log('Initializing map with data:', data.lostGeoPoint);
              setTimeout(() => {
                if (isMounted) {
                  initMap();
                }
              }, 100);
            } else {
              console.log('Missing required data for map initialization:', {
                hasGeoPoint: !!data?.lostGeoPoint,
                hasMapContainer: !!mapContainerRef.current
              });
            }
          });
        };

        script.onerror = (error) => {
          console.error('Failed to load Kakao Map SDK:', error);
        };

        document.head.appendChild(script);
      } else if (data?.lostGeoPoint && mapContainerRef.current) {
        console.log('Kakao Map SDK already loaded, initializing map');
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
    console.log('Initializing map with data:', data);
    if (!window.kakao || !window.kakao.maps || !data?.lostGeoPoint || !mapContainerRef.current) {
      console.error('Failed to initialize map:', {
        hasKakao: !!window.kakao,
        hasMaps: !!(window.kakao && window.kakao.maps),
        hasGeoPoint: !!data?.lostGeoPoint,
        geoPoint: data?.lostGeoPoint,
        hasMapContainer: !!mapContainerRef.current
      });
      return;
    }
    
    try {
      const { latitude, longitude } = data.lostGeoPoint;
      console.log('Creating map with coordinates:', { latitude, longitude });
      
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
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // 데이터가 변경될 때마다 지도 업데이트
  useEffect(() => {
    if (window.kakao && window.kakao.maps && data?.lostGeoPoint && mapContainerRef.current) {
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
          console.log('Received data:', response.data.lostPostDetailDto);
          setData(response.data.lostPostDetailDto);
        } else {
          console.error('Invalid data format:', response);
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

  useEffect(() => {
    let eventSource = null;

    const setupSSE = () => {
      // LOST 타입이 아닐 경우 SSE 연결하지 않음
      if (data?.postType !== 'LOST') {
        setSimilarAnimals([]);
        setIsSearching(false);
        return;
      }

      try {
        // SSE 연결 설정
        const baseUrl = client.defaults.baseURL || '';
        eventSource = new EventSource(`${baseUrl}/lost-animals/lost-posts/${id}/similar-animals/stream`);
        setIsSearching(true);
        setIsSearchingError(false);

        // similar-animals 이벤트 리스너
        eventSource.addEventListener('similar-animals', (event) => {
          const animals = JSON.parse(event.data);
          console.log('유사 동물 데이터 수신:', animals);
          setSimilarAnimals(animals);
          setIsSearching(false);
          eventSource.close(); // 데이터를 받으면 연결 종료
        });

        // 에러 처리
        eventSource.onerror = (error) => {
          console.error('SSE 연결 오류:', error);
          setIsSearching(false);
          setIsSearchingError(true);
          eventSource.close();
        };

      } catch (error) {
        console.error('SSE 설정 중 오류 발생:', error);
        setIsSearching(false);
        setIsSearchingError(true);
        if (eventSource) {
          eventSource.close();
        }
      }
    };

    // data가 로드되고 LOST 타입일 때만 SSE 연결
    if (data && data.postType === 'LOST') {
      console.log('SSE 연결 시작');
      setupSSE();
    } else {
      setSimilarAnimals([]);
      setIsSearching(false);
      setIsSearchingError(false);
    }

    // cleanup 함수
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [data, id]);
  
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

  const handleEdit = () => {
    navigate(`/lostAnimal/update/${id}`, {
      state: {
        postData: data
      }
    });
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        const response = await client.delete(`/lost-animals/lost-posts/${id}`);
        if (response.status === 200) {
          alert('게시글이 삭제되었습니다.');
          navigate('/lostAnimal');
        }
      } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert('게시글 삭제에 실패했습니다.');
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
    createdAt,
    postType
  } = data;

  // 성별 한글 변환
  const sexText = sexCd === 'M' ? '수컷' : sexCd === 'F' ? '암컷' : '미상';
  
  // PostType에 따른 텍스트 설정
  const typeText = postType === 'LOST' ? '실종' : '발견';

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        {isLoggedIn && user?.userId === data.authorId && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleEdit}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3581B8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2b6991'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3581B8'}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F86A60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e54b40'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F86A60'}
            >
              삭제
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <img 
          src={imageUrl || defaultImage} 
          alt={`${typeText} 동물`}
          className="lost-animal-detail-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
        <tbody>
          <tr style={{ background: '#f7f7f7' }}>
            <th colSpan={2} style={{ textAlign: 'left', padding: 12, fontSize: 18, width: '50%' }}>🐾 {typeText} 신고자 정보</th>
            <td colSpan={2} style={{ textAlign: 'right', padding: 12, fontSize: 14, width: '50%' }}>작성일: {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</td>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">신고자</td>
            <td>{author || '-'}</td>
            <td className="lost-animal-detail-label">{typeText} 일자</td>
            <td>{date || '-'}</td>
          </tr>
          <tr className="lost-animal-detail-header">
            <th colSpan={4}>🐾 {typeText} 장소</th>
          </tr>
          <tr className="lost-animal-detail-row">
            <td className="lost-animal-detail-label">{typeText} 장소</td>
            <td colSpan={3}>{location || '-'}</td>
          </tr>
          <tr>
            <td colSpan={4}>
              <div 
                ref={mapContainerRef} 
                className="lost-animal-detail-map"
                style={{
                  width: '100%',
                  height: '400px',
                  marginTop: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#f8f8f8'
                }}
              />
            </td>
          </tr>
          <tr className="lost-animal-detail-header">
            <th colSpan={4}>🐾 {typeText} 동물 정보</th>
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
          <tr style={{ background: '#f7f7f7' }}>
            <th colSpan={4} style={{ textAlign: 'left', padding: 12, fontSize: 18 }}>🐾 유사 동물</th>
          </tr>
          <tr>
            <td colSpan={4} style={{ padding: 12 }}>
              {data?.postType !== 'LOST' ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  실종 동물 게시글에서만 유사 동물을 확인할 수 있습니다.
                </div>
              ) : isSearching ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  유사 동물을 찾는 중입니다...
                </div>
              ) : isSearchingError ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'brown' }}>
                  유사 동물을 받아오는데 실패했습니다. 😿
                </div>
              ) : similarAnimals.length > 0 ? (
                <div style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  gap: '16px',
                  padding: '16px 0',
                  width: '100%',
                  scrollbarWidth: 'thin',
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': {
                    height: '6px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '3px'
                  }
                }}>
                  {similarAnimals.map((animal, index) => (
                    <div key={index} style={{ 
                      minWidth: '300px',
                      flex: '0 0 auto',
                      maxWidth: '300px'
                    }}>
                      <LostAnimalCard post={animal} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  유사한 동물이 없습니다.
                </div>
              )}
            </td>
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
