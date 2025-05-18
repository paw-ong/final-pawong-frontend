import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import './LostAnimalTab.css';

function LostAnimalTab({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleWriteClick = () => {
    if (user && user.id) {
      navigate('/lostAnimal/create');
    } else {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  };

  return (
    <div className="lost-animal-tab-wrapper">
      <div className="lost-animal-tab-container">
        <button
          className={`lost-animal-tab ${activeTab === 'LOST' ? 'active' : ''}`}
          onClick={() => onTabChange('LOST')}
        >
          찾습니다
        </button>
        <button
          className={`lost-animal-tab ${activeTab === 'FOUND' ? 'active' : ''}`}
          onClick={() => onTabChange('FOUND')}
        >
          발견했어요
        </button>
        <button
          className={`lost-animal-tab ${activeTab === 'FOSTER' ? 'active' : ''}`}
          onClick={() => onTabChange('FOSTER')}
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