import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import './Layout.css';

function Layout() {
  const location = useLocation();
  const isLostAnimalCreate = location.pathname.startsWith("/lostAnimal/create");
  const isChatRoom = location.pathname.startsWith("/chat");

  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
      {!isLostAnimalCreate && !isChatRoom && <Footer />}
    </div>
  );
}

export default Layout;