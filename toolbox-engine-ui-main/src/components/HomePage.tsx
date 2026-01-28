import React from "react";
import Navbar from "../shareable/Navbar";

const HomePage: React.FC = () => {
  return (
    <>
      <Navbar activeTab="home" />
      <div className="container-fluid mt-0 p-1 mr-[10px]">
        <p>This is Home tab content.</p>
      </div>
    </>
  );
};

export default HomePage;
