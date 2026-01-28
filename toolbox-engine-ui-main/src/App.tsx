import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import DataSourcesPage from "./components/DataSourcesPage";
import DataSourceEditPage from "./components/DataSources/DataSourceEditPage";
import DataSourceNewPage from "./components/DataSources/DataSourceNewPage";
import DataSourceEntitiesPage from "./components/DataSources/DataSourceEntitiesPage";
import DataSourceDataPage from "./components/DataSources/DataSourceDataPage";
import DataSourceDetailsPage from "./components/DataSources/DataSourceDetailsPage";
import EntitiesPage from "./components/EntitiesPage";
import DataPage from "./components/DataPage";
import ScheduledJobsPage from "./components/ScheduledJobsPage";
import ProtectedRoute from "./components/ProtectedRoute ";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sources"
          element={
            <ProtectedRoute>
              <DataSourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sources/new"
          element={
            <ProtectedRoute>
              <DataSourceNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sources/:dataSourceId/edit"
          element={
            <ProtectedRoute>
              <DataSourceEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sources/:dataSourceId/entities"
          element={
            <ProtectedRoute>
              <DataSourceEntitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sources/:dataSourceId/data"
          element={
            <ProtectedRoute>
              <DataSourceDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sources/:dataSourceId"
          element={
            <ProtectedRoute>
              <DataSourceDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entities"
          element={
            <ProtectedRoute>
              <EntitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute>
              <DataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scheduled-jobs"
          element={
            <ProtectedRoute>
              <ScheduledJobsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
