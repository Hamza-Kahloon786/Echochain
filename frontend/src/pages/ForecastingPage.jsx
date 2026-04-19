import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader, EmptyState } from '../components/SharedComponents';
import { TrendingUp, Brain, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-carbon-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {Number(p.value).toLocaleString()} kgCO₂e
        </p>
      ))}
    </div>
  );
};

export default function ForecastingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);

  const load = () => {
    setLoading(true);
    api.get(`/forecasting/predict?months_ahead=${months}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [months]);

  if (loading) return <PageLoader />;

  if (!data || (!data.historical?.length && !data.forecasts?.length)) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No forecast data"
        description="Add suppliers, warehouses, and transport routes first to generate emission forecasts."
      />
    );
  }

  // Combine historical + forecast data for chart
  const chartData = [
    ...(data.historical || []).map(h => ({
      month: h.month,
      historical: Math.round(h.emissions),
    })),
    ...(data.forecasts || []).map(f => ({
      month: f.month,
      predicted: Math.round(f.predicted_emissions),
      lower: Math.round(f.lower_bound),
      upper: Math.round(f.upper_bound),
    })),
  ];

  // Find where forecast starts
  const forecastStart = data.historical?.length > 0
    ? data.historical[data.historical.length - 1].month
    : null;

  const avgForecast = data.forecasts?.length
    ? Math.round(data.forecasts.reduce((a, f) => a + f.predicted_emissions, 0) / data.forecasts.length)
    : 0;

  const trend = data.forecasts?.length > 1
    ? data.forecasts[data.forecasts.length - 1].predicted_emissions - data.forecasts[0].predicted_emissions
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Emissions Forecasting</h1>
        <p className="text-sm text-carbon-500 mt-1">AI-powered predictions using RandomForest Regression</p>
      </div>

      {/* Controls & model info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-carbon-500">Model</p>
            <p className="text-sm font-semibold text-white">{data.model_used}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${trend > 0 ? 'bg-red-500/10' : 'bg-echo-500/10'}`}>
            <TrendingUp className={`w-5 h-5 ${trend > 0 ? 'text-red-400' : 'text-echo-400'}`} />
          </div>
          <div>
            <p className="text-xs text-carbon-500">Avg Monthly Forecast</p>
            <p className="text-sm font-semibold text-white">{avgForecast.toLocaleString()} kgCO₂e</p>
          </div>
        </div>
        <div className="card">
          <label className="label">Forecast Horizon</label>
          <select
            className="select-field"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
          >
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
            <option value={18}>18 months</option>
            <option value={24}>24 months</option>
          </select>
        </div>
      </div>

      {/* Main chart */}
      <div className="card">
        <h3 className="text-sm font-medium text-carbon-400 mb-4">Historical & Forecasted Emissions</h3>
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14d15e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#14d15e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14d15e" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#14d15e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#272733" />
            <XAxis dataKey="month" tick={{ fill: '#8b8ba5', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#8b8ba5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {forecastStart && <ReferenceLine x={forecastStart} stroke="#575772" strokeDasharray="6 3" label={{ value: 'Forecast →', fill: '#8b8ba5', fontSize: 10, position: 'top' }} />}
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#gradBand)" name="Upper Bound" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" name="Lower Bound" />
            <Area type="monotone" dataKey="historical" stroke="#3b82f6" fill="url(#gradHist)" strokeWidth={2} name="Historical" dot={false} />
            <Area type="monotone" dataKey="predicted" stroke="#14d15e" fill="url(#gradPred)" strokeWidth={2} strokeDasharray="6 3" name="Predicted" dot={false} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-carbon-800">
          <span className="flex items-center gap-2 text-xs text-carbon-400">
            <span className="w-8 h-0.5 bg-blue-500 rounded" /> Historical
          </span>
          <span className="flex items-center gap-2 text-xs text-carbon-400">
            <span className="w-8 h-0.5 bg-echo-500 rounded border-dashed" style={{ borderTop: '2px dashed #14d15e', height: 0, width: 32 }} /> Predicted
          </span>
          <span className="flex items-center gap-2 text-xs text-carbon-400">
            <span className="w-4 h-3 bg-echo-500/10 rounded" /> Confidence Band
          </span>
        </div>
      </div>

      {/* RMSE info */}
      {data.rmse && (
        <div className="card flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <p className="text-sm text-carbon-400">
            Model RMSE: <span className="text-white font-mono">{data.rmse}</span> kgCO₂e — lower values indicate better model fit.
            {data.rmse < 500 ? ' Model accuracy is good.' : ' Consider adding more data for improved accuracy.'}
          </p>
        </div>
      )}
    </div>
  );
}
