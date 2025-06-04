import React from 'react';
import './LostCardSpinner.css';

const LostCardSpinner = () => {
  return (
    <div className="card-placeholder">
      {/* 상단: 이미지 영역 placeholder */}
      <div className="placeholder-upper"></div>

      {/* 하단: 텍스트 영역 placeholder */}
      <div className="placeholder-lower">
        <div className="placeholder-line"></div>
        <div className="placeholder-line"></div>
        <div className="placeholder-line"></div>
        <div className="placeholder-line"></div>
      </div>
    </div>
  );
};

export default LostCardSpinner; 