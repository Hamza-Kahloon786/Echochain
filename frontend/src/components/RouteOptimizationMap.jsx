import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/* ── Constants ────────────────────────────────────────────────── */
const EF = {
  road_diesel:   0.10711,
  road_petrol:   0.11340,
  road_electric: 0.02500,
  rail:          0.02780,
  sea:           0.01610,
  air:           0.60220,
};

const MODE_COLORS = {
  road_diesel:   '#ef4444',
  road_petrol:   '#f97316',
  road_electric: '#22c55e',
  rail:          '#3b82f6',
  sea:           '#06b6d4',
  air:           '#a855f7',
};

const MODE_LABELS = {
  road_diesel:   'Road · Diesel',
  road_petrol:   'Road · Petrol',
  road_electric: 'Road · Electric',
  rail:          'Rail',
  sea:           'Sea Freight',
  air:           'Air Freight',
};

const SUGGESTED = {
  road_diesel:   'rail',
  road_petrol:   'road_electric',
  air:           'sea',
  sea:           null,
  rail:          null,
  road_electric: null,
};

const MAP_STYLES = [
  { elementType: 'geometry',                stylers: [{ color: '#0f1018' }] },
  { elementType: 'labels.text.stroke',      stylers: [{ color: '#0f1018' }] },
  { elementType: 'labels.text.fill',        stylers: [{ color: '#6b6b9a' }] },
  { featureType: 'administrative',          elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3d' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9090b8' }] },
  { featureType: 'administrative.country',  elementType: 'labels.text.fill', stylers: [{ color: '#7070a0' }] },
  { featureType: 'road',                    elementType: 'geometry',         stylers: [{ color: '#1e1e30' }] },
  { featureType: 'road',                    elementType: 'geometry.stroke',  stylers: [{ color: '#28283d' }] },
  { featureType: 'road.highway',            elementType: 'geometry',         stylers: [{ color: '#252540' }] },
  { featureType: 'road.highway',            elementType: 'geometry.stroke',  stylers: [{ color: '#333350' }] },
  { featureType: 'road',                    elementType: 'labels.text.fill', stylers: [{ color: '#4a4a70' }] },
  { featureType: 'water',                   elementType: 'geometry',         stylers: [{ color: '#080e18' }] },
  { featureType: 'water',                   elementType: 'labels.text.fill', stylers: [{ color: '#1a3a28' }] },
  { featureType: 'poi',                     elementType: 'labels',           stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape',              elementType: 'geometry',         stylers: [{ color: '#0f1018' }] },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function savingPct(cur, sug) {
  if (!sug) return 0;
  return Math.round(((EF[cur] - EF[sug]) / EF[cur]) * 100);
}

function annualEm(mode, km, weight, trips) {
  return EF[mode] * km * weight * trips * 12;
}

function pathMidpoint(path) {
  const mid = Math.floor(path.length / 2);
  return { lat: path[mid].lat(), lng: path[mid].lng() };
}

/* ── Custom floating label overlay ──────────────────────────── */
function makeRouteLabel(map, position, lines, color) {
  const G = window.google.maps;

  class RouteLabel extends G.OverlayView {
    constructor() {
      super();
      this._pos   = position;
      this._lines = lines;
      this._color = color;
      this._div   = null;
    }

    onAdd() {
      const wrap = document.createElement('div');
      wrap.style.cssText = `
        position: absolute;
        pointer-events: none;
        background: rgba(13,14,22,0.97);
        border: 1.5px solid ${this._color};
        border-radius: 10px;
        padding: 6px 11px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
        min-width: 110px;
        font-family: 'DM Sans', system-ui, sans-serif;
      `;

      this._lines.forEach((line, i) => {
        const p = document.createElement('div');
        p.style.cssText = i === 0
          ? `color:#fff; font-size:12px; font-weight:800; white-space:nowrap; letter-spacing:0.01em;`
          : `color:${this._color}; font-size:10px; font-weight:700; white-space:nowrap; margin-top:2px; letter-spacing:0.02em;`;
        p.textContent = line;
        wrap.appendChild(p);
      });

      this._div = wrap;
      this.getPanes().floatPane.appendChild(wrap);
    }

    draw() {
      const proj = this.getProjection();
      if (!proj || !this._div) return;
      const pt = proj.fromLatLngToDivPixel(
        new G.LatLng(this._pos.lat, this._pos.lng)
      );
      const w = this._div.offsetWidth;
      const h = this._div.offsetHeight;
      this._div.style.left = `${pt.x - w / 2}px`;
      this._div.style.top  = `${pt.y - h - 12}px`;
    }

    onRemove() {
      this._div?.parentNode?.removeChild(this._div);
      this._div = null;
    }
  }

  const lbl = new RouteLabel();
  lbl.setMap(map);
  return lbl;
}

