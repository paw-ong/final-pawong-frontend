import React from "react";
import "./LostAnimal.css";

function LostAnimalFound() {
  return (
    <div className="lost-animal-page">
      <div className="lost-animal-header">
        <h1 className="lost-animal-title">발견/보호 동물</h1>
        <p className="lost-animal-description">
          발견되거나 보호 중인 반려동물입니다. 주인을 찾고 있습니다.
        </p>
      </div>
      <div className="lost-animal-content">
        {/* TODO: 발견/보호 동물 목록 컴포넌트 추가 */}
      </div>
    </div>
  );
}

export default LostAnimalFound; 