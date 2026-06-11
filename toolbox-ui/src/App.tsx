import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import EngineDashboard from './pages/EngineDashboard';
import ProductList from './pages/ProductList';
import AdminDashboard from './pages/AdminDashboard';
import CompliancePage from './pages/CompliancePage';
import ConflictPage from './pages/ConflictPage';
import FinancePage from './pages/FinancePage';
import MarginPage from './pages/MarginPage';
import { useAuth } from './context/AuthProvider';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<EngineDashboard />} />
          <Route path="pis" element={<ProductList />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="conflicts" element={<ConflictPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="margins" element={<MarginPage />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
