import React from 'react';
import './Header.css'; 
import { NavLink } from "react-router-dom";


const HeaderMenu: React.FC = () => {
  return (
    <header className="header-menu">
      <div className="menu-left">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
      </div>
      
      <div className="menu-right">
        My Profile
      </div>
    </header>
  );
};

export default HeaderMenu;
