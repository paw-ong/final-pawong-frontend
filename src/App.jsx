import React, { useContext } from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Adoption from "./pages/adoptionAnimal/Adoption.jsx";
import LostAnimal from "./pages/lostAnimal/LostAnimal.jsx";
import LostAnimalLost from "./pages/lostAnimal/LostAnimalLost.jsx";
import LostAnimalFound from "./pages/lostAnimal/LostAnimalFound.jsx";
import LostAnimalRescue from "./pages/lostAnimal/LostAnimalRescue.jsx";
import MainPage from "./pages/mainPage/MainPage.jsx";
import Login from "./pages/signup/Login.jsx";
import MyPage from "./pages/myPage/MyPage.jsx";
import AdoptionDetail from "./pages/adoptionAnimal/AdoptionDetail.jsx";
import LostAnimalDetail from "./pages/lostAnimal/LostAnimalDetail.jsx";
import OAuthRedirectHandler from "./components/auth/OAuthRedirectHandler.jsx";
import AdditionalInfo from "./pages/signup/AdditionalInfo.jsx";
import { AuthContext } from "./contexts/AuthContext";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/main" replace />} />
        <Route path="main" element={<MainPage />} />
        <Route path="adoptions" element={<Adoption />} />
        <Route path="adoptions/:id" element={<AdoptionDetail />} />
        <Route path="lostAnimal" element={<LostAnimal />}>
          <Route index element={<Navigate to="lost" replace />} />
          <Route path="lost" element={<LostAnimalLost />} />
          <Route path="found" element={<LostAnimalFound />} />
          <Route path="rescue" element={<LostAnimalRescue />} />
        </Route>
        <Route path="lostAnimal/detail/:id" element={<LostAnimalDetail />} />
        <Route path="oauth2/redirect" element={<OAuthRedirectHandler />} />
        <Route path="login" element={<Login />} />
        <Route
          path="myPage"
          element={user ? <MyPage /> : <Navigate to="/login" replace />}
        />
        <Route path="signup/additional-info" element={<AdditionalInfo />} />
      </Route>
    </Routes>
  );
}

export default App;
