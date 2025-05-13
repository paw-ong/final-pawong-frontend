import React from "react";
import {useParams} from "react-router-dom";

function LostAnimalDetail() {
  const { id } = useParams();

  return (
      <h1>실종동물 상세정보(ID:{id})</h1>
  );
}

export default LostAnimalDetail;
