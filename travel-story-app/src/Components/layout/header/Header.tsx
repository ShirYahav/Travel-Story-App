import React from 'react';
import './Header.css'; 
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from '../../../Context/UserContext';


const HeaderMenu: React.FC = () => {

  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () =>{
    localStorage.removeItem('token');
    setUser(null);
    navigate("/");
  }

  return (
    <header className="header-menu">
      <div className="menu-left">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
      </div>
      
      <div className="menu-right">
        {user ? (
          <>
            <Link className="menuRightLink" to={'/add-story'}> Add Story </Link>
            <div>&nbsp;|&nbsp;</div>
            <Link className="menuRightLink" to={'/my-stories'}> My Stories </Link>
            <div>&nbsp;|&nbsp;</div>
            <button onClick={handleLogout} className='logoutButton'>Logout</button>
          </>
        ) : (
          <>
            <Link className="menuRightLink" to={'/login'}> Login </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default HeaderMenu;
