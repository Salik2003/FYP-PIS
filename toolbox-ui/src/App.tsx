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

// Pages each role can access (ADMIN gets everything)
const ROLE_PAGES: Record<string, string[]> = {
    ADMIN:      ['/', '/pis', '/compliance', '/conflicts', '/finance', '/margins', '/admin'],
    SALES:      ['/', '/pis', '/conflicts', '/finance', '/margins'],
    PRODUCTION: ['/', '/pis', '/compliance'],
    COMPLIANCE: ['/', '/compliance', '/conflicts'],
    'R&D':      ['/', '/pis', '/margins'],
    USER:       ['/'],
};

function getAllowed(role: string): string[] {
    return ROLE_PAGES[role] ?? ['/'];
}

const ProtectedRoute = ({ children, path }: { children: React.ReactElement; path: string }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    const allowed = getAllowed(user?.role ?? 'USER');
    if (!allowed.includes(path)) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                    <ProtectedRoute path="/">
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<EngineDashboard />} />
                    <Route path="pis" element={
                        <ProtectedRoute path="/pis"><ProductList /></ProtectedRoute>
                    } />
                    <Route path="compliance" element={
                        <ProtectedRoute path="/compliance"><CompliancePage /></ProtectedRoute>
                    } />
                    <Route path="conflicts" element={
                        <ProtectedRoute path="/conflicts"><ConflictPage /></ProtectedRoute>
                    } />
                    <Route path="finance" element={
                        <ProtectedRoute path="/finance"><FinancePage /></ProtectedRoute>
                    } />
                    <Route path="margins" element={
                        <ProtectedRoute path="/margins"><MarginPage /></ProtectedRoute>
                    } />
                    <Route path="admin" element={
                        <ProtectedRoute path="/admin"><AdminDashboard /></ProtectedRoute>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
