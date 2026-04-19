import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { PageLoader } from '../components/SharedComponents';
import {
  Map, Factory, Warehouse, Truck, RefreshCw, AlertTriangle,
  TrendingUp, Activity, Route, X, ChevronRight,
  Sparkles, Loader2, TrendingDown, Zap, ShieldAlert,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MARKER_COLORS  = { supplier: '#f59e0b', warehouse: '#3b82f6', transport: '#14d15e' };
const MODE_COLORS    = {
  road_diesel: '#ef4444', road_petrol: '#f97316', road_electric: '#22c55e',
  rail: '#3b82f6', sea: '#06b6d4', air: '#a855f7',
};
const MODE_LABELS    = {
  road_diesel: 'Road (Diesel)', road_petrol: 'Road (Petrol)', road_electric: 'Road (EV)',
  rail: 'Rail', sea: 'Sea', air: 'Air',
};
const TYPE_ICONS     = { supplier: Factory, warehouse: Warehouse, transport: Truck };

// ── Custom SVG pin — no filter to avoid bounding-box halo artefacts ─────────
function pinSvg(color, size = 22) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.4)}" viewBox="0 0 32 45">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11.31 14.3 27.38 15.12 28.27a1.18 1.18 0 001.76 0C17.7 43.38 32 27.31 32 16 32 7.16 24.84 0 16 0z"
      fill="${color}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function infoHtml(m) {
  const color = MARKER_COLORS[m.type] || '#fff';
  const badge = m.type.charAt(0).toUpperCase() + m.type.slice(1);
  return `
    <div style="font-family:'DM Sans',system-ui,sans-serif;background:#16161e;color:#e4e4ec;
                padding:0;border-radius:14px;min-width:230px;overflow:hidden;border:1px solid #2d2d3d">
      <div style="background:${color}18;border-bottom:1px solid ${color}30;padding:12px 14px 10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="background:${color}25;color:${color};font-size:10px;font-weight:700;
                       padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.05em">
            ${badge}
          </span>
        </div>
        <h3 style="margin:6px 0 0;font-size:15px;font-weight:700;color:#fff">${m.name}</h3>
        ${m.location ? `<p style="margin:3px 0 0;font-size:11px;color:#8b8ba5">📍 ${m.location}</p>` : ''}
      </div>
      <div style="padding:10px 14px 12px">
        <p style="margin:0;font-size:11px;color:#8b8ba5;text-transform:uppercase;letter-spacing:.06em">Annual Emissions</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#fff;line-height:1">
          ${Math.round(m.emissions).toLocaleString()}
          <span style="font-size:11px;font-weight:400;color:#6d6d8a;margin-left:3px">kgCO₂e/yr</span>
        </p>
      </div>
    </div>`;
}

