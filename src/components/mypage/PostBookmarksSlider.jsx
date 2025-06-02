import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import LostAnimalCard from '../pet/card/LostAnimalCard';
import client from '../../api/client';
import './PostBookmarksSlider.css';

// Slick 스타일 임포트
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function PostBookmarksSlider() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const userToken = localStorage.getItem('userToken');
      
      if (!userToken) {
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

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          variableWidth: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          variableWidth: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: true,
        },
      },
    ],
  };

  if (loading) {
    return <div className="post-bookmarks-loading">북마크를 불러오는 중...</div>;
  }

  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    return (
      <div className="post-bookmarks-empty">
        <p>북마크한 실종/발견 게시글이 없습니다.</p>
        <p>마음에 드는 실종/발견 게시글을 북마크해보세요!</p>
      </div>
    );
  }

  return (
    <div className="post-bookmarks-slider-container">
      <h2 className="post-bookmarks-title">북마크한 실종/발견 게시글</h2>
      <div className="slider-wrapper">
        <Slider {...settings}>
          {bookmarks.map((post) => (
            <div key={post.postId} className="slider-item" style={{ width: 220 }}>
              <LostAnimalCard post={post} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default PostBookmarksSlider; 