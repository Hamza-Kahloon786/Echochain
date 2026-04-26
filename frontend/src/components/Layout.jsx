import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Factory, Warehouse, Truck, TrendingUp,
  Lightbulb, LogOut, Leaf, Menu, X, Zap, Brain, MapPin
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/app',                  icon: LayoutDashboard, label: 'Dashboard',      end: true },
  { path: '/app/suppliers',        icon: Factory,         label: 'Suppliers' },
  { path: '/app/warehouses',       icon: Warehouse,       label: 'Warehouses' },
  { path: '/app/transport',        icon: Truck,           label: 'Transport' },
  { path: '/app/hotspot-map',      icon: MapPin,          label: 'Hotspot Map' },
  { path: '/app/forecasting',      icon: TrendingUp,      label: 'Forecasting' },
  { path: '/app/recommendations',  icon: Lightbulb,       label: 'Recommendations' },
  { path: '/app/live-grid',        icon: Zap,             label: 'Live UK Grid' },
  { path: '/app/ai-assistant',     icon: Brain,           label: 'AI Assistant' },
];

export default function Layout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-carbon-950 border-r border-carbon-800
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-carbon-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">EchoChain</h1>
            <p className="text-[10px] text-carbon-500 uppercase tracking-widest">Carbon Identifier</p>
          </div>
          <button className="lg:hidden ml-auto text-carbon-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end ?? false}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-echo-600/15 text-echo-400 border border-echo-600/20'
                    : 'text-carbon-400 hover:text-carbon-100 hover:bg-carbon-800/60'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-carbon-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-carbon-500 hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-carbon-800 flex items-center px-4 lg:px-8 bg-carbon-950/50 backdrop-blur-sm shrink-0">
          <button className="lg:hidden mr-3 text-carbon-400" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs text-carbon-500">
            <span className="w-2 h-2 rounded-full bg-echo-500 animate-pulse" />
            UK DEFRA 2024 Factors Active
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
