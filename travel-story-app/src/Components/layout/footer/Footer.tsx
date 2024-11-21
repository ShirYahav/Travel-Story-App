import React from 'react';
import './Footer.css'; 

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        About Us |
        Contact Us |
        Privacy Policy 
      </div>
      
      <div className="footer-copyright">
        © {new Date().getFullYear()} Travelog. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
