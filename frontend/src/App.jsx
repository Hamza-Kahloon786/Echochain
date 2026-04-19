import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/SuppliersPage';
import WarehousesPage from './pages/WarehousesPage';
import TransportPage from './pages/TransportPage';
import ForecastingPage from './pages/ForecastingPage';
import RecommendationsPage from './pages/RecommendationsPage';
import LiveGridPage from './pages/LiveGridPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HotspotMapPage from './pages/HotspotMapPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="forecasting" element={<ForecastingPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="live-grid" element={<LiveGridPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="hotspot-map" element={<HotspotMapPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#272733', color: '#e4e4ec', border: '1px solid #3d3d4f' },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
