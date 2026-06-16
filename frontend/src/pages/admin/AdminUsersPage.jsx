import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import {
  Search, UserCheck, UserX, Shield, Trash2, RefreshCw,
  Clock, ChevronDown, AlertCircle, User, CheckCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  active:   { label: 'Active',   bg: 'bg-echo-500/10',   border: 'border-echo-500/25',   text: 'text-echo-400',   dot: 'bg-echo-400' },
  inactive: { label: 'Inactive', bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-400',    dot: 'bg-red-500' },
};

const ROLE_CONFIG = {
  admin: { label: 'Admin', bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400' },
  user:  { label: 'User',  bg: 'bg-carbon-800',    border: 'border-carbon-700',    text: 'text-carbon-400' },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.border} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const c = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${c.bg} ${c.border} ${c.text}`}>
      {role === 'admin' && <Shield className="w-2.5 h-2.5" />}
      {c.label}
    </span>
  );
}

function ConfirmModal({ message, onConfirm, onCancel, danger = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm p-6 rounded-2xl border border-carbon-700 shadow-2xl"
        style={{ background: '#13151f' }}>
        <p className="text-white text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white border border-carbon-700 hover:border-carbon-600 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-echo-600 hover:bg-echo-500'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState(searchParams.get('filter') || 'all');
  const [confirm, setConfirm] = useState(null); // { message, onConfirm, danger }
  const [busy,    setBusy]    = useState(''); // user_id being updated

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const ask = (message, onConfirm, danger = false) =>
    setConfirm({ message, onConfirm, danger });

  const act = async (fn, userId) => {
    setConfirm(null);
    setBusy(userId);
    try { await fn(); await load(); }
    catch (e) { setError(e.response?.data?.detail || 'Action failed'); }
    finally { setBusy(''); }
  };

  const approve = (u) =>
    ask(`Approve ${u.email} and grant platform access?`, () =>
      act(() => api.patch(`/admin/users/${u.id}/status`, { status: 'active' }), u.id));

  const deactivate = (u) =>
    ask(`Deactivate ${u.email}? They will no longer be able to log in.`, () =>
      act(() => api.patch(`/admin/users/${u.id}/status`, { status: 'inactive' }), u.id), true);

  const activate = (u) =>
    ask(`Re-activate ${u.email}?`, () =>
      act(() => api.patch(`/admin/users/${u.id}/status`, { status: 'active' }), u.id));

  const makeAdmin = (u) =>
    ask(`Promote ${u.email} to Admin? They will have full admin panel access.`, () =>
      act(() => api.patch(`/admin/users/${u.id}/role`, { role: 'admin' }), u.id));

  const removeAdmin = (u) =>
    ask(`Remove admin role from ${u.email}?`, () =>
      act(() => api.patch(`/admin/users/${u.id}/role`, { role: 'user' }), u.id), true);

  const deleteUser = (u) =>
    ask(`Permanently delete ${u.email}? This cannot be undone.`, () =>
      act(() => api.delete(`/admin/users/${u.id}`), u.id), true);

  const filtered = users.filter(u => {
    const matchStatus = filter === 'all' || u.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.email.toLowerCase().includes(q) ||
      u.company_name.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all:      users.length,
    pending:  users.filter(u => u.status === 'pending').length,
    active:   users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-8">
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-sm text-carbon-500 mt-1">{users.length} total accounts</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-carbon-400 hover:text-white border border-carbon-700 hover:border-carbon-600 transition-all duration-200 disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-5 rounded-xl border border-red-500/25 bg-red-500/8 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-carbon-800 flex-wrap" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {Object.entries({ all: 'All', pending: 'Pending', active: 'Active', inactive: 'Inactive' }).map(([key, lbl]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                filter === key
                  ? 'text-white bg-carbon-800 border border-carbon-700'
                  : 'text-carbon-500 hover:text-carbon-200'
              }`}>
              {lbl}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                filter === key ? 'bg-carbon-700 text-carbon-200' : 'bg-carbon-800/60 text-carbon-600'
              }`}>{counts[key]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email, company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-carbon-600 bg-carbon-900 border border-carbon-700 hover:border-carbon-600 focus:border-echo-500/60 focus:outline-none focus:ring-2 focus:ring-echo-500/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-carbon-800 overflow-hidden" style={{ background: '#13151f' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-carbon-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-carbon-600">
            <User className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No users match your filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-carbon-800">
                  {['User', 'Company', 'Status', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-carbon-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const isBusy = busy === u.id;
                  return (
                    <tr key={u.id}
                      className={`border-b border-carbon-800/60 transition-colors duration-150 hover:bg-carbon-800/20 ${isBusy ? 'opacity-50' : ''}`}>

                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{ background: 'rgba(20,209,94,0.1)', border: '1px solid rgba(20,209,94,0.2)', color: '#14d15e' }}>
                            {u.email[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white font-medium text-sm truncate max-w-[180px]">{u.full_name || '—'}</div>
                            <div className="text-carbon-500 text-xs truncate max-w-[180px]">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-5 py-4 text-carbon-400 text-xs max-w-[160px] truncate">
                        {u.company_name || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4"><StatusBadge status={u.status} /></td>

                      {/* Role */}
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-carbon-500 text-xs whitespace-nowrap">
                        {fmtDate(u.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {u.status === 'pending' && (
                            <button onClick={() => approve(u)} disabled={isBusy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-echo-400 border border-echo-500/25 hover:bg-echo-500/10 transition-colors disabled:opacity-50">
                              <UserCheck className="w-3 h-3" /> Approve
                            </button>
                          )}
                          {u.status === 'active' && (
                            <button onClick={() => deactivate(u)} disabled={isBusy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 transition-colors disabled:opacity-50">
                              <UserX className="w-3 h-3" /> Deactivate
                            </button>
                          )}
                          {u.status === 'inactive' && (
                            <button onClick={() => activate(u)} disabled={isBusy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-echo-400 border border-echo-500/25 hover:bg-echo-500/10 transition-colors disabled:opacity-50">
                              <CheckCircle className="w-3 h-3" /> Activate
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button onClick={() => makeAdmin(u)} disabled={isBusy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-400 border border-purple-500/25 hover:bg-purple-500/10 transition-colors disabled:opacity-50">
                              <Shield className="w-3 h-3" /> Make Admin
                            </button>
                          )}
                          {u.role === 'admin' && (
                            <button onClick={() => removeAdmin(u)} disabled={isBusy}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-carbon-400 border border-carbon-700 hover:bg-carbon-800 transition-colors disabled:opacity-50">
                              <Shield className="w-3 h-3" /> Demote
                            </button>
                          )}
                          <button onClick={() => deleteUser(u)} disabled={isBusy}
                            className="p-1.5 rounded-lg text-carbon-600 border border-carbon-800 hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/8 transition-colors disabled:opacity-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-carbon-700 mt-4">
        Showing {filtered.length} of {users.length} users
      </p>
    </div>
  );
}
