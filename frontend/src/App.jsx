import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SuppliersPage from './pages/SuppliersPage';
import WarehousesPage from './pages/WarehousesPage';
import TransportPage from './pages/TransportPage';
import ForecastingPage from './pages/ForecastingPage';
import RecommendationsPage from './pages/RecommendationsPage';
import LiveGridPage from './pages/LiveGridPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HotspotMapPage from './pages/HotspotMapPage';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Hold rendering until the stored token has been validated against the API.
  // Without this, a stale token makes the app flash the dashboard then redirect to /login.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <p className="text-carbon-500 text-sm">Loading EchoChain…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public landing page — redirects into the app when already logged in */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />} />

      {/* Auth */}
      <Route path="/login"   element={isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />} />
      <Route path="/signup"  element={isAuthenticated ? <Navigate to="/app" replace /> : <SignupPage />} />

      {/* Pricing — accessible logged-in or out */}
      <Route path="/pricing" element={<PricingPage />} />

      {/* Payment success — requires auth (token needed to call verify-session) */}
      <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />

      {/* Protected app — all dashboard routes live under /app/* */}
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="suppliers"       element={<SuppliersPage />} />
        <Route path="warehouses"      element={<WarehousesPage />} />
        <Route path="transport"       element={<TransportPage />} />
        <Route path="forecasting"     element={<ForecastingPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="live-grid"       element={<LiveGridPage />} />
        <Route path="ai-assistant"    element={<AIAssistantPage />} />
        <Route path="hotspot-map"     element={<HotspotMapPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/app' : '/'} replace />} />
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
