import React, { useEffect, useState } from 'react';
import RecommendSlider from '../../mainpage/RecommendSlider';
import {getAdoptionList} from "../../../services/adoptionService.js";

function AdoptionRecommendList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const data = await getAdoptionList('/adoptions/recommend');
        setPets(data.adoptionCards || []);
      } catch (error) {
        setError(error.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  if (error) return <div>오류: {error}</div>;

  return <RecommendSlider pets={pets} loading={loading} />;
}

export default AdoptionRecommendList;