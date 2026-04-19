import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader, EmptyState } from '../components/SharedComponents';
import Modal from '../components/Modal';
import PDFUploader from '../components/PDFUploader';
import { Warehouse, Plus, Trash2, Edit2, Snowflake, Sun, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', location: '', size_sqm: 0,
  electricity_kwh_monthly: 0, gas_kwh_monthly: 0,
  refrigeration: false, renewable_percentage: 0,
};

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api.get('/warehouses/').then(r => setWarehouses(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setForm({ ...form, [k]: val });
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (w) => {
    setEditing(w.id);
    setForm({
      name: w.name, location: w.location, size_sqm: w.size_sqm,
      electricity_kwh_monthly: w.electricity_kwh_monthly, gas_kwh_monthly: w.gas_kwh_monthly,
      refrigeration: w.refrigeration, renewable_percentage: w.renewable_percentage,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/warehouses/${editing}`, form);
        toast.success('Warehouse updated');
      } else {
        await api.post('/warehouses/', form);
        toast.success('Warehouse added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this warehouse?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
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
          <h1 className="text-2xl font-bold text-white">Warehouses</h1>
          <p className="text-sm text-carbon-500 mt-1">Energy usage and Scope 1/2 emissions for your facilities</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPdfUpload(!showPdfUpload)} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import PDF
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        </div>
      </div>

      {showPdfUpload && (
        <div className="card border-echo-600/20">
          <h3 className="text-sm font-semibold text-echo-400 mb-3">Import Warehouses from PDF</h3>
          <p className="text-xs text-carbon-500 mb-4">Upload energy bills, facility reports, or property documents. AI will extract locations, sizes, and energy usage data.</p>
          <PDFUploader entityType="warehouses" onImportComplete={() => { setShowPdfUpload(false); load(); }} />
        </div>
      )}

      {warehouses.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="No warehouses yet"
          description="Add warehouse and facility data to track energy emissions."
          action={<button onClick={openNew} className="btn-primary">Add Warehouse</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map(w => (
            <div key={w.id} className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Warehouse className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{w.name}</h3>
                    <p className="text-xs text-carbon-500">{w.location} · {w.size_sqm.toLocaleString()} sqm</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-carbon-800 text-carbon-500 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-carbon-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-3">
                {Math.round(w.total_emissions).toLocaleString()}
                <span className="text-sm font-normal text-carbon-500 ml-1">kgCO₂e/yr</span>
              </div>

              <div className="flex gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-carbon-400">
                  <Snowflake className={`w-3 h-3 ${w.refrigeration ? 'text-blue-400' : 'text-carbon-600'}`} />
                  {w.refrigeration ? 'Refrigerated' : 'No refrigeration'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-carbon-400">
                  <Sun className="w-3 h-3 text-amber-400" />
                  {w.renewable_percentage}% renewable
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-500/10 rounded-lg p-2">
                  <p className="text-xs font-mono text-amber-300">{Math.round(w.scope1_emissions).toLocaleString()}</p>
                  <p className="text-[10px] text-carbon-500">Scope 1 (Gas)</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-2">
                  <p className="text-xs font-mono text-blue-300">{Math.round(w.scope2_emissions).toLocaleString()}</p>
                  <p className="text-[10px] text-carbon-500">Scope 2 (Electricity)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Warehouse' : 'Add Warehouse'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Name</label><input className="input-field" value={form.name} onChange={set('name')} required /></div>
            <div><label className="label">Location</label><input className="input-field" value={form.location} onChange={set('location')} required /></div>
          </div>
          <div><label className="label">Size (sqm)</label><input type="number" className="input-field" value={form.size_sqm} onChange={set('size_sqm')} min="0" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Monthly Electricity (kWh)</label><input type="number" className="input-field" value={form.electricity_kwh_monthly} onChange={set('electricity_kwh_monthly')} min="0" /></div>
            <div><label className="label">Monthly Gas (kWh)</label><input type="number" className="input-field" value={form.gas_kwh_monthly} onChange={set('gas_kwh_monthly')} min="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Renewable %</label><input type="number" className="input-field" value={form.renewable_percentage} onChange={set('renewable_percentage')} min="0" max="100" /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.refrigeration} onChange={set('refrigeration')} className="w-4 h-4 rounded border-carbon-600 bg-carbon-950 text-echo-500 focus:ring-echo-600" />
                <span className="text-sm text-carbon-300">Refrigeration</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Warehouse</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
