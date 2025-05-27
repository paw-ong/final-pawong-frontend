import React, { useContext } from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Adoption from "./pages/adoptionAnimal/Adoption.jsx";
import LostAnimal from "./pages/lostanimal/LostAnimal.jsx";
import MainPage from "./pages/mainPage/MainPage.jsx";
import Login from "./pages/signup/Login.jsx";
import MyPage from "./pages/myPage/MyPage.jsx";
import AdoptionDetail from "./pages/adoptionAnimal/AdoptionDetail.jsx";
import LostAnimalDetail from "./pages/lostanimal/LostAnimalDetail.jsx";
import LostAnimalCreate from "./pages/lostanimal/LostAnimalCreate.jsx";
import OAuthRedirectHandler from "./components/auth/OAuthRedirectHandler.jsx";
import AdditionalInfo from "./pages/signup/AdditionalInfo.jsx";
import { AuthContext } from "./contexts/AuthContext";
import LostAnimalUpdate from "./pages/lostanimal/LostAnimalUpdate.jsx";
import ChatRoom from "./pages/chat/ChatRoom.jsx";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/main" replace />} />
        <Route path="main" element={<MainPage />} />
        <Route path="adoptions" element={<Adoption />} />
        <Route path="adoptions/:id" element={<AdoptionDetail />} />
        <Route path="lostAnimal" element={<LostAnimal />} />
        <Route path="lostAnimal/detail/:id" element={<LostAnimalDetail />} />
        <Route path="lostAnimal/create" element={<LostAnimalCreate />} />
        <Route path="lostAnimal/update/:postId" element={<LostAnimalUpdate />} />
        <Route path="oauth2/redirect" element={<OAuthRedirectHandler />} />
        <Route path="login" element={<Login />} />
        <Route
          path="myPage"
          element={user ? <MyPage /> : <Navigate to="/login" replace />}
        />
        <Route path="signup/additional-info" element={<AdditionalInfo />} />
        <Route 
          path="lostAnimal/detail/:id/chat/:roomId" element={<ChatRoom />}
        />
      </Route>
    </Routes>
  );
}

export default App;
