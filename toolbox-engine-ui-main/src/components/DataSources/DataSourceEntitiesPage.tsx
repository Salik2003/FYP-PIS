import React, { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaCheckCircle, FaChevronDown, FaChevronRight, FaMinusCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import handleAxiosError from "../../common/handle-axios-error";
import { toolboxEngineAPI } from "../../common/toolbox-engine.api";
import Navbar from "../../shareable/Navbar";
import type { DataSource } from "./types";

const DataSourceEntitiesPage: React.FC = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const navigate = useNavigate();
  
  // Data source state
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Entities state
  const [entities, setEntities] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState<string | null>("Loading entities...");
  const [expandedEntities, setExpandedEntities] = useState<Record<number, boolean>>({});

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
    
    try {
      setLoadingMessage("Loading entities...");
      const response = await toolboxEngineAPI.get(`/api/data_source_entities?dataSourceId=${dataSource.id}`);
      setEntities(response.data);
      if(Object.keys(expandedEntities).length === 0) {
        setExpandedEntities(response.data.reduce((acc: Record<number, boolean>, entity: any) => { acc[entity.id] = true; return acc; }, {}));
      }
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
    setLoadingMessage(null);
  };

  const syncEntities = async () => {
    if (!dataSource) return;
    
    try {
      setLoadingMessage("Syncing entities...");
      await toolboxEngineAPI.post(`/api/data_source_entities/sync`, { dataSourceId: dataSource.id });
      await fetchEntities(); // Refresh entities after sync
    } catch (error) {
      console.error("Error syncing entities:", error);
      setLoadingMessage(null);
    }
  };

  const handleBack = () => {
    // Navigate back to data sources page
    navigate("/data-sources");
  };

  const backToDataSources = () => {
    setEntities([]);
    setExpandedEntities({});
    handleBack();
  };

  const formatForeignKeyRefs = (entity: any, f: any) => {
    const result: string[] = [];
    for (let foreignKey of entity.foreignKeys) {
      for (let field of foreignKey.fields) {
        if (field.field.id === f.id) {
          result.push(`${foreignKey.refEntity.name}.${field.refField.name}`);
        }
      }
    }
    return result.join(', ');
  };

  const toggleEntityExpansion = (entityId: number) => {
    setExpandedEntities((prev) => ({
      ...prev,
      [entityId]: !prev[entityId],
    }));
  };

  const getStatusIcon = (status: string) => {
    let Icon;
    let color;

    switch (status) {
      case "ENABLED":
        Icon = FaCheckCircle;
        color = "text-green-500";
        break;
      case "DISABLED":
        Icon = FaMinusCircle;
        color = "text-gray-400";
        break;
      case "REMOVED":
        Icon = FaTimesCircle;
        color = "text-red-500";
        break;
      default:
        Icon = FaMinusCircle;
        color = "text-gray-300";
    }

    return <Icon className={`w-4 h-4 ${color}`} />;
  };

  const handleFieldMoveUp = async (fieldId: number) => {
    const response = await toolboxEngineAPI.post(`/api/data_source_entities/${fieldId}/move-field-up`, { fieldId });
    if (response.status === 200) {
      fetchEntities();
    }
  };

  const handleFieldMoveDown = async (fieldId: number) => {
    const response = await toolboxEngineAPI.post(`/api/data_source_entities/${fieldId}/move-field-down`, { fieldId });
    if (response.status === 200) {
      fetchEntities();
    }
  };

  const handleEntityMoveUp = async (entityId: number) => {
    const response = await toolboxEngineAPI.post(`/api/data_source_entities/${entityId}/move-up`, { entityId });
    if (response.status === 200) {
      fetchEntities();
    }
  };

  const handleEntityMoveDown = async (entityId: number) => {
    const response = await toolboxEngineAPI.post(`/api/data_source_entities/${entityId}/move-down`, { entityId });
    if (response.status === 200) {
      fetchEntities();
    }
  };

  const buildFieldTable = (entity: any) => {
    const fields = entity.fields || [];
    return (
      <table className="w-[800px] border-collapse text-[13px]">
        <thead>
          <tr className="bg-[#f7f9fb] font-semibold text-[#333]">
            <th className="px-3 py-2 w-[200px] text-left border-b border-[#e4e4e7]">Field</th>
            <th className="px-3 py-2 w-[50px] text-left border-b border-[#e4e4e7]">PK</th>
            <th className="px-3 py-2 w-[150px] text-left border-b border-[#e4e4e7]">Type</th>
            <th className="px-3 py-2 text-left border-b border-[#e4e4e7]">Ref (Foreign Key)</th>
          </tr>
        </thead>
        <tbody>
          {fields && fields.map((field: any, index: number) => (
            <tr key={`${field.id}`} className="border-t border-[#e4e4e7] last:border-b">
              <td className="px-3 py-1.5 flex items-center gap-2">{getStatusIcon(field.status)}&nbsp;{field.name}</td>
              <td className="px-3 py-1.5">{field.primary ? "PK" : ""}</td>
              <td className="px-3 py-1.5">{field.type}</td>
              <td className="px-3 py-1.5">{formatForeignKeyRefs(entity, field)}</td>
              <td className="px-[12px] py-[12px]">
                <div className="flex items-center justify-center gap-1">
                  { index > 0 && (
                  <span title="Move up">
                    <FaArrowUp className="cursor-pointer hover:text-black" onClick={() => handleFieldMoveUp(field.id)}/>
                  </span>
                  )}
                  {index < fields.length - 1 && (
                    <span title="Move down">
                      <FaArrowDown className="cursor-pointer hover:text-black" onClick={() => handleFieldMoveDown(field.id)}/>
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const displayEntity = (entity: any, index: number, total: number) => {
    const isOpen = expandedEntities[entity.id] || false;
    return (
      <div key={entity.id} className="mb-2 text-gray-600">
        {/* Header row */}
        <div className="flex items-center gap-2">
          {getStatusIcon(entity.status)}
          <span
            className="cursor-pointer"
            onClick={() => toggleEntityExpansion(entity.id)}
          >
            {entity.name}
          </span>

          {isOpen ? (
            <FaChevronDown
              className="w-3 h-3 text-gray-500 cursor-pointer"
              onClick={() => toggleEntityExpansion(entity.id)}
            />
          ) : (
            <FaChevronRight
              className="w-3 h-3 text-gray-500 cursor-pointer"
              onClick={() => toggleEntityExpansion(entity.id)}
            />
          )}

          <div className="flex items-center justify-center gap-1">
            { index > 0 && (
            <span title="Move up">
              <FaArrowUp className="cursor-pointer hover:text-black" onClick={() => handleEntityMoveUp(entity.id)}/>
            </span>
            )}
            {index < total - 1 && (
              <span title="Move down">
                <FaArrowDown className="cursor-pointer hover:text-black" onClick={() => handleEntityMoveDown(entity.id)}/>
              </span>
            )}
          </div>
        </div>

        {/* Collapsible content (table below) */}
        {isOpen && (
          <div className="mt-2 ml-6">
            {buildFieldTable(entity)}
          </div>
        )}
      </div>
    );
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

  // Clear loading message when entities are loaded
  useEffect(() => {
    if (entities.length > 0) {
      setLoadingMessage(null);
    }
  }, [entities]);

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

  if (loadingMessage) {
    return (
      <>
        <Navbar activeTab="data-sources" />
        <div className="container-fluid mt-0 p-1 mr-[10px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{loadingMessage}</p>
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
          <h1 className="text-2xl font-bold mb-4">Data Source Entities for {dataSource?.name}</h1>

          <div className="flex items-center whitespace-nowrap gap-4">
            <button
              className="mb-2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
              onClick={syncEntities}
            >
              Sync Entities
            </button>
            <button
              className="mb-2 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
              onClick={backToDataSources}
            >
              Back to Data Sources
            </button>
          </div>
          
          {entities.length === 0 && (
            <p className="text-gray-500 mb-4">No entities found / synced for this data source</p>
          )}
          {entities.length > 0 && (
            <>
              {entities.map((entity, index) => displayEntity(entity, index, entities.length))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DataSourceEntitiesPage;
