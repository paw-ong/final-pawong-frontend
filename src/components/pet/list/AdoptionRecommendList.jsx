import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import PetCard from "../card/PetCard.jsx";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './List.css'
import {getAdoptionList} from "../../../services/adoptionService.js";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../common/PrimaryButton.jsx";
import Adoption from '../../../assets/images/main/Adoption.png';
import LostAnimal from '../../../assets/images/main/LostAnimal.png';

function SlickPrevArrow(props) {
  const { className, style, onClick } = props;
  return (
      <button
          className={className}
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            left: "-30px",
            zIndex: 2,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 2px 8px rgba(167,146,119,0.15)",
            border: "2px solid #D1BB9E",
            color: "#D1BB9E",
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={onClick}
          aria-label="이전"
      >
        <FaChevronLeft size={22}/>
      </button>
  );
}

function SlickNextArrow(props) {
  const { className, style, onClick } = props;
  return (
      <button
          className={className}
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            right: "-30px",
            zIndex: 2,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 2px 8px rgba(167,146,119,0.15)",
            border: "2px solid #D1BB9E",
            color: "#D1BB9E",
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={onClick}
          aria-label="다음"
      >
        <FaChevronRight size={22}/>
      </button>
  );
}

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

function AdoptionRecommendList({ user, onRequireAuth }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('AdoptionRecommendList mounted')
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const data = await getAdoptionList('/adoptions/recommend');
        console.log('API 응답:', data); // 응답 구조 확인
        setPets(data.adoptionCards || []);
      } catch (error) {
        setError(error.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    variableWidth: false,
    nextArrow: <SlickNextArrow/>,
    prevArrow: <SlickPrevArrow/>,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
      <section className="adoption-section">
        <h2 className="section-title">입양을 기다리고 있어요!</h2>
        <div className="slider-wrapper">
        <Slider {...settings}>
          {pets.map(pet => (
              <div key={pet.adoptionId}>
                <PetCard 
                  user={user}
                  onRequireAuth={onRequireAuth}
                  pet={formatPetData(pet)} 
                  type="adoptions"
                />
              </div>
          ))}
        </Slider>
        </div>
      </section>
  );
}

export default AdoptionRecommendList;