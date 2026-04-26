import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader, EmptyState } from '../components/SharedComponents';
import RouteOptimizationMap from '../components/RouteOptimizationMap';
import {
  Lightbulb, TrendingDown, Factory, Zap, Truck,
  FileText, Wrench, Map, ArrowRight,
} from 'lucide-react';

const categoryIcons = {
  'Supply Chain': Factory,
  'Energy':       Zap,
  'Transport':    Truck,
  'Reporting':    FileText,
  'Operations':   Wrench,
};

export default function RecommendationsPage() {
  const [data,      setData]      = useState(null);
  const [mapRoutes, setMapRoutes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('recs'); // 'recs' | 'map'

  useEffect(() => {
    Promise.all([
      api.get('/recommendations/'),
      api.get('/maps/data', { timeout: 30000 }),
    ])
      .then(([recRes, mapRes]) => {
        setData(recRes.data);
        setMapRoutes(mapRes.data?.routes || []);
      })
      .catch(async () => {
        try {
          const recRes = await api.get('/recommendations/');
          setData(recRes.data);
        } catch { /* no-op */ }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  if (!data || !data.recommendations?.length) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No recommendations yet"
        description="Add data to your supply chain to receive AI-powered reduction recommendations."
      />
    );
  }

  const transportRecs  = data.recommendations.filter(r => r.category === 'Transport');
  const hasTransport   = transportRecs.length > 0;
  const hasRoutes      = mapRoutes.length > 0;

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Recommendations</h1>
        <p className="text-sm text-carbon-500 mt-1">Actionable steps to reduce your carbon footprint</p>
      </div>

      {/* ── Summary banner ── */}
      <div className="card bg-gradient-to-r from-echo-600/10 to-echo-500/5 border-echo-600/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-echo-500/20 flex items-center justify-center">
            <TrendingDown className="w-7 h-7 text-echo-400" />
          </div>
          <div>
            <p className="text-sm text-carbon-400">Total Potential Reduction</p>
            <p className="text-3xl font-bold text-echo-400">
              {Math.round(data.total_potential_reduction).toLocaleString()}
              <span className="text-base font-normal text-carbon-500 ml-1">kgCO₂e</span>
            </p>
            <p className="text-xs text-carbon-500 mt-0.5">
              Up to {data.total_potential_reduction_pct}% reduction across {data.recommendations.length} actions
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab bar — always visible ── */}
      <div className="flex items-center gap-1 p-1 bg-carbon-900 border border-carbon-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('recs')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === 'recs'
              ? 'bg-carbon-700 text-white shadow'
              : 'text-carbon-500 hover:text-carbon-200'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Recommendations
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            tab === 'recs' ? 'bg-echo-500/20 text-echo-400' : 'bg-carbon-800 text-carbon-500'
          }`}>
            {data.recommendations.length}
          </span>
        </button>

        <button
          onClick={() => setTab('map')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === 'map'
              ? 'bg-carbon-700 text-white shadow'
              : 'text-carbon-500 hover:text-carbon-200'
          }`}
        >
          <Map className="w-4 h-4" />
          Route Map
          {hasTransport && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === 'map' ? 'bg-echo-500/20 text-echo-400' : 'bg-echo-500/15 text-echo-500'
            }`}>
              {hasRoutes ? mapRoutes.length : '!'}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════
          TAB: Recommendations
      ══════════════════════════════════════════ */}
      {tab === 'recs' && (
        <div className="space-y-3">
          {data.recommendations.map((rec) => {
            const Icon          = categoryIcons[rec.category] || Lightbulb;
            const priorityClass = rec.priority === 'High'
              ? 'badge-high'
              : rec.priority === 'Medium'
                ? 'badge-medium'
                : 'badge-low';
            const isTransport = rec.category === 'Transport';

            return (
              <div key={rec.id} className="card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-carbon-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-carbon-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{rec.title}</h3>
                        <span className={priorityClass}>{rec.priority}</span>
                        <span className="badge bg-carbon-800 text-carbon-400 border border-carbon-700">{rec.scope}</span>
                      </div>

                      {/* "View on Map" — only on Transport cards */}
                      {isTransport && (
                        <button
                          onClick={() => setTab('map')}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-echo-400 hover:text-echo-300 transition-colors px-2.5 py-1 rounded-lg border border-echo-500/30 hover:border-echo-500/60 bg-echo-500/8 hover:bg-echo-500/15 shrink-0"
                        >
                          <Map className="w-3 h-3" />
                          View on Map
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-carbon-400 leading-relaxed mb-3">{rec.description}</p>

                    <div className="flex items-center gap-6 text-xs">
                      {rec.potential_reduction_kgco2e > 0 && (
                        <div className="flex items-center gap-1.5 text-echo-400">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            -{Math.round(rec.potential_reduction_kgco2e).toLocaleString()} kgCO₂e
                          </span>
                          <span className="text-carbon-600">({rec.potential_reduction_pct}%)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-carbon-500">
                        <Wrench className="w-3 h-3" />
                        <span>Effort: {rec.effort}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: Route Map
      ══════════════════════════════════════════ */}
      {tab === 'map' && (
        <div className="space-y-4">

          {/* Context strip — what the map is showing */}
          <div className="rounded-xl border border-carbon-800 bg-carbon-900/50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-echo-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Map className="w-4 h-4 text-echo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-1">Route Optimization View</p>
                <p className="text-xs text-carbon-400 leading-relaxed">
                  <span className="inline-flex items-center gap-1 mr-2">
                    <span className="inline-block w-5 border-t-2 border-dashed border-red-400 align-middle" />
                    <span>Current high-emission route</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-5 border-t-2 border-echo-500 align-middle" />
                    <span>Suggested low-carbon alternative</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Transport recommendation pills */}
            {hasTransport && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-carbon-800">
                {transportRecs.map(r => (
                  <div key={r.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-carbon-700 bg-carbon-800/50 text-xs">
                    <Truck className="w-3 h-3 text-echo-400 shrink-0" />
                    <span className="text-carbon-300 font-medium">{r.title}</span>
                    {r.potential_reduction_kgco2e > 0 && (
                      <span className="text-echo-500 font-bold ml-1">
                        −{(r.potential_reduction_kgco2e / 1000).toFixed(1)}t CO₂e
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map or empty state */}
          {hasRoutes ? (
            <RouteOptimizationMap routes={mapRoutes} height={420} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 rounded-xl border border-dashed border-carbon-700 bg-carbon-900/30">
              <div className="w-14 h-14 rounded-2xl bg-carbon-800 flex items-center justify-center">
                <Truck className="w-7 h-7 text-carbon-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-carbon-400">No transport routes added yet</p>
                <p className="text-xs text-carbon-600 mt-1 max-w-xs">
                  Go to the Transport module and add your routes — they'll appear here as an interactive map.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/app/transport'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#14d15e,#09ad4a)' }}
              >
                <Truck className="w-4 h-4" /> Go to Transport
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
