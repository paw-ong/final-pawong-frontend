import React from "react";
import AdoptionRecommendList from "../../components/pet/list/AdoptionRecommendList.jsx";
import './MainPage.css';
import Adoption from "../../assets/images/main/Adoption.png";
import LostAnimal from "../../assets/images/main/LostAnimal.png";
import {useNavigate} from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();

  return (
    <>
      <AdoptionRecommendList />
      <div className="main-move-btns">
        <button
          className="move-btn-vertical"
          onClick={() => navigate('/adoptions')}
          type="button"
        >
          <img src={Adoption} alt="입양동물" className="move-btn-img" />
          <span>입양 동물</span>
        </button>
        <button
          className="move-btn-vertical"
          onClick={() => navigate('/lostAnimal')}
          type="button"
        >
          <img src={LostAnimal} alt="실종동물" className="move-btn-img" />
          <span>실종 동물</span>
        </button>
      </div>
    </>
  );
}

export default MainPage;