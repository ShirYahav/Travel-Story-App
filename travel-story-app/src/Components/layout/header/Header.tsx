import React from 'react';
import './Header.css'; 
import { Link, NavLink } from "react-router-dom";


const HeaderMenu: React.FC = () => {
  return (
    <header className="header-menu">
      <div className="menu-left">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
      </div>
      
      <div className="menu-right">
        <Link className="menuRightLink" to={'/add-story'}> Add story </Link>
        <div>&nbsp;|&nbsp;</div>
        <Link className="menuRightLink" to={'/'}> My Profile</Link>
      </div>
    </header>
  );
};

export default HeaderMenu;
