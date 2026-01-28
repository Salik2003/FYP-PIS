import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../shareable/Navbar";
import type { DataSource } from "./types";
import { toolboxEngineAPI } from "../../common/toolbox-engine.api";
import Alert from "../../shareable/Alert";
import handleAxiosError from "../../common/handle-axios-error";

const DataSourceEditPage: React.FC = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [show, setShow] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState("Initial message");

  const fetchDataSource = async () => {
    if (!dataSourceId) {
      setError("Data source ID is missing");
      setLoading(false);
      return;
    }

    try {
      const response = await toolboxEngineAPI.get(`/api/data_sources/${dataSourceId}`);
      const ds = response.data;
      setDataSource(ds);
      setName(ds.name);
      setUrl(ds.url);
    } catch (error) {
      console.error("Error fetching data source:", error);
      const errorMessage = handleAxiosError(error);
      setError(`Error loading data source: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataSource) return;

    try {
      await toolboxEngineAPI.put(`/api/data_sources/${dataSource.id}`, {
        name,
        url
      });
      showAlert("success", "Data source updated successfully!");
      // Navigate back to data sources page after successful save
      setTimeout(() => {
        navigate("/data-sources");
      }, 1500); // Give time to show the success message
    } catch (error: any) {
      error = handleAxiosError(error);
      showAlert("error", `Error: ${error}`);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShow(true);
  };

  const handleCancel = () => {
    // Navigate back to data sources page
    navigate("/data-sources");
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
            <button 
              onClick={handleCancel}
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
        <div className="flex justify-center">
          <form
            className="bg-white p-[20px] border border-green-500 rounded-[8px] w-full max-w-[750px] font-sans"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between mb-[20px]">
              <h5 className="font-semibold mb-[20px] text-[#1f1f1f] font-['Segoe_UI',sans-serif]">
                Edit data source
              </h5>
              <button
                type="button"
                className="bg-transparent border-none text-[24px] leading-none cursor-pointer text-gray-800 hover:text-red-500 p-[0px]"
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>

            {/* Data source name */}
            <div className="flex items-start gap-[16px] mb-[16px]">
              <input
                type="text"
                placeholder="Data source name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-[14px] py-[10px] text-[14px] border border-gray-300 rounded-[8px] outline-hidden focus:border-blue-500"
              />
              <div className="bg-gray-100 text-gray-600 text-[12px] px-[14px] py-[10px] bg-[#f2f2f2] rounded-[8px] flex-1 leading-[16px]">
                Data source name should be unique
              </div>
            </div>

            {/* URL */}
            <div className="flex items-start gap-[16px] mb-[16px]">
              <input
                type="url"
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-[14px] py-[10px] text-[14px] border border-gray-300 rounded-[8px] outline-hidden focus:border-blue-500"
              />
              <div className="bg-gray-100 text-gray-600 text-[12px] bg-[#f2f2f2] px-[14px] py-[10px] rounded-[8px] flex-1 leading-[16px]">
                The URL to access the data source
              </div>
            </div>

            <button
              type="submit"
              className="flex-1 px-[12px] py-[10px] text-[14px] bg-[#3366ff] text-white rounded-[8px] border-none hover:bg-[#254eda] transition"
            >
              Update Data Source
            </button>
          </form>
        </div>
        
        {show && (
          <div className="flex justify-center mt-4">
            <Alert
              type={alertType}
              message={alertMessage}
              onClose={() => setShow(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default DataSourceEditPage;
