import React from "react";
import HeaderMenu from "../header/Header";
import Footer from "../footer/Footer";
import "./Layout.css";
import Home from "../../home/Home";
import Routing from "../routing/Routing";

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <HeaderMenu />

      <main className="content">
        <Routing/>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
