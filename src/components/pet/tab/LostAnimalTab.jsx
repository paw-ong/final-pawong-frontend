import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import './LostAnimalTab.css';

function LostAnimalTab({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const { isLoggedIn, handleShowAuthModal } = useContext(AuthContext);

  const handleWriteClick = () => {
    if (isLoggedIn) {
      navigate('/lostAnimal/create');
    } else {
      handleShowAuthModal();
    }
  };

  const handleTabClick = (tab) => {
    onTabChange(tab);
  };

  return (
    <div className="lost-animal-tab-wrapper">
      <div className="lost-animal-tab-container">
        <button
          className={`lost-animal-tab ${activeTab === 'LOST' ? 'active' : ''}`}
          onClick={() => handleTabClick('LOST')}
        >
          찾습니다
        </button>
        <button
          className={`lost-animal-tab ${activeTab === 'FOUND' ? 'active' : ''}`}
          onClick={() => handleTabClick('FOUND')}
        >
          발견했어요
        </button>
        <button
          className={`lost-animal-tab ${activeTab === 'FOSTER' ? 'active' : ''}`}
          onClick={() => handleTabClick('FOSTER')}
        >
          보호중입니다
        </button>
      </div>
      <button className="lost-animal-write-btn" onClick={handleWriteClick}>
        글쓰기
      </button>
    </div>
  );
}

export default LostAnimalTab; 