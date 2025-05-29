import React from 'react';
import './FavoriteButton.css';

const FavoriteButton = ({ isFavorite, onClick, disabled }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-pressed={isFavorite}
      data-is-favorite={isFavorite}
    >
      <img 
        src="https://cdn-icons-png.flaticon.com/512/2589/2589175.png"
        alt={isFavorite ? "찜 해제" : "찜 하기"}
        className="favorite-icon"
        draggable="false"
      />
    </div>
  );
};

export default FavoriteButton; 