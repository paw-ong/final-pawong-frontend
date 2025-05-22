import React, { useEffect, useState } from "react";
import PetCard from "../card/PetCard.jsx";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./LostAnimalList.css";
import client from "../../../api/client";

function LostAnimalList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLostAnimals = async () => {
      try {
        const response = await client.get('/lost-animals', {
          params: { 
            page: 1,
            size: 4,  // 메인 페이지에서는 4개만 보여줌
            type: 'LOST'
          }
        });
        setPets(response.data.lostAnimalCards || []);
      } catch (error) {
        console.error('Failed to fetch lost animal list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLostAnimals();
  }, []);

  // API 응답을 PetCard 형식에 맞게 변환
  const formatPetData = (item) => {
    const currentYear = new Date().getFullYear();
    const ageInYears = item.age ? currentYear - item.age : null;
    const ageString = ageInYears ? `${ageInYears}살` : '나이 미상';

    return {
      id: item.lostAnimalId,
      imgUrl: item.imageUrl,
      kindNm: item.kindNm || '기타',
      sexCd: item.sexCd === 'M' ? '수컷' : item.sexCd === 'F' ? '암컷' : '미상',
      age: ageString,
      type: item.type || 'LOST'
    };
  };

  if (loading) {
    return (
      <div className="lost-animal-list-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return <div className="lost-animal-list-empty">등록된 실종 동물이 없습니다.</div>;
  }

  return (
    <div className="lost-animal-list-container">
      <h2>실종 동물</h2>
      <div className="lost-animal-list-grid">
        {pets.map((item, index) => (
          <div key={`${item.lostAnimalId}-${index}`} className="lost-animal-list-item">
            <PetCard pet={formatPetData(item)} type="lost-animals" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LostAnimalList; 