// ── Map dark style ──────────────────────────────────────────────────────────
const MAP_STYLES = [
  { elementType: 'geometry',            stylers: [{ color: '#12121a' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#12121a' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#5a5a7a' }] },
  { featureType: 'administrative',      elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3d' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9090b0' }] },
  { featureType: 'road',                elementType: 'geometry',        stylers: [{ color: '#1e1e2e' }] },
  { featureType: 'road',                elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3d' }] },
  { featureType: 'road.highway',        elementType: 'geometry',        stylers: [{ color: '#252535' }] },
  { featureType: 'road',                elementType: 'labels.text.fill',stylers: [{ color: '#4a4a6a' }] },
  { featureType: 'water',               elementType: 'geometry',        stylers: [{ color: '#0a3020' }] },
  { featureType: 'water',               elementType: 'labels.text.fill',stylers: [{ color: '#2d4a3a' }] },
  { featureType: 'poi',                 elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',             stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape',           elementType: 'geometry',        stylers: [{ color: '#12121a' }] },
];

export default function HotspotMapPage() {
  const [mapData,        setMapData]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [aiInsights,     setAiInsights]     = useState(null);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [activeTab,      setActiveTab]      = useState('hotspots');
  const [mapLoaded,      setMapLoaded]      = useState(false);
  const [filter,         setFilter]         = useState('all');

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);
  const polylinesRef   = useRef([]);
  const openWindowRef  = useRef(null);

  // ── Load Google Maps ──────────────────────────────────────────────────────
  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Add VITE_GOOGLE_MAPS_API_KEY to your frontend .env');
      setLoading(false);
      return;
    }
    window.__echoMapsReady = () => setMapLoaded(true);
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization&callback=__echoMapsReady`;
      s.async = true; s.defer = true;
      s.onerror = () => setError('Failed to load Google Maps');
      document.head.appendChild(s);
    }
  }, []);

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/maps/data', { timeout: 30000 })
      .then(res => setMapData(res.data))
      .catch(err => setError(err.response?.data?.detail || err.message || 'Failed to load map data'))
      .finally(() => setLoading(false));
  }, []);

  // ── Init map + markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 53.5, lng: -1.5 }, zoom: 6,
        styles: MAP_STYLES,
        mapTypeControl: false, streetViewControl: false,
        fullscreenControl: true, zoomControl: true,
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
      });
    }

    if (!mapData) return;

    const map    = mapInstanceRef.current;
    const bounds = new window.google.maps.LatLngBounds();

    markersRef.current.forEach(m => m.setMap(null));
    polylinesRef.current.forEach(p => p.setMap(null));
    markersRef.current  = [];
    polylinesRef.current = [];

    // ── Markers ──
    (mapData.markers || []).forEach(m => {
      const color  = MARKER_COLORS[m.type] || '#fff';
      const sz     = Math.max(18, Math.min(28, 18 + m.emissions / 15000));
      const marker = new window.google.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map,
        title: m.name,
        optimized: false,
        icon: {
          url: pinSvg(color, sz),
          scaledSize: new window.google.maps.Size(sz, Math.round(sz * 1.4)),
          anchor: new window.google.maps.Point(sz / 2, Math.round(sz * 1.4)),
        },
      });

      const iw = new window.google.maps.InfoWindow({ content: infoHtml(m), maxWidth: 280 });
      marker.addListener('click', () => {
        if (openWindowRef.current) openWindowRef.current.close();
        iw.open(map, marker);
        openWindowRef.current = iw;
        setSelectedMarker(m);
        setAiInsights(null);
        setAiLoading(false);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: m.lat, lng: m.lng });
    });

    // ── Routes ──
    (mapData.routes || []).forEach(r => {
      const col = MODE_COLORS[r.mode] || '#fff';
      const wt  = Math.max(2, Math.min(7, r.annual_emissions / 8000));
      const pl  = new window.google.maps.Polyline({
        path: [
          { lat: r.origin.lat,      lng: r.origin.lng },
          { lat: r.destination.lat, lng: r.destination.lng },
        ],
        geodesic: true,
        strokeColor:   col,
        strokeOpacity: 0,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.8, scale: 3, strokeColor: col },
          offset: '0', repeat: '18px',
        }],
        strokeWeight: wt,
      });
      pl.setMap(map);
      polylinesRef.current.push(pl);
      bounds.extend({ lat: r.origin.lat,      lng: r.origin.lng });
      bounds.extend({ lat: r.destination.lat, lng: r.destination.lng });
    });

    if (markersRef.current.length > 0) map.fitBounds(bounds, { padding: 60 });
  }, [mapLoaded, mapData]);

  // ── Filter markers visibility ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapData || !mapInstanceRef.current) return;
    markersRef.current.forEach((marker, i) => {
      const m   = mapData.markers[i];
      const vis = filter === 'all' || m?.type === filter;
      marker.setVisible(vis);
    });
  }, [filter, mapData]);

  const fetchInsights = (marker) => {
    setAiInsights(null);
    setAiLoading(true);
    api.get('/maps/hotspot-insights', {
      timeout: 60000,
      params: {
        entity_type: marker.type,
        entity_name: marker.name,
        emissions:   marker.emissions,
        location:    marker.location || '',
        industry:    marker.industry || '',
        refrigeration: marker.refrigeration || false,
      },
    })
      .then(res => setAiInsights(res.data))
      .catch(() => setAiInsights({ success: false, error: 'Failed to load AI insights' }))
      .finally(() => setAiLoading(false));
  };

  const refresh = () => {
    setLoading(true);
    api.get('/maps/data', { timeout: 30000 })
      .then(res => setMapData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const suppliers  = mapData?.markers?.filter(m => m.type === 'supplier')  || [];
  const warehouses = mapData?.markers?.filter(m => m.type === 'warehouse') || [];
  const routes     = mapData?.routes || [];
  const topEmitters = [...(mapData?.markers || [])]
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, 6);
  const totalEmissions = (mapData?.markers || []).reduce((s, m) => s + m.emissions, 0)
    + (mapData?.routes || []).reduce((s, r) => s + r.annual_emissions, 0);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-echo-400" />
            Carbon Hotspot Map
          </h1>
          <p className="text-sm text-carbon-500 mt-1">
            Real-time geographic view of emissions across your supply chain
          </p>
        </div>
        <button onClick={refresh}
          className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── KPI strip ── */}
      {mapData && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Emissions', value: `${(totalEmissions / 1000).toFixed(1)}t`, sub: 'kgCO₂e/yr', color: 'text-echo-400', bg: 'bg-echo-500/10 border-echo-500/20', Icon: Activity },
            { label: 'Suppliers',       value: suppliers.length,                          sub: 'on map',     color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',Icon: Factory },
            { label: 'Warehouses',      value: warehouses.length,                         sub: 'on map',     color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',  Icon: Warehouse },
            { label: 'Routes',          value: routes.length,                             sub: 'tracked',    color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20',Icon: Route },
          ].map(({ label, value, sub, color, bg, Icon }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-carbon-500 font-medium">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-carbon-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Map + side panel ── */}
      <div className="flex gap-4">

        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-carbon-800 relative" style={{ height: 580 }}>

          {/* Filter chips */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            {[['all','All'], ['supplier','Suppliers'], ['warehouse','Warehouses']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all ${
                  filter === val
                    ? 'bg-echo-500 text-white'
                    : 'bg-carbon-900/90 text-carbon-400 hover:text-white border border-carbon-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {GOOGLE_MAPS_API_KEY
            ? <div ref={mapRef} className="w-full h-full" />
            : (
              <div className="w-full h-full flex items-center justify-center bg-carbon-950">
                <div className="text-center p-8">
                  <Map className="w-12 h-12 text-carbon-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Google Maps Not Configured</h3>
                  <p className="text-sm text-carbon-500 max-w-sm">
                    Add <code className="text-echo-400">VITE_GOOGLE_MAPS_API_KEY</code> to your
                    frontend <code className="text-echo-400">.env</code> file.
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Side panel */}
        <div className="w-72 flex flex-col gap-3 shrink-0">

          {/* Tabs */}
          <div className="flex gap-1 bg-carbon-900 rounded-xl p-1 border border-carbon-800">
            {[['hotspots','Hotspots'], ['routes','Routes']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === id ? 'bg-carbon-700 text-white' : 'text-carbon-500 hover:text-carbon-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Selected marker + AI Insights panel ── */}
          {selectedMarker && (
            <div className="rounded-xl border overflow-hidden"
              style={{ borderColor: `${MARKER_COLORS[selectedMarker.type]}35` }}>

              {/* Header */}
              <div className="p-3 relative"
                style={{ background: `${MARKER_COLORS[selectedMarker.type]}12` }}>
                <button onClick={() => { setSelectedMarker(null); setAiInsights(null); }}
                  className="absolute top-2 right-2 text-carbon-600 hover:text-carbon-300">
                  <X className="w-3.5 h-3.5" />
                </button>
                {(() => { const Icon = TYPE_ICONS[selectedMarker.type] || Factory; return (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: MARKER_COLORS[selectedMarker.type] }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: MARKER_COLORS[selectedMarker.type] }}>
                      {selectedMarker.type}
                    </span>
                  </div>
                );})()}
                <p className="text-sm font-bold text-white leading-tight">{selectedMarker.name}</p>
                {selectedMarker.location && (
                  <p className="text-[10px] text-carbon-500 mt-0.5">📍 {selectedMarker.location}</p>
                )}
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <p className="text-[10px] text-carbon-600 uppercase tracking-wider">Annual Emissions</p>
                    <p className="text-lg font-black text-white">
                      {Math.round(selectedMarker.emissions).toLocaleString()}
                      <span className="text-[10px] font-normal text-carbon-500 ml-1">kgCO₂e/yr</span>
                    </p>
                  </div>
                  {aiInsights?.risk_level && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      aiInsights.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                      aiInsights.risk_level === 'high'     ? 'bg-orange-500/20 text-orange-400' :
                      aiInsights.risk_level === 'medium'   ? 'bg-yellow-500/20 text-yellow-400' :
                                                             'bg-green-500/20 text-green-400'
                    }`}>
                      {aiInsights.risk_level.toUpperCase()} RISK
                    </span>
                  )}
                </div>
              </div>

              {/* AI section */}
              <div className="p-3 border-t border-carbon-800 bg-carbon-900/40">
                {!aiInsights && !aiLoading && (
                  <button onClick={() => fetchInsights(selectedMarker)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg
                               bg-echo-500/15 border border-echo-500/30 text-echo-400
                               hover:bg-echo-500/25 transition-all text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Get AI Insights
                  </button>
                )}

                {aiLoading && (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs text-carbon-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-echo-400" />
                    Analysing with AI…
                  </div>
                )}

                {aiInsights?.success && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-carbon-400 leading-relaxed italic">
                      "{aiInsights.summary}"
                    </p>
                    <div className="space-y-1.5">
                      {(aiInsights.actions || []).map((action, i) => (
                        <div key={i} className="rounded-lg bg-carbon-800/60 border border-carbon-700/50 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-white">{action.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <TrendingDown className="w-2.5 h-2.5 text-echo-400" />
                              <span className="text-[10px] font-bold text-echo-400">-{action.saving_pct}%</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-carbon-500 leading-relaxed">{action.detail}</p>
                          <span className={`inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                            action.effort === 'Low'    ? 'bg-green-500/15 text-green-400' :
                            action.effort === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' :
                                                         'bg-red-500/15 text-red-400'
                          }`}>
                            {action.effort} effort
                          </span>
                        </div>
                      ))}
                    </div>
                    {aiInsights.uk_scheme && (
                      <div className="flex items-start gap-1.5 pt-1">
                        <Zap className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-400">{aiInsights.uk_scheme}</p>
                      </div>
                    )}
                    <button onClick={() => fetchInsights(selectedMarker)}
                      className="text-[10px] text-carbon-600 hover:text-carbon-400 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5" /> Regenerate
                    </button>
                  </div>
                )}

                {aiInsights && !aiInsights.success && (
                  <p className="text-[11px] text-red-400 text-center py-2">{aiInsights.error}</p>
                )}
              </div>
            </div>
          )}

          {/* Hotspots tab */}
          {activeTab === 'hotspots' && (
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1"
              style={{ maxHeight: selectedMarker ? 400 : 480 }}>
              <p className="text-xs text-carbon-500 font-medium px-1 mb-2">Top Emitters</p>
              {topEmitters.length === 0 && (
                <p className="text-xs text-carbon-600 text-center py-8">No data yet</p>
              )}
              {topEmitters.map((m, i) => {
                const color = MARKER_COLORS[m.type] || '#fff';
                const Icon  = TYPE_ICONS[m.type] || Factory;
                const pct   = totalEmissions > 0 ? (m.emissions / totalEmissions * 100) : 0;
                return (
                  <button key={i} onClick={() => { setSelectedMarker(m); setAiInsights(null); }}
                    className="w-full text-left rounded-xl p-3 border border-carbon-800 bg-carbon-900/50
                               hover:border-carbon-700 hover:bg-carbon-800/60 transition-all group">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-carbon-600 w-4 shrink-0">#{i+1}</span>
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                      <span className="text-xs font-semibold text-white truncate flex-1">{m.name}</span>
                      <ChevronRight className="w-3 h-3 text-carbon-600 group-hover:text-carbon-400 shrink-0" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-carbon-800">
                        <div className="h-1 rounded-full transition-all"
                          style={{ width: `${Math.min(100, pct * 4)}%`, background: color }} />
                      </div>
                      <span className="text-xs font-bold text-carbon-300 shrink-0">
                        {Math.round(m.emissions / 1000)}t
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Routes tab */}
          {activeTab === 'routes' && (
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1"
              style={{ maxHeight: selectedMarker ? 400 : 480 }}>
              <p className="text-xs text-carbon-500 font-medium px-1 mb-2">
                {routes.length} Active Routes
              </p>
              {routes.length === 0 && (
                <p className="text-xs text-carbon-600 text-center py-8">No routes yet</p>
              )}
              {routes.map((r, i) => {
                const col = MODE_COLORS[r.mode] || '#fff';
                return (
                  <div key={i}
                    className="rounded-xl p-3 border border-carbon-800 bg-carbon-900/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} />
                      <span className="text-xs font-semibold text-carbon-300 truncate flex-1">
                        {r.origin.name}
                        <span className="text-carbon-600 mx-1">→</span>
                        {r.destination.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${col}20`, color: col }}>
                        {MODE_LABELS[r.mode] || r.mode}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {Math.round(r.annual_emissions / 1000).toFixed(1)}t
                        <span className="text-carbon-600 font-normal"> CO₂e</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="rounded-xl border border-carbon-800 bg-carbon-900/40 p-3 mt-auto">
            <p className="text-[10px] font-semibold text-carbon-500 uppercase tracking-wider mb-2">Legend</p>
            <div className="space-y-1.5">
              {[['supplier','#f59e0b','Supplier'], ['warehouse','#3b82f6','Warehouse']].map(([type,color,label]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-xs text-carbon-400">{label}</span>
                </div>
              ))}
              <div className="border-t border-carbon-800 pt-1.5 mt-1.5 space-y-1">
                {Object.entries(MODE_COLORS).slice(0, 4).map(([mode, col]) => (
                  <div key={mode} className="flex items-center gap-2">
                    <span className="w-6 h-0.5 rounded-full shrink-0" style={{ background: col, borderTop: `2px dashed ${col}` }} />
                    <span className="text-[10px] text-carbon-500">{MODE_LABELS[mode]}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-carbon-600 pt-1">Pin size = emission intensity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
