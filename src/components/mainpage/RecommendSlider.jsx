import React from 'react';
import Slider from "react-slick";
import PetCard from '../pet/card/PetCard';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../pet/list/List.css';

function formatPetData(item) {
  let sexString = '정보 없음';
  if (item.sexCd === 'M') sexString = '수컷';
  else if (item.sexCd === 'F') sexString = '암컷';
  else if (item.sexCd === 'Q') sexString = '미확인';

  let ageString = '나이 미상';
  if (item.age) {
    ageString = `${item.age}년생`;
  }

  let neuterText = '중성화 미상';
  if (item.neuterYn === 'Y') neuterText = '중성화 O';
  else if (item.neuterYn === 'N') neuterText = '중성화 X';

  return {
    id: item.adoptionId,
    imgUrl: item.popfile1,
    kindNm: item.kindNm || '정보 없음',
    sexCd: sexString,
    age: ageString,
    neuterYn: neuterText
  };
}

function SlickPrevArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={className}
      onClick={onClick}
      aria-label="이전"
    >
    </button>
  );
}

function SlickNextArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      className={className}
      onClick={onClick}
      aria-label="다음"
    >
    </button>
  );
}

function RecommendSlider({ pets, loading }) {
  if (loading) {
    return <div>로딩중...</div>;
  }

  if (!pets || pets.length === 0) {
    return <div>추천 공고가 없습니다.</div>;
  }

  const settings = {
    dots: false,
    arrows: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    nextArrow: <SlickNextArrow/>,
    prevArrow: <SlickPrevArrow/>,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true
        }
      }
    ]
  };

  return (
    <section className="adoption-section">
      <h2 className="section-title">입양을 기다리고 있어요!</h2>
      <div className="slider-wrapper">
        <Slider {...settings}>
          {pets.map(pet => (
            <div key={pet.adoptionId} className="slider-item">
              <PetCard pet={formatPetData(pet)} type="adoptions"/>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

export default RecommendSlider; 