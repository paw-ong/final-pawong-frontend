import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import LostAnimalCard from '../pet/card/LostAnimalCard';
import client from '../../api/client';
import './FavoritesSlider.css';

// 화살표 이미지 임포트
import arrowLeft from '../../assets/images/icons/arrow-left.svg';
import arrowRight from '../../assets/images/icons/arrow-right.svg';

// Swiper 스타일 임포트
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function LostBookmarksSlider() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.get('/users/me/lost-bookmarks');
        setBookmarks(data.content || []);
      } catch (error) {
        console.error('북마크한 실종/발견 게시글 로딩 중 오류 발생:', error);
        setBookmarks([]); // 에러 발생 시 빈 배열로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return <div className="favorites-loading">북마크를 불러오는 중...</div>;
  }

  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    return (
      <div className="favorites-empty">
        <p>북마크한 실종/발견 게시글이 없습니다.</p>
        <p>마음에 드는 실종/발견 게시글을 북마크해보세요!</p>
      </div>
    );
  }

  return (
    <div className="favorites-slider-container">
      <h2 className="favorites-title">북마크한 실종/발견 게시글</h2>
      
      <div className="favorites-navigation-container">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={5}
          slidesPerView={1}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{ clickable: true }}
          breakpoints={{
            500: {
              slidesPerView: 1,
              spaceBetween: 5,
            },
            700: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            900: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
            1200: {
              slidesPerView: 4,
              spaceBetween: 10,
            },
          }}
          className="favorites-swiper"
        >
          {bookmarks.map(post => (
            <SwiperSlide key={post.postId}>
              <div className="favorites-slide">
                <LostAnimalCard post={post} />
              </div>
            </SwiperSlide>
          ))}
          
          <div className="swiper-button-prev-custom">
            <img src={arrowLeft} alt="이전" />
          </div>
          <div className="swiper-button-next-custom">
            <img src={arrowRight} alt="다음" />
          </div>
        </Swiper>
      </div>
    </div>
  );
}

export default LostBookmarksSlider; 