import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader, EmptyState } from '../components/SharedComponents';
import Modal from '../components/Modal';
import ExcelUploader from '../components/ExcelUploader';
import { Truck, Plus, Trash2, Edit2, Plane, TrainFront, Ship, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const MODES = [
  { value: 'road_diesel', label: 'Road (Diesel)' },
  { value: 'road_petrol', label: 'Road (Petrol)' },
  { value: 'road_electric', label: 'Road (Electric)' },
  { value: 'rail', label: 'Rail' },
  { value: 'sea', label: 'Sea Freight' },
  { value: 'air', label: 'Air Freight' },
];

const modeIcon = (mode) => {
  if (mode === 'air') return Plane;
  if (mode === 'rail') return TrainFront;
  if (mode === 'sea') return Ship;
  return Truck;
};

const modeColor = (mode) => {
  if (mode === 'air') return 'text-red-400 bg-red-500/10';
  if (mode === 'rail') return 'text-echo-400 bg-echo-500/10';
  if (mode === 'sea') return 'text-blue-400 bg-blue-500/10';
  if (mode === 'road_electric') return 'text-echo-400 bg-echo-500/10';
  return 'text-amber-400 bg-amber-500/10';
};

const emptyForm = {
  name: '', origin: '', destination: '', distance_km: 0,
  mode: 'road_diesel', weight_tonnes: 1, trips_per_month: 1,
};

export default function TransportPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api.get('/transport/').then(r => setRoutes(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value });

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r.id);
    setForm({
      name: r.name, origin: r.origin, destination: r.destination,
      distance_km: r.distance_km, mode: r.mode,
      weight_tonnes: r.weight_tonnes, trips_per_month: r.trips_per_month,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/transport/${editing}`, form);
        toast.success('Route updated');
      } else {
        await api.post('/transport/', form);
        toast.success('Route added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this route?')) return;
    try {
      await api.delete(`/transport/${id}`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const [showPdfUpload, setShowPdfUpload] = useState(false);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transport Routes</h1>
          <p className="text-sm text-carbon-500 mt-1">Manage logistics routes and track transport emissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPdfUpload(true)} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import Excel
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Route
          </button>
        </div>
      </div>

      {showPdfUpload && (
        <ExcelUploader entityType="transport" onImportComplete={() => { setShowPdfUpload(false); load(); }} />
      )}

      {routes.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No transport routes yet"
          description="Add transport routes to calculate logistics emissions."
          action={<button onClick={openNew} className="btn-primary">Add Route</button>}
        />
      ) : (
        <div className="space-y-3">
          {routes.map(r => {
            const Icon = modeIcon(r.mode);
            const colorCls = modeColor(r.mode);
            return (
              <div key={r.id} className="card-hover flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{r.name}</h3>
                  <p className="text-xs text-carbon-500">{r.origin} → {r.destination} · {r.distance_km} km · {r.weight_tonnes}t · {r.trips_per_month}x/mo</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-white">{Math.round(r.annual_emissions).toLocaleString()}</p>
                  <p className="text-[10px] text-carbon-500">kgCO₂e/yr</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-carbon-800 text-carbon-500 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-carbon-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Route' : 'Add Route'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Route Name</label><input className="input-field" value={form.name} onChange={set('name')} required placeholder="e.g. Birmingham-London Express" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Origin</label><input className="input-field" value={form.origin} onChange={set('origin')} required /></div>
            <div><label className="label">Destination</label><input className="input-field" value={form.destination} onChange={set('destination')} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Distance (km)</label><input type="number" className="input-field" value={form.distance_km} onChange={set('distance_km')} min="0" /></div>
            <div>
              <label className="label">Mode</label>
              <select className="select-field" value={form.mode} onChange={set('mode')}>
                {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Weight (tonnes)</label><input type="number" className="input-field" value={form.weight_tonnes} onChange={set('weight_tonnes')} min="0" step="0.1" /></div>
            <div><label className="label">Trips/Month</label><input type="number" className="input-field" value={form.trips_per_month} onChange={set('trips_per_month')} min="0" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Route</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