/* ── City name tag overlay ──────────────────────────────────── */
function makeCityTag(map, position, name, role, color) {
  const G = window.google.maps;

  class CityTag extends G.OverlayView {
    constructor() { super(); this._div = null; }

    onAdd() {
      const d = document.createElement('div');
      d.style.cssText = `
        position: absolute; pointer-events: none;
        background: rgba(13,14,22,0.93);
        border: 1px solid ${color}66;
        color: #e4e4ec; font-size: 10px; font-weight: 700;
        padding: 3px 8px; border-radius: 6px;
        font-family: 'DM Sans', system-ui, sans-serif;
        white-space: nowrap; letter-spacing: 0.01em;
        box-shadow: 0 2px 10px rgba(0,0,0,0.6);
      `;
      const dot = document.createElement('span');
      dot.style.cssText = `
        display:inline-block; width:6px; height:6px; border-radius:50%;
        background:${color}; margin-right:5px; vertical-align:middle;
      `;
      d.appendChild(dot);
      d.appendChild(document.createTextNode(name));
      this._div = d;
      this.getPanes().floatPane.appendChild(d);
    }

    draw() {
      const proj = this.getProjection();
      if (!proj || !this._div) return;
      const pt = proj.fromLatLngToDivPixel(new G.LatLng(position.lat, position.lng));
      this._div.style.left = `${pt.x + 16}px`;
      this._div.style.top  = `${pt.y - 8}px`;
    }

    onRemove() { this._div?.parentNode?.removeChild(this._div); this._div = null; }
  }

  const tag = new CityTag();
  tag.setMap(map);
  return tag;
}

