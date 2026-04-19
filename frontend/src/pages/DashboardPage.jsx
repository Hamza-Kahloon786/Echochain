import { useState, useEffect } from 'react';
import api from '../utils/api';
import { StatCard, PageLoader, ScopeBar } from '../components/SharedComponents';
import { Activity, Factory, Warehouse, Truck, Flame, Zap, Link2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

const COLORS = ['#14d15e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-carbon-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-medium">
          {p.name}: {Number(p.value).toLocaleString()} kgCO₂e
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveGrid, setLiveGrid] = useState(null);

  useEffect(() => {
    api.get('/dashboard/').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/live/carbon-intensity/current').then(res => setLiveGrid(res.data)).catch(() => {});
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <p className="text-carbon-500">Failed to load dashboard</p>;

  const trendData = (data.monthly_trend || []).map(d => ({
    month: d.month?.substring(5) || '',
    emissions: Math.round(d.emissions),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-carbon-500 mt-1">Overview of your supply chain carbon footprint</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Emissions" value={Math.round(data.total_emissions)} unit="kgCO₂e" color="echo" />
        <StatCard icon={Flame} label="Scope 1 (Direct)" value={Math.round(data.scope1)} unit="kgCO₂e" color="amber" />
        <StatCard icon={Zap} label="Scope 2 (Energy)" value={Math.round(data.scope2)} unit="kgCO₂e" color="blue" />
        <StatCard icon={Link2} label="Scope 3 (Supply)" value={Math.round(data.scope3)} unit="kgCO₂e" color="purple" />
      </div>

      {/* Live Grid Intensity Banner */}
      {liveGrid?.success && (
        <div className="card flex items-center gap-4 bg-gradient-to-r from-carbon-900 to-carbon-950">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            liveGrid.index === 'very low' || liveGrid.index === 'low' ? 'bg-echo-500' :
            liveGrid.index === 'moderate' ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <div className="flex-1">
            <p className="text-xs text-carbon-500">Live UK Grid Carbon Intensity</p>
            <p className="text-lg font-bold text-white">
              {liveGrid.actual || liveGrid.forecast} <span className="text-xs font-normal text-carbon-400">gCO₂/kWh</span>
              <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                liveGrid.index === 'very low' || liveGrid.index === 'low' ? 'bg-echo-500/15 text-echo-400' :
                liveGrid.index === 'moderate' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
              }`}>{liveGrid.index}</span>
            </p>
          </div>
          <p className="text-[10px] text-carbon-600">National Grid API · Real-time</p>
        </div>
      )}

      {/* Scope breakdown bar */}
      <div className="card">
        <h3 className="text-sm font-medium text-carbon-400 mb-4">Emissions Breakdown by Scope</h3>
        <ScopeBar scope1={data.scope1} scope2={data.scope2} scope3={data.scope3} total={data.total_emissions} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly trend */}
        <div className="card">
          <h3 className="text-sm font-medium text-carbon-400 mb-4">Monthly Emissions Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradEcho" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14d15e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#14d15e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#272733" />
              <XAxis dataKey="month" tick={{ fill: '#8b8ba5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b8ba5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="emissions" stroke="#14d15e" fill="url(#gradEcho)" strokeWidth={2} name="Emissions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card">
          <h3 className="text-sm font-medium text-carbon-400 mb-4">Emissions by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.emissions_by_category?.filter(c => c.value > 0) || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                strokeWidth={0}
              >
                {(data.emissions_by_category || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {(data.emissions_by_category || []).map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-carbon-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hotspots */}
      <div className="card">
        <h3 className="text-sm font-medium text-carbon-400 mb-4">Top Carbon Hotspots</h3>
        {data.top_hotspots?.length > 0 ? (
          <div className="space-y-3">
            {data.top_hotspots.map((h, i) => {
              const pct = data.total_emissions ? (h.emissions / data.total_emissions * 100) : 0;
              const typeIcon = h.type === 'Supplier' ? Factory : h.type === 'Warehouse' ? Warehouse : Truck;
              const Icon = typeIcon;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-carbon-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-carbon-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white truncate">{h.name}</span>
                      <span className="text-xs text-carbon-400 ml-2">{Math.round(h.emissions).toLocaleString()} kgCO₂e</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-carbon-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-echo-500 to-echo-600 transition-all duration-700"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-carbon-500 w-12 text-right">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-carbon-500 text-sm">No data yet. Add suppliers, warehouses, and transport routes.</p>
        )}
      </div>

      {/* Entity counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card flex items-center gap-3">
          <Factory className="w-5 h-5 text-echo-400" />
          <div>
            <p className="text-2xl font-bold text-white">{data.supplier_count}</p>
            <p className="text-xs text-carbon-500">Suppliers</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <Warehouse className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-2xl font-bold text-white">{data.warehouse_count}</p>
            <p className="text-xs text-carbon-500">Warehouses</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <Truck className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-2xl font-bold text-white">{data.transport_route_count}</p>
            <p className="text-xs text-carbon-500">Routes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
