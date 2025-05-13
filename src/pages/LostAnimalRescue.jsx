import React from "react";
import "./LostAnimal.css";

function LostAnimalRescue() {
  return (
    <div className="lost-animal-page">
      <div className="lost-animal-header">
        <h1 className="lost-animal-title">구조 동물</h1>
        <p className="lost-animal-description">
          구조된 반려동물들입니다. 새로운 가족을 기다리고 있습니다.
        </p>
      </div>
      <div className="lost-animal-content">
        {/* TODO: 구조 동물 목록 컴포넌트 추가 */}
      </div>
    </div>
  );
}

export default LostAnimalRescue; 