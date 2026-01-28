import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../shareable/Navbar";
import Button from "../common/Button";
import type { DataSource } from "./types";
import { toolboxEngineAPI } from "../../common/toolbox-engine.api";
import handleAxiosError from "../../common/handle-axios-error";
import { formatDateTime } from "../../common/formatters";
import { maskApiKey } from "../../common/mask-api-key";

const DataSourceDetailsPage: React.FC = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleBack = () => {
    navigate("/data-sources");
  };

  const handleEdit = () => {
    navigate(`/data-sources/${dataSourceId}/edit`);
  };

  const handleViewEntities = () => {
    navigate(`/data-sources/${dataSourceId}/entities`);
  };

  const handleViewData = () => {
    navigate(`/data-sources/${dataSourceId}/data`);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "NEW": "bg-blue-100 text-blue-800",
      "Active": "bg-green-100 text-green-800",
      "Disabled": "bg-gray-100 text-gray-800",
      "Error": "bg-red-100 text-red-800"
    };
    
    const colorClass = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  useEffect(() => {
    fetchDataSource();
  }, [dataSourceId]);

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
            <Button 
              onClick={handleBack}
              className="mt-2 px-4 py-2 bg-gray-500 hover:bg-gray-600"
            >
              Back to Data Sources
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!dataSource) {
    return (
      <>
        <Navbar activeTab="data-sources" />
        <div className="container-fluid mt-0 p-1 mr-[10px]">
          <p>Data source not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar activeTab="data-sources" />
      <div className="container-fluid mt-0 p-1 mr-[10px]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dataSource.name}</h1>
              <p className="text-gray-600 mt-1">Data Source Details</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleViewEntities} className="px-4 py-2">
                Entities
              </Button>
              <Button onClick={handleViewData} className="px-4 py-2">
                Data
              </Button>
              <Button onClick={handleEdit} className="px-4 py-2">
                Edit
              </Button>
              <Button onClick={handleBack} className="px-4 py-2 bg-gray-500 hover:bg-gray-600">
                Back to List
              </Button>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Data Source Information</h2>
            </div>
            
            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">ID</dt>
                  <dd className="text-lg text-gray-900">{dataSource.id}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Status</dt>
                  <dd>{getStatusBadge(dataSource.status)}</dd>
                </div>
                
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Name</dt>
                  <dd className="text-lg text-gray-900">{dataSource.name}</dd>
                </div>
                
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-1">URL</dt>
                  <dd className="text-lg text-gray-900 break-all">{dataSource.url}</dd>
                </div>
                
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Message</dt>
                  <dd className="text-lg text-gray-900">{dataSource.message || "No message"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">API Key</dt>
                  <dd className="text-lg text-gray-900 font-mono">{maskApiKey(dataSource.apiKey)}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Engine API Key</dt>
                  <dd className="text-lg text-gray-900 font-mono">{maskApiKey(dataSource.engineApiKey)}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Created At</dt>
                  <dd className="text-lg text-gray-900">{formatDateTime(dataSource.createdAt)}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Updated At</dt>
                  <dd className="text-lg text-gray-900">{formatDateTime(dataSource.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleViewEntities}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 font-medium"
            >
              View Entities
            </Button>
            <Button
              onClick={handleViewData}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 font-medium"
            >
              View Data
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataSourceDetailsPage;
