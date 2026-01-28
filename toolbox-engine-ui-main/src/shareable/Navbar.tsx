import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

type NavbarProps = {
  activeTab: string;
  setActiveTab?: (tab: string) => void; // Make optional since we're not using it anymore
};

const tabs = [
  { id: "home", label: "Home" },
  { id: "data-sources", label: "Data Sources" },
  { id: "entities", label: "Entities" },
  { id: "data", label: "Data" },
  { id: "scheduled-jobs", label: "Scheduled Jobs" },
];

const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [dataSourceName, setDataSourceName] = useState<string>("");
  
  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  const handleTabClick = (tabId: string) => {
    // Navigate to the corresponding route for each tab
    switch (tabId) {
      case "home":
        navigate("/home");
        break;
      case "data-sources":
        navigate("/data-sources");
        break;
      case "entities":
        navigate("/entities");
        break;
      case "data":
        navigate("/data");
        break;
      case "scheduled-jobs":
        navigate("/scheduled-jobs");
        break;
      default:
        navigate("/home");
    }
  };

  // Fetch data source name for breadcrumbs when on edit, entities, data, or details page
  useEffect(() => {
    const fetchDataSourceName = async () => {
      if (params.dataSourceId && location.pathname.includes('/data-sources/') && 
          (location.pathname.includes('/edit') || location.pathname.includes('/entities') || location.pathname.includes('/data') || location.pathname === `/data-sources/${params.dataSourceId}`)) {
        try {
          // Import the API here to avoid circular dependencies
          const { toolboxEngineAPI } = await import("../common/toolbox-engine.api");
          const response = await toolboxEngineAPI.get(`/api/data_sources/${params.dataSourceId}`);
          setDataSourceName(response.data.name || `ID: ${params.dataSourceId}`);
        } catch (error) {
          console.error("Error fetching data source name:", error);
          setDataSourceName(`ID: ${params.dataSourceId}`);
        }
      }
    };

    fetchDataSourceName();
  }, [params.dataSourceId, location.pathname]);

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = () => {
    const breadcrumbs: Array<{ label: string; path?: string }> = [];
    const pathSegments = location.pathname.split("/").filter(segment => segment !== "");
    
    if (pathSegments.length === 0 || pathSegments[0] === "home") {
      breadcrumbs.push({ label: "Home" });
    } else if (pathSegments[0] === "data-sources") {
      if (pathSegments.length === 1) {
        // /data-sources
        breadcrumbs.push({ label: "Data Sources" });
      } else if (pathSegments.length === 2) {
        if (pathSegments[1] === "new") {
          // /data-sources/new
          breadcrumbs.push({ label: "Data Sources", path: "/data-sources" });
          breadcrumbs.push({ label: "New" });
        } else {
          // /data-sources/:id (details page)
          const dataSourceId = pathSegments[1];
          breadcrumbs.push({ label: "Data Sources", path: "/data-sources" });
          breadcrumbs.push({ label: dataSourceName || dataSourceId || "Loading...", path: `/data-sources/${dataSourceId}` });
        }
      } else if (pathSegments.length === 3) {
        const dataSourceId = pathSegments[1];
        const action = pathSegments[2];
        
        breadcrumbs.push({ label: "Data Sources", path: "/data-sources" });
        breadcrumbs.push({ label: dataSourceName || dataSourceId || "Loading...", path: `/data-sources/${dataSourceId}` });
        
        if (action === "edit") {
          // /data-sources/:id/edit
          breadcrumbs.push({ label: "Edit" });
        } else if (action === "entities") {
          // /data-sources/:id/entities
          breadcrumbs.push({ label: "Entities" });
        } else if (action === "data") {
          // /data-sources/:id/data
          breadcrumbs.push({ label: "Data" });
        }
      }
    } else if (pathSegments[0] === "entities") {
      breadcrumbs.push({ label: "Entities" });
    } else if (pathSegments[0] === "data") {
      breadcrumbs.push({ label: "Data" });
    } else if (pathSegments[0] === "scheduled-jobs") {
      breadcrumbs.push({ label: "Scheduled Jobs" });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="font-['Segoe_UI',sans-serif] border-b border-gray-200">
      {/* Main Navigation Bar */}
      <div className="px-4 py-3 flex items-center flex-nowrap gap-3">
        {/* Brand */}
        <div className="text-[24px] font-bold text-[#222] mr-6">
          Toolbox-Engine
        </div>

        {/* Tabs */}
        <ul className="flex m-0 p-0 list-none gap-0" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} role="presentation" className="m-0">
                <button
                  onClick={() => handleTabClick(tab.id)}
                  role="tab"
                  className={`cursor-pointer px-5 py-2 font-medium border border-gray-300 transition-colors duration-200 
                    ${isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-800 hover:bg-gray-100 hover:text-gray-500"} 
                    ${isActive ? "rounded-t-lg" : ""}`}
                >
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <button
          className="ml-auto px-3 py-2 text-sm bg-blue-600 text-white rounded-lg border-none hover:bg-blue-700 transition cursor-pointer"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-gray-400 mx-2">&gt;</span>
                )}
                {crumb.path ? (
                  <button
                    onClick={() => navigate(crumb.path!)}
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-700 font-medium">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;
