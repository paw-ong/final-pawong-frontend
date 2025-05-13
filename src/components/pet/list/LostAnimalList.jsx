// ./src/components/pet/LostAnimalList.jsx

import React, { useState, useEffect } from 'react';
import Slider from "react-slick";
import PetCard from "../card/PetCard.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './List.css'
import userImage from '../../../assets/images/user.jpg';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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

function LostAnimalList() {
  const [pets, setPets] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  //
  // useEffect(() => {
  //   const fetchPets = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.get('api link');
  //       setPets(response.data);
  //     } catch (error) {
  //       setError(error.message || '데이터를 불러오는데 실패했습니다.');
  //       console.error('데이터를 불러오는데 실패했습니다: ', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   fetchPets();
  // }, []);

  useEffect(() => {
    const dummyPets = Array.from({ length: 12 }).map((_, idx) => ({
      id: idx + 1,
      upKindNm: '토끼',
      sexCd: '암컷',
      age: '2021년생',
      imgUrl: userImage
    }));
    setPets(dummyPets);
  }, []);

  const settings = {
    dots: false,
    arrows: true,
    infinite: pets.length > 12,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    nextArrow: <SlickNextArrow />,
    prevArrow: <SlickPrevArrow />,
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

  return (
      <section className="lost-animal-section">
        <h2 className="section-title">실종 공고</h2>
        <p className="sub-title">아래 동물을 보시면 연락주세요!</p>
        <Slider {...settings}>
          {pets.slice(0, 12).map(pet => (
              <div key={pet.id}>
                <PetCard pet={pet} type="lostAnimal"/>
              </div>
          ))}
        </Slider>
      </section>
  );
}

export default LostAnimalList;
