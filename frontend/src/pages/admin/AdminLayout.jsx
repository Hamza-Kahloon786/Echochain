import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Leaf, LayoutDashboard, Users, Settings, LogOut,
  ChevronRight, Shield,
} from 'lucide-react';

const NAV = [
  { to: '/admin',          label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/users',    label: 'Users',     Icon: Users },
  { to: '/admin/settings', label: 'Settings',  Icon: Settings },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0f1117', color: '#e4e4ec' }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-carbon-800"
        style={{ background: '#13151f' }}>

        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-carbon-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">ChainscopeAI</div>
            <div className="flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-echo-400" />
              <span className="text-[10px] font-semibold text-echo-400 uppercase tracking-widest">Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-echo-400 bg-echo-500/10 border border-echo-500/20'
                    : 'text-carbon-400 hover:text-white hover:bg-carbon-800/60'
                }`
              }>
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-echo-400' : 'text-carbon-500 group-hover:text-carbon-300'}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-echo-500/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — user info + logout */}
        <div className="p-3 border-t border-carbon-800 space-y-2">
          <button onClick={() => navigate('/app')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-carbon-500 hover:text-white hover:bg-carbon-800/60 transition-all duration-200">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Go to Platform
          </button>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-carbon-800/40">
            <div className="w-7 h-7 rounded-lg bg-echo-500/20 border border-echo-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-echo-400">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.email || 'Admin'}</div>
              <div className="text-[10px] text-carbon-500">Administrator</div>
            </div>
            <button onClick={handleLogout} title="Sign out"
              className="text-carbon-600 hover:text-red-400 transition-colors flex-shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
