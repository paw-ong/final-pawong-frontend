import React from "react";
import "./LostAnimal.css";

function LostAnimalLost() {
  return (
    <div className="lost-animal-page">
      <div className="lost-animal-header">
        <h1 className="lost-animal-title">실종 동물</h1>
        <p className="lost-animal-description">
          실종된 반려동물을 찾고 있습니다. 아래 목록에서 실종된 반려동물을 확인하실 수 있습니다.
        </p>
      </div>
      <div className="lost-animal-content">
        {/* TODO: 실종 동물 목록 컴포넌트 추가 */}
      </div>
    </div>
  );
}

export default LostAnimalLost; 