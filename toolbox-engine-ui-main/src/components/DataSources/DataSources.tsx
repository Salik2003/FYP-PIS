import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataSourcesTable from "./DataSourcesTable";
import type { DataSource } from "./types";
import { toolboxEngineAPI } from "../../common/toolbox-engine.api";
import { ConfirmDialog } from "../../shareable/ConfirmationDialog";
import handleAxiosError from "../../common/handle-axios-error";
import { SubPage } from "./SubPages";

const DataSources: React.FC = () => {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [subPage, setSubPage] = useState<SubPage | null>(null);


  const handleEdit = (id: number) => {
    // Navigate to the edit page with the data source ID
    navigate(`/data-sources/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    setSelectedDataSource(dataSources.find((ds) => ds.id === id) || null);
    setConfirmDelete(true);
  };

  const submitDelete = async () => {
    try {
      await toolboxEngineAPI.delete(`/api/data_sources/${selectedDataSource?.id}`);
      await fetchDataSources();
    } catch (error) {
      console.log(error);
      const errorMessage = handleAxiosError(error);
      console.error("Error deleting data source:", errorMessage);
    }
    setConfirmDelete(false);
  };

  const handleSubPageSelected = (id: number, subPage: SubPage) => {
    if (subPage === SubPage.ENTITIES) {
      navigate(`/data-sources/${id}/entities`);
    } else if (subPage === SubPage.DATA_PAGE) {
      navigate(`/data-sources/${id}/data`);
    } else {
      // For other subpages, use the existing state management
      const dataSource = dataSources.find((ds) => ds.id === id);
      if (dataSource) {
        setSelectedDataSource(dataSource);
        setSubPage(subPage);
      }
    }
  };

  const fetchDataSources = async () => {
    try {
      const response = await toolboxEngineAPI.get("/api/data_sources");
      setDataSources(response.data);
    } catch (error) {
      console.log(error);
      console.error("Error fetching data sources:", error);
    }
  };

  const handleMoveUp = async (dataSourceId: number) => {
    const response = await toolboxEngineAPI.post(`/api/data_sources/${dataSourceId}/move-up`, { dataSourceId });
    if (response.status === 200) {
      fetchDataSources();
    }
  };

  const handleMoveDown = async (dataSourceId: number) => {
    const response = await toolboxEngineAPI.post(`/api/data_sources/${dataSourceId}/move-down`, { dataSourceId });
    if (response.status === 200) {
      fetchDataSources();
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, []);

  return (
    <div className="p-0">
      {!subPage && (
        <DataSourcesTable data={dataSources}
          onAdd={() => navigate("/data-sources/new")}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubPageSelected={handleSubPageSelected} 
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this data source?"
          onConfirm={() => submitDelete()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
};

export default DataSources;
