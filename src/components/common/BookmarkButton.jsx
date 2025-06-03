import React from 'react';
import './BookmarkButton.css';

const BookmarkButton = ({ isBookmarked, onClick, disabled }) => {
  return (
    <button 
      className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
      onClick={onClick}
      disabled={disabled}
      data-is-bookmarked={isBookmarked}
    >
      <img 
        src="https://cdn-icons-png.flaticon.com/512/10925/10925481.png"
        alt="북마크"
        className="bookmark-icon"
      />
    </button>
  );
};

export default BookmarkButton; 