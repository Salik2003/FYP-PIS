import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../shareable/Navbar";
import type { DataSource } from "./types";
import { toolboxEngineAPI } from "../../common/toolbox-engine.api";
import handleAxiosError from "../../common/handle-axios-error";
import DataPull from "./DataPull";

const DataSourceDataPage: React.FC = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const navigate = useNavigate();
  
  // Data source state
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data display state
  const [loadingMessage, setLoadingMessage] = useState<string | null>("Loading data...");
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);

  const fetchDataSource = async () => {
    if (!dataSourceId) {
      setError("Data source ID is missing");
      setLoading(false);
      return;
    }

    try {
      const response = await toolboxEngineAPI.get(`/api/data_sources/${dataSourceId}`);
      setDataSource(response.data);
    } catch (error) {
      console.error("Error fetching data source:", error);
      const errorMessage = handleAxiosError(error);
      setError(`Error loading data source: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    if (!dataSource) return;
    
    setLoadingMessage("Loading entities...");
    try {
      const response = await toolboxEngineAPI.get(`/api/data_source_entities?dataSourceId=${dataSource.id}`);
      const entities = response.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setEntities(entities);
      if (entities.length > 0) {
        setActiveTab(entities[0].id);
      }
    } catch (error) {
      console.error("Error fetching entities:", error);
      setLoadingMessage(null);
    }
  };

  const fetchData = async () => {
    if (activeTab === null) {
      setData([]);
      setFields([]);
      return;
    }
    
    setLoadingMessage("Loading data...");
    const entityId = activeTab;
    try {
      const response = await toolboxEngineAPI.get(`/api/data_source_data?entityId=${entityId}`);
      const json = response.data;
      const fields = (json.fields || []).filter((f: any) => f.status !== "REMOVED");
      setFields(fields);
      setData(json.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    }
    setLoadingMessage(null);
  };

  const handleBack = () => {
    // Navigate back to data sources page
    navigate("/data-sources");
  };

  // Initial data source fetch
  useEffect(() => {
    fetchDataSource();
  }, [dataSourceId]);

  // Fetch entities when data source is loaded
  useEffect(() => {
    if (dataSource) {
      fetchEntities();
    }
  }, [dataSource]);

  // Fetch data when active tab changes
  useEffect(() => {
    if (activeTab === null) {
      setFields([]);
      setData([]);
      return;
    }
    fetchData();
  }, [activeTab]);

  // Clear loading message when data is loaded
  useEffect(() => {
    if (data.length > 0) {
      setLoadingMessage(null);
    }
  }, [data]);

  if (loading) {
    return (
      <>
        <Navbar activeTab="data-sources" />
        <div className="container-fluid mt-0 p-1 mr-[10px]">
          <p>Loading data source...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar activeTab="data-sources" />
        <div className="container-fluid mt-0 p-1 mr-[10px]">
          <div className="text-red-500">
            <p>{error}</p>
            <button 
              onClick={handleBack}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Data Sources
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar activeTab="data-sources" />
      <div className="container-fluid mt-0 p-1 mr-[10px]">
        <div className="p-0">
          <div className="flex items-center whitespace-nowrap gap-4">
            <h1 className="text-2xl font-bold mb-4">Data Source - Data for {dataSource?.name}</h1>
            <button
              className="mb-2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
              onClick={handleBack}
            >
              Back to Data Sources
            </button>
          </div>

          <ul className="flex m-0 p-0 list-none gap-0" role="tablist">
            {entities.map((entity: any) => {
              const isActive = activeTab === entity.id;
              return (
                <li key={entity.id} role="presentation" className="m-0">
                  <div className={`flex items-center whitespace-nowrap gap-1 cursor-pointer px-5 py-2 font-medium border border-gray-300 transition-colors duration-200 cursor-pointer ${isActive ? "bold border-blue-600" : "bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500"} ${isActive ? "rounded-t-lg" : ""}`} onClick={() => setActiveTab(entity.id)}>
                    {entity.name.toUpperCase()}
                    {activeTab === entity.id && (<DataPull targetType="TABLE" targetId={entity.id} onBack={handleBack} />)}
                  </div>
                </li>
              );
            })}
          </ul>

          {loadingMessage && (
            <p className="text-gray-500 mb-4">{loadingMessage}</p>
          )}
          {!loadingMessage && data.length === 0 && (
            <p className="text-gray-500 mb-4">No data found for this entity</p>
          )}
          {!loadingMessage && data.length > 0 && (
            <div className="overflow-x-auto table-wrp block max-h-[calc(100vh-200px)]">
              <table className="w-full border-collapse text-[13px]">
                <thead className="bg-white border-b sticky top-0">
                  <tr className="bg-[#f7f9fb] font-semibold text-[#333]">
                    {fields.map((field) => (
                      <th key={field.name} className="px-3 py-2 border-b border-[#e4e4e7] text-left">
                        {field.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="h-[calc(100vh-200px)] overflow-y-auto">
                  {data.map((row, index) => (
                    <tr key={index} className="border-t border-[#e4e4e7] last:border-b">
                      {fields.map((field) => (
                        <td key={field.name} className="px-3 py-1.5 min-w-3xs max-w-md overflow-hidden text-ellipsis whitespace-pre-wrap">
                          {row[field.name]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DataSourceDataPage;
