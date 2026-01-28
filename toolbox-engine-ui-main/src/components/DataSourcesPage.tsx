import React from "react";
import Navbar from "../shareable/Navbar";
import DataSources from "./DataSources/DataSources";

const DataSourcesPage: React.FC = () => {
  return (
    <>
      <Navbar activeTab="data-sources" />
      <div className="container-fluid mt-0 p-1 mr-[10px]">
        <DataSources />
      </div>
    </>
  );
};

export default DataSourcesPage;
