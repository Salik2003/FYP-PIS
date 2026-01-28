import React from "react";
import Navbar from "../shareable/Navbar";

const EntitiesPage: React.FC = () => {
  return (
    <>
      <Navbar activeTab="entities" />
      <div className="container-fluid mt-0 p-1 mr-[10px]">
        <p>This is Entities content.</p>
      </div>
    </>
  );
};

export default EntitiesPage;
