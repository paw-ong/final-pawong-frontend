import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import PetCard from '../pet/card/PetCard';
import client from '../../api/client';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './FavoritesSlider.css';

function SlickPrevArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={className}
      onClick={onClick}
      aria-label="이전"
    />
  );
}

function SlickNextArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={className}
      onClick={onClick}
      aria-label="다음"
    />
  );
}

function FavoritesSlider() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const userToken = localStorage.getItem('userToken');
      
      if (!userToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.get('/users/me/favorites')
        // console.log('찜 목록 응답:', data);
        setFavorites(data.content || []);
      } catch (error) {
        console.error('찜 목록 로딩 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // PetCard 형식에 맞게 데이터 변환
  const formatPetData = (item) => {
    const adoptionCard = item.adoptionCard;
    const currentYear = new Date().getFullYear();
    const ageInYears = adoptionCard.age ? currentYear - adoptionCard.age : null;
    const ageString = ageInYears ? `${ageInYears}살` : '나이 미상';

    return {
      id: adoptionCard.adoptionId,
      imgUrl: adoptionCard.popfile1,
      kindNm: adoptionCard.kindNm || '기타',
      sexCd: adoptionCard.sexCd === 'M' ? '수컷' : adoptionCard.sexCd === 'F' ? '암컷' : '미상',
      age: ageString,
      neuterYn: adoptionCard.neuterYn === 'Y' ? '중성화 O' : adoptionCard.neuterYn === 'N' ? '중성화 X' : '중성화 미상'
    };
  };

  if (loading) {
    return <div className="section-loading">찜 목록을 불러오는 중...</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="section-empty">
        <p>찜한 공고가 없습니다.</p>
        <p>마음에 드는 공고를 찜해보세요!</p>
      </div>
    );
  }

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    variableWidth: true,
    appendDots: dots => (
      <div style={{ bottom: '-30px' }}>
        <ul style={{ margin: '0' }}> {dots} </ul>
      </div>
    ),
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          variableWidth: true
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          variableWidth: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: true
        }
      }
    ]
  };

  return (
    <section className="adoption-section">
      <h2 className="section-title">내가 찜한 공고</h2>
      <div className="slider-wrapper">
        <Slider {...settings}>
          {favorites.map(pet => (
            <div key={pet.adoptionCard.adoptionId} className="slider-item" style={{ width: 220 }}>
              <PetCard pet={formatPetData(pet)} type="adoptions" />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

export default FavoritesSlider; 
