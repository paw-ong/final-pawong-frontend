import React from "react";
import { Outlet } from "react-router-dom";
import "./LostAnimal.css";

function LostAnimal() {
  return (
    <div className="lost-animal-container">
      <Outlet />
    </div>
  );
}

export default LostAnimal;