/* ── Info window HTML ────────────────────────────────────────── */
function buildInfoHtml(r, realKm, sug) {
  const curColor = MODE_COLORS[r.mode] || '#ef4444';
  const curEm    = r.annual_emissions;
  const sugEm    = sug ? annualEm(sug, realKm || r.distance_km || 0, r.weight_tonnes || 1, r.trips_per_month || 1) : null;
  const saving   = savingPct(r.mode, sug);
  const barW     = sugEm && curEm > 0 ? Math.max(5, Math.round((sugEm / curEm) * 100)) : 100;

  return `
  <div style="font-family:'DM Sans',system-ui,sans-serif;background:#13141f;color:#e4e4ec;
              border-radius:16px;width:300px;overflow:hidden;border:1px solid #252535;
              box-shadow:0 16px 48px rgba(0,0,0,0.8);">

    <!-- Header -->
    <div style="background:${curColor}15;border-bottom:1px solid ${curColor}25;padding:14px 16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="display:inline-flex;align-items:center;gap:5px;background:${curColor}20;
                     color:${curColor};font-size:10px;font-weight:800;
                     padding:3px 9px;border-radius:20px;letter-spacing:.06em;text-transform:uppercase">
          <span style="width:6px;height:6px;border-radius:50%;background:${curColor};display:inline-block"></span>
          ${MODE_LABELS[r.mode]}
        </span>
      </div>
      <div style="font-size:16px;font-weight:800;color:#fff;line-height:1.2">
        ${r.origin.name}
        <span style="color:#40405a;margin:0 6px;font-size:14px">→</span>
        ${r.destination.name}
      </div>
      <div style="margin-top:6px;display:flex;gap:12px;font-size:11px;color:#8b8ba8;font-weight:600">
        ${realKm ? `<span>🛣 ${realKm.toLocaleString()} km actual road</span>` : r.distance_km ? `<span>📍 ${r.distance_km} km</span>` : ''}
        ${r.weight_tonnes ? `<span>📦 ${r.weight_tonnes}t</span>` : ''}
        ${r.trips_per_month ? `<span>🔄 ${r.trips_per_month}×/mo</span>` : ''}
      </div>
    </div>

    <!-- Body -->
    <div style="padding:14px 16px;space-y:12px">

      <!-- Current emissions row -->
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px">
          <span style="font-size:11px;color:#8b8ba8;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Current Annual Emissions</span>
          <span style="font-size:20px;font-weight:900;color:#fff">${(curEm / 1000).toFixed(1)}<span style="font-size:11px;font-weight:600;color:#6b6b8a;margin-left:2px">t CO₂e</span></span>
        </div>
        <div style="height:6px;border-radius:4px;background:#1e1e30;overflow:hidden">
          <div style="height:100%;width:100%;border-radius:4px;background:linear-gradient(90deg,${curColor}cc,${curColor})"></div>
        </div>
      </div>

      ${sug ? `
      <!-- Suggested row -->
      <div style="background:rgba(20,209,94,0.07);border:1px solid rgba(20,209,94,0.2);border-radius:12px;padding:12px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px">
          <span style="font-size:11px;color:#4ade80;font-weight:700">⚡ Switch to ${MODE_LABELS[sug]}</span>
          <span style="font-size:18px;font-weight:900;color:#14d15e">${(sugEm / 1000).toFixed(1)}<span style="font-size:11px;font-weight:600;color:#4ade80;margin-left:2px">t CO₂e</span></span>
        </div>
        <div style="height:6px;border-radius:4px;background:rgba(20,209,94,0.12);overflow:hidden">
          <div style="height:100%;width:${barW}%;border-radius:4px;background:linear-gradient(90deg,#09ad4a,#14d15e)"></div>
        </div>
      </div>

      <!-- Saving summary -->
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:10px 14px;border-radius:10px;
                  background:rgba(20,209,94,0.06);border:1px solid rgba(20,209,94,0.15)">
        <span style="font-size:12px;color:#8b8ba8;font-weight:600">Annual CO₂e saving</span>
        <span style="font-size:16px;font-weight:900;color:#14d15e">
          −${saving}%
          <span style="font-size:11px;font-weight:600;color:#4ade80;margin-left:4px">${((curEm - sugEm) / 1000).toFixed(1)}t saved</span>
        </span>
      </div>` : `
      <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;
                  background:rgba(20,209,94,0.07);border:1px solid rgba(20,209,94,0.2);border-radius:10px">
        <span style="font-size:13px">✅</span>
        <span style="font-size:11px;color:#4ade80;font-weight:600">Already using a low-emission mode</span>
      </div>`}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════ */
export default function RouteOptimizationMap({ routes = [], height = 420 }) {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawingsRef    = useRef([]);

  const [mapLoaded,    setMapLoaded]    = useState(!!window.google?.maps);
  const [mapError,     setMapError]     = useState('');
  const [fetchingDirs, setFetchingDirs] = useState(false);
  const [routeCards,   setRouteCards]   = useState([]);

  /* Load Maps script */
  useEffect(() => {
    if (window.google?.maps) { setMapLoaded(true); return; }
    if (!GOOGLE_MAPS_API_KEY) { setMapError('no-key'); return; }
    const prev = window.__echoMapsReady;
    window.__echoMapsReady = () => { prev?.(); setMapLoaded(true); };
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization&callback=__echoMapsReady`;
      s.async = true; s.defer = true;
      s.onerror = () => setMapError('load-fail');
      document.head.appendChild(s);
    }
  }, []);

  const drawRoutes = useCallback(async (map) => {
    if (!window.google?.maps || routes.length === 0) return;
    setFetchingDirs(true);

    /* Clear previous drawings */
    drawingsRef.current.forEach(d => d?.setMap?.(null));
    drawingsRef.current = [];
    if (window.__openIw) { window.__openIw.close(); window.__openIw = null; }

    const G  = window.google.maps;
    const ds = new G.DirectionsService();
    const bounds = new G.LatLngBounds();
    const cards  = [];

    await Promise.all(routes.map(async (r) => {
      const orig     = { lat: r.origin.lat,      lng: r.origin.lng };
      const dest     = { lat: r.destination.lat, lng: r.destination.lng };
      const curColor = MODE_COLORS[r.mode] || '#ef4444';
      const sug      = SUGGESTED[r.mode] ?? null;
      let   realKm   = r.distance_km || null;
      let   routePath = null;

      /* ── Fetch actual road route ── */
      const isRoad = ['road_diesel', 'road_petrol', 'road_electric'].includes(r.mode);
      if (isRoad) {
        try {
          const res = await new Promise((resolve, reject) =>
            ds.route({
              origin: orig, destination: dest,
              travelMode: G.TravelMode.DRIVING,
            }, (res, status) => status === 'OK' ? resolve(res) : reject(status))
          );
          realKm    = Math.round(res.routes[0].legs[0].distance.value / 1000);
          routePath = res.routes[0].overview_path;
        } catch { /* use straight line */ }
      }

      const path = routePath || [
        new G.LatLng(orig.lat, orig.lng),
        new G.LatLng(dest.lat, dest.lng),
      ];

      /* ── Route polyline with direction arrow ── */
      const poly = new G.Polyline({
        path,
        geodesic:       !routePath,
        strokeOpacity:  0,
        icons: [
          {
            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4, strokeColor: curColor },
            offset: '0', repeat: '16px',
          },
          {
            icon: {
              path:         G.SymbolPath.FORWARD_CLOSED_ARROW,
              strokeColor:  curColor,
              fillColor:    curColor,
              fillOpacity:  1,
              scale:        3.5,
              strokeWeight: 1,
            },
            offset: '52%',
          },
        ],
        strokeWeight: 4,
      });
      poly.setMap(map);
      drawingsRef.current.push(poly);

      /* ── Distance + emission label at midpoint ── */
      const mid = pathMidpoint(path);
      if (mid) {
        const curEmT = (r.annual_emissions / 1000).toFixed(1);
        const lbl = makeRouteLabel(
          map, mid,
          [
            `${realKm ? realKm.toLocaleString() + ' km' : '? km'}  ·  ${curEmT}t CO₂e/yr`,
            sug ? `⚡ Switch to ${MODE_LABELS[sug]} → save ${savingPct(r.mode, sug)}%` : '✓ Low-emission mode',
          ],
          curColor
        );
        drawingsRef.current.push(lbl);
      }

      /* ── Origin marker + city tag ── */
      const oMarker = new G.Marker({
        position: orig, map,
        title:     r.origin.name,
        optimized: false,
        icon: {
          url: pinSvg(curColor, 28),
          scaledSize: new G.Size(28, 39),
          anchor:     new G.Point(14, 39),
        },
        zIndex: 10,
      });
      const oTag = makeCityTag(map, orig, r.origin.name, 'origin', curColor);
      drawingsRef.current.push(oMarker, oTag);

      /* ── Destination marker + city tag ── */
      const destColor = sug ? '#14d15e' : curColor;
      const dMarker = new G.Marker({
        position:  dest, map,
        title:     r.destination.name,
        optimized: false,
        icon: {
          url: pinSvg(destColor, 28),
          scaledSize: new G.Size(28, 39),
          anchor:     new G.Point(14, 39),
        },
        zIndex: 10,
      });
      const dTag = makeCityTag(map, dest, r.destination.name, 'destination', destColor);
      drawingsRef.current.push(dMarker, dTag);

      /* ── Shared info window ── */
      const iw = new G.InfoWindow({
        content:  buildInfoHtml(r, realKm, sug),
        maxWidth: 320,
        pixelOffset: new G.Size(0, -8),
      });
      const openIw = (anchor) => {
        window.__openIw?.close();
        iw.open({ map, anchor });
        window.__openIw = iw;
      };
      oMarker.addListener('click', () => openIw(oMarker));
      dMarker.addListener('click', () => openIw(dMarker));
      poly.addListener('click', (e) => {
        window.__openIw?.close();
        iw.setPosition(e.latLng);
        iw.open(map);
        window.__openIw = iw;
      });

      bounds.extend(orig);
      bounds.extend(dest);

      /* Card data */
      const sugEm = sug ? annualEm(sug, realKm || r.distance_km || 0, r.weight_tonnes || 1, r.trips_per_month || 1) : null;
      cards.push({ ...r, realKm, sug, saving: savingPct(r.mode, sug), sugEm });
    }));

    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 80 });
    setRouteCards(cards);
    setFetchingDirs(false);
  }, [routes]);

  /* Init map */
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 52.8, lng: -1.5 }, zoom: 6,
        styles: MAP_STYLES,
        mapTypeControl: false, streetViewControl: false,
        fullscreenControl: true, zoomControl: true,
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
        gestureHandling: 'cooperative',
        clickableIcons: false,
      });
    }
    drawRoutes(mapInstanceRef.current);
  }, [mapLoaded, drawRoutes]);

  /* ── Fallback ── */
  if (mapError === 'no-key')    return <FallbackTable routes={routes} />;
  if (mapError === 'load-fail') return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
      <p className="text-sm text-red-300">Failed to load Google Maps. Check your API key.</p>
    </div>
  );

  const display = routeCards.length > 0 ? routeCards : routes.map(r => ({
    ...r, realKm: r.distance_km, sug: SUGGESTED[r.mode] ?? null,
    saving: savingPct(r.mode, SUGGESTED[r.mode] ?? null),
    sugEm: SUGGESTED[r.mode]
      ? annualEm(SUGGESTED[r.mode], r.distance_km || 0, r.weight_tonnes || 1, r.trips_per_month || 1)
      : null,
  }));

  return (
    <div className="space-y-4">

      {/* ── Map ── */}
      <div className="rounded-2xl overflow-hidden border border-carbon-800 relative shadow-2xl" style={{ height }}>

        {/* Loading overlay */}
        {(!mapLoaded || fetchingDirs) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(13,14,22,0.88)', backdropFilter: 'blur(6px)' }}>
            <div className="w-10 h-10 rounded-full border-2 border-echo-500/30 border-t-echo-500 animate-spin" />
            <p className="text-sm text-carbon-300 font-medium">
              {!mapLoaded ? 'Loading map…' : 'Calculating real road distances…'}
            </p>
            <p className="text-xs text-carbon-600">Using Google Maps Directions API</p>
          </div>
        )}

        {/* Legend overlay — bottom left */}
        <div className="absolute bottom-4 left-4 z-10 space-y-1.5 pointer-events-none">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(13,14,22,0.93)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-7 border-t-2 border-dashed border-red-400 mr-0.5" />
              <span className="text-carbon-300">Current route</span>
            </span>
            <span className="text-carbon-700">·</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-echo-500 inline-block" />
              <span className="text-carbon-300">Destination (optimisable)</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] text-carbon-500"
            style={{ background: 'rgba(13,14,22,0.88)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            Click any pin or route line for full emission details
          </div>
        </div>

        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* ── Route cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {display.map((r, i) => {
          const curColor = MODE_COLORS[r.mode] || '#ef4444';
          const curEm    = r.annual_emissions;
          const barW     = r.sugEm && curEm > 0 ? Math.max(6, Math.round((r.sugEm / curEm) * 100)) : 100;
          const co2PerKm = r.realKm ? (curEm / r.realKm / 1000).toFixed(3) : null;

          return (
            <div key={i} className="rounded-xl border border-carbon-800 bg-carbon-900/60 p-4 space-y-3">

              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: curColor }} />
                    <span className="text-xs font-bold text-white truncate">
                      {r.origin.name}
                      <span className="text-carbon-700 mx-1.5">→</span>
                      {r.destination.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${curColor}18`, color: curColor }}>
                      {MODE_LABELS[r.mode]}
                    </span>
                    {r.realKm && (
                      <span className="text-[10px] text-carbon-500 font-medium">
                        🛣 {r.realKm.toLocaleString()} km
                      </span>
                    )}
                  </div>
                </div>
                {co2PerKm && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-carbon-600 mb-0.5">CO₂e/km</div>
                    <div className="text-xs font-bold" style={{ color: curColor }}>{co2PerKm}t</div>
                  </div>
                )}
              </div>

              {/* Current emissions bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-carbon-500 font-medium">Current</span>
                  <span className="font-bold text-white">{(curEm / 1000).toFixed(1)} t CO₂e/yr</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(90deg, ${curColor}99, ${curColor})` }} />
                </div>
              </div>

              {/* Suggested emissions bar */}
              {r.sug && r.sugEm !== null ? (
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-echo-400 font-semibold flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" /> {MODE_LABELS[r.sug]}
                    </span>
                    <span className="font-bold text-echo-400">{(r.sugEm / 1000).toFixed(1)} t CO₂e/yr</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${barW}%`, background: 'linear-gradient(90deg, #09ad4a, #14d15e)' }} />
                  </div>

                  {/* Savings pill */}
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-carbon-600">Annual savings</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
                      style={{ background: 'rgba(20,209,94,0.1)', borderColor: 'rgba(20,209,94,0.25)' }}>
                      <TrendingDown className="w-3 h-3 text-echo-400" />
                      <span className="text-[11px] font-bold text-echo-400">
                        −{r.saving}% &nbsp;·&nbsp; {((curEm - r.sugEm) / 1000).toFixed(1)}t CO₂e
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(20,209,94,0.07)', border: '1px solid rgba(20,209,94,0.18)' }}>
                  <span className="text-echo-400 text-sm">✓</span>
                  <span className="text-[11px] text-echo-400 font-semibold">Already using a low-emission mode</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── SVG pin ─────────────────────────────────────────────────── */
function pinSvg(color, size = 28) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size*1.4)}" viewBox="0 0 32 45">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 11.31 14.3 27.38 15.12 28.27a1.18 1.18 0 001.76 0C17.7 43.38 32 27.31 32 16 32 7.16 24.84 0 16 0z"
      fill="${color}" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="6.5" fill="white" opacity="0.92"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(s)}`;
}

/* ── Fallback table ──────────────────────────────────────────── */
function FallbackTable({ routes }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Map requires <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in your frontend <code className="font-mono">.env</code>. Showing route summary below.</span>
      </div>
      <div className="rounded-xl border border-carbon-800 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-carbon-800/60 border-b border-carbon-800">
              {['Route', 'Distance', 'Mode', 'Emissions/yr', 'Suggestion', 'Saving'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-carbon-400 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => {
              const sug    = SUGGESTED[r.mode] ?? null;
              const saving = savingPct(r.mode, sug);
              const sugEm  = sug ? annualEm(sug, r.distance_km||0, r.weight_tonnes||1, r.trips_per_month||1) : null;
              const c      = MODE_COLORS[r.mode] || '#6b6b8a';
              return (
                <tr key={i} className="border-t border-carbon-800/50 hover:bg-carbon-800/20 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">
                    {r.origin.name}<ArrowRight className="inline w-3 h-3 text-carbon-600 mx-1" />{r.destination.name}
                  </td>
                  <td className="px-4 py-3 text-carbon-400">{r.distance_km ? `${r.distance_km} km` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background:`${c}20`, color:c }}>{MODE_LABELS[r.mode]}</span>
                  </td>
                  <td className="px-4 py-3 text-white font-bold">{(r.annual_emissions/1000).toFixed(1)}t</td>
                  <td className="px-4 py-3">
                    {sug
                      ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-echo-500/15 text-echo-400">{MODE_LABELS[sug]}</span>
                      : <span className="text-carbon-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {saving > 0
                      ? <span className="flex items-center gap-1 text-echo-400 font-bold"><TrendingDown className="w-3 h-3"/>−{saving}% · {sugEm?`${((r.annual_emissions-sugEm)/1000).toFixed(1)}t`:''}</span>
                      : <span className="text-carbon-600">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
