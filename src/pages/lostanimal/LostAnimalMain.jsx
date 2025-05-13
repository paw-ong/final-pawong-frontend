import React from 'react';
import { Outlet } from 'react-router-dom';

function LostAnimalMain() {
  return (
    <div className="lost-animal-container">
      <h1>실종 동물</h1>
      <Outlet />
    </div>
  );
}

export default LostAnimalMain; 