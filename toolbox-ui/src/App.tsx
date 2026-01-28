import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import EngineDashboard from './pages/EngineDashboard';
import ProductList from './pages/ProductList';
import AdminDashboard from './pages/AdminDashboard';

// Mock Auth Check (Replace with Context later)
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  if (!isAuthenticated()) {
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
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
