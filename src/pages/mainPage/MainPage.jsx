import React from "react";
import AdoptionRecommendList from "../../components/pet/list/AdoptionRecommendList.jsx";
import LostAnimalList from "../../components/pet/list/LostAnimalList.jsx";
import './MainPage.css';
import Adoption from "../../assets/images/main/Adoption.png";
import LostAnimal from "../../assets/images/main/LostAnimal.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import AuthRequiredModal from "../../components/auth/AuthRequiredModal";

function MainPage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  return (
      <div className="main">
        <AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
        <div className="lists-container">
          <AdoptionRecommendList 
            user={user}
            onRequireAuth={() => setShowAuthModal(true)}
          />
          {/*<LostAnimalList /> */}
          <div className="main-move-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32 }}>
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
        </div>
      </div>
  );
}

export default MainPage;