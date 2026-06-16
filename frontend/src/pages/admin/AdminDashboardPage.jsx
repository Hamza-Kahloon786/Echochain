import { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
  Users, UserCheck, Clock, UserX, Shield,
  RefreshCw, TrendingUp, AlertCircle,
} from 'lucide-react';

function StatCard({ Icon, label, value, color, sub }) {
  const colors = {
    green:  { bg: 'bg-echo-500/10',   border: 'border-echo-500/20',   icon: 'text-echo-400',   val: 'text-echo-300' },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: 'text-amber-400',  val: 'text-amber-300' },
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: 'text-blue-400',   val: 'text-blue-300' },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400',    val: 'text-red-300' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', val: 'text-purple-300' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`p-6 rounded-2xl border ${c.border} ${c.bg} flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} border ${c.border}`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div>
        <div className={`text-3xl font-black ${c.val}`}>{value ?? '—'}</div>
        <div className="text-sm font-semibold text-white mt-0.5">{label}</div>
        {sub && <div className="text-xs text-carbon-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-sm text-carbon-500 mt-1">Platform overview and user statistics</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-carbon-400 hover:text-white border border-carbon-700 hover:border-carbon-600 transition-all duration-200 disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl border border-red-500/25 bg-red-500/8 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        <StatCard Icon={Users}     label="Total Users"    value={stats?.total_users}    color="blue"   sub="All registered accounts" />
        <StatCard Icon={UserCheck} label="Active Users"   value={stats?.active_users}   color="green"  sub="Can log in and use platform" />
        <StatCard Icon={Clock}     label="Pending Approval" value={stats?.pending_users}  color="amber"  sub="Awaiting your review" />
        <StatCard Icon={UserX}     label="Inactive Users" value={stats?.inactive_users} color="red"    sub="Deactivated accounts" />
        <StatCard Icon={Shield}    label="Admin Users"    value={stats?.admin_users}    color="purple" sub="Full admin access" />
        <StatCard Icon={TrendingUp} label="Approval Rate" color="green"
          value={stats && stats.total_users > 0
            ? `${Math.round(((stats.active_users + stats.inactive_users) / stats.total_users) * 100)}%`
            : '—'}
          sub="Accounts reviewed" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Pending Approvals</h3>
          </div>
          <p className="text-carbon-400 text-sm mb-4">
            {stats?.pending_users
              ? `${stats.pending_users} account${stats.pending_users !== 1 ? 's' : ''} waiting for approval.`
              : 'No pending accounts.'}
          </p>
          <a href="/admin/users?filter=pending"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-amber-300 border border-amber-500/25 hover:bg-amber-500/10 transition-colors">
            Review Pending <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="p-6 rounded-2xl border border-carbon-800 bg-carbon-900/40">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-carbon-400" />
            <h3 className="font-bold text-white">User Management</h3>
          </div>
          <p className="text-carbon-400 text-sm mb-4">
            Approve, deactivate, promote, or delete any user account from the users page.
          </p>
          <a href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-carbon-300 border border-carbon-700 hover:bg-carbon-800 transition-colors">
            Manage Users <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
