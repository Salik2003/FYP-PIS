import React from "react";
import Navbar from "../shareable/Navbar";

const DataPage: React.FC = () => {
  return (
    <>
      <Navbar activeTab="data" />
      <div className="container-fluid mt-0 p-1 mr-[10px]">
        <p>This is Data content.</p>
      </div>
    </>
  );
};

export default DataPage;
