import React, { useState, useEffect, useContext, useRef } from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom'
import './Header.css';
import logo from '../../assets/images/logo/logo.png';
import defaultUserImage from '../../assets/images/user.jpg'
import { AuthContext } from '../../contexts/AuthContext';
import { useLocation } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userImage, setUserImage] = useState(defaultUserImage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLostAnimalDropdownOpen, setIsLostAnimalDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isMainPage = location.pathname === '/main';

  useEffect(() => {
    if (user && user.profileImage) {
      setUserImage(user.profileImage);
    } else {
      setUserImage(defaultUserImage);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLostAnimalDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserClick = () => {
    if (user) {
      navigate('/mypage');
    } else {
    navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(false);
  };

  const toggleMobileDropdown = (e) => {
    e.stopPropagation();
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo-container">
        <Link to="/main">
          <img src={logo} alt="pawong logo" className="logo"/>
        </Link>
      </div>
      
      {/* 데스크톱 메뉴 */}
      <div className="desktop-menu">
        <nav className="main-nav">
          <ul className="nav-tabs">
            {!isMainPage && (
                <>
            <li className="tab-item">
              <NavLink to="/adoptions" className={({ isActive }) => (isActive ? "active" : "")}>
                입양 동물
              </NavLink>
            </li>
            <li className="tab-item dropdown" ref={dropdownRef}>
              <div 
                className="dropdown-trigger"
                onMouseEnter={() => setIsLostAnimalDropdownOpen(true)}
                onMouseLeave={() => setIsLostAnimalDropdownOpen(false)}
              >
                <NavLink to="/lostAnimal" className={({ isActive }) => (isActive && !location.pathname.includes('/lostAnimal/') ? "active" : "")}>
                  실종 동물
                </NavLink>
                {isLostAnimalDropdownOpen && (
                  <div className="dropdown-menu">
                    <NavLink 
                      to="/lostAnimal/lost" 
                      className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}
                      end
                    >
                      실종
                    </NavLink>
                    <NavLink 
                      to="/lostAnimal/found" 
                      className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}
                      end
                    >
                      발견/보호
                    </NavLink>
                    <NavLink 
                      to="/lostAnimal/rescue" 
                      className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}
                      end
                    >
                      구조
                    </NavLink>
                  </div>
                )}
              </div>
            </li>
                </>
                )}
          </ul>
        </nav>
        <div className="user" onClick={handleUserClick}>
          <img src={userImage} alt="user-img" className="user-img"/>
        </div>
      </div>

      {/* 모바일 메뉴 버튼 */}
      <button className="hamburger-menu" onClick={toggleMenu} ref={hamburgerRef}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="user" onClick={handleUserClick}>
          <img src={userImage} alt="user-img" className="user-img"/>
        </div>
        <nav className="main-nav">
          <ul className="nav-tabs">
            <li className="tab-item">
              <NavLink to="/adoptions" className={({ isActive }) => (isActive ? "active" : "")} onClick={handleMenuClick}>
                입양 동물
              </NavLink>
            </li>
            <li className="tab-item mobile-dropdown-container"
                onMouseEnter={() => setIsMobileDropdownOpen(true)}
                onMouseLeave={() => setIsMobileDropdownOpen(false)}
            >
              <div className="mobile-dropdown-trigger">
                <NavLink 
                  to="/lostAnimal" 
                  className={({ isActive }) => (isActive && !location.pathname.includes('/lostAnimal/') ? "active" : "")} 
                >
                  실종 동물
                </NavLink>
              </div>
              <div className={`mobile-dropdown ${isMobileDropdownOpen ? 'show' : ''}`}>
                <NavLink 
                  to="/lostAnimal/lost" 
                  className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleMenuClick();
                    setIsMobileDropdownOpen(false);
                  }}
                  end
                >
                  실종
                </NavLink>
                <NavLink 
                  to="/lostAnimal/found" 
                  className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleMenuClick();
                    setIsMobileDropdownOpen(false);
                  }}
                  end
                >
                  발견/보호
                </NavLink>
                <NavLink 
                  to="/lostAnimal/rescue" 
                  className={({ isActive }) => `dropdown-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    handleMenuClick();
                    setIsMobileDropdownOpen(false);
                  }}
                  end
                >
                  구조
                </NavLink>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
