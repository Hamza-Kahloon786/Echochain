import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader } from '../components/SharedComponents';
import { Zap, Wind, Sun, Flame, RefreshCw, MapPin } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const indexColors = {
  'very low': '#14d15e',
  'low': '#7cf8ab',
  'moderate': '#f59e0b',
  'high': '#ef4444',
  'very high': '#991b1b',
};

const FUEL_COLORS = {
  biomass: '#8b5cf6', coal: '#374151', imports: '#6366f1', gas: '#ef4444',
  nuclear: '#3b82f6', other: '#9ca3af', hydro: '#06b6d4', solar: '#f59e0b',
  wind: '#14d15e',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-carbon-400 mb-1">{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-medium">{p.name || p.payload?.fuel}: {p.value}%</p>
      ))}
    </div>
  );
};

export default function LiveGridPage() {
  const [intensity, setIntensity] = useState(null);
  const [genMix, setGenMix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [intRes, mixRes] = await Promise.all([
        api.get('/live/carbon-intensity/current'),
        api.get('/live/carbon-intensity/generation-mix'),
      ]);
      setIntensity(intRes.data);
      setGenMix(mixRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) return <PageLoader />;

  const idx = intensity?.index || 'moderate';
  const idxColor = indexColors[idx] || indexColors.moderate;
  const currentVal = intensity?.actual || intensity?.forecast || 0;

  const mixData = (genMix?.generation_mix || [])
    .filter(m => m.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const renewablePct = mixData
    .filter(m => ['wind', 'solar', 'hydro'].includes(m.fuel))
    .reduce((sum, m) => sum + m.percentage, 0);

  const lowCarbonPct = mixData
    .filter(m => ['wind', 'solar', 'hydro', 'nuclear', 'biomass'].includes(m.fuel))
    .reduce((sum, m) => sum + m.percentage, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live UK Grid</h1>
          <p className="text-sm text-carbon-500 mt-1">Real-time data from National Grid Carbon Intensity API</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Live intensity hero */}
      <div className="card bg-gradient-to-br from-carbon-900 to-carbon-950 border-carbon-700">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            <p className="text-xs text-carbon-500 uppercase tracking-wider mb-2">Current Carbon Intensity</p>
            <div className="text-6xl font-bold" style={{ color: idxColor }}>
              {currentVal}
            </div>
            <p className="text-sm text-carbon-400 mt-1">gCO₂/kWh</p>
            <span
              className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ background: idxColor + '20', color: idxColor, border: `1px solid ${idxColor}40` }}
            >
              {idx}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="text-center">
              <Wind className="w-5 h-5 text-echo-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{renewablePct.toFixed(1)}%</p>
              <p className="text-[10px] text-carbon-500">Renewable</p>
            </div>
            <div className="text-center">
              <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{lowCarbonPct.toFixed(1)}%</p>
              <p className="text-[10px] text-carbon-500">Low Carbon</p>
            </div>
            <div className="text-center">
              <Flame className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{(100 - lowCarbonPct).toFixed(1)}%</p>
              <p className="text-[10px] text-carbon-500">Fossil Fuel</p>
            </div>
            <div className="text-center">
              <Sun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">
                {(mixData.find(m => m.fuel === 'solar')?.percentage || 0).toFixed(1)}%
              </p>
              <p className="text-[10px] text-carbon-500">Solar</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-carbon-600 mt-4 text-center">
          Source: National Grid ESO Carbon Intensity API · Updated every 30 min · CC BY 4.0
        </p>
      </div>

      {/* Generation mix chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-carbon-400 mb-4">Generation Mix (Current)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mixData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#8b8ba5', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
              <YAxis dataKey="fuel" type="category" tick={{ fill: '#8b8ba5', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentage" name="%" radius={[0, 6, 6, 0]}>
                {mixData.map((entry, i) => (
                  <Cell key={i} fill={FUEL_COLORS[entry.fuel] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-carbon-400 mb-4">Energy Source Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={mixData}
                dataKey="percentage"
                nameKey="fuel"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                strokeWidth={0}
              >
                {mixData.map((entry, i) => (
                  <Cell key={i} fill={FUEL_COLORS[entry.fuel] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {mixData.slice(0, 6).map((m, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px] text-carbon-400">
                <span className="w-2 h-2 rounded-full" style={{ background: FUEL_COLORS[m.fuel] || '#6b7280' }} />
                {m.fuel} ({m.percentage}%)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* What this means for your Scope 2 */}
      <div className="card bg-gradient-to-r from-echo-600/10 to-echo-500/5 border-echo-600/20">
        <h3 className="text-sm font-semibold text-echo-400 mb-2">What This Means for Your Scope 2</h3>
        <p className="text-sm text-carbon-300">
          Right now the UK grid is emitting <strong className="text-white">{currentVal} gCO₂/kWh</strong>.
          The DEFRA 2024 annual average is <strong className="text-white">207 gCO₂/kWh</strong>.
          {currentVal < 207
            ? ` The grid is currently ${Math.round((1 - currentVal/207) * 100)}% cleaner than average — a good time for high-energy operations.`
            : ` The grid is currently ${Math.round((currentVal/207 - 1) * 100)}% dirtier than average — consider scheduling energy-intensive tasks for off-peak hours.`
          }
        </p>
      </div>
    </div>
  );
}
