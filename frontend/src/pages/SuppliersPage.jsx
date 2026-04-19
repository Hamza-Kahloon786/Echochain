import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader, EmptyState } from '../components/SharedComponents';
import Modal from '../components/Modal';
import PDFUploader from '../components/PDFUploader';
import { Factory, Plus, Trash2, Edit2, Flame, Zap, Link2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const FUEL_TYPES = ['natural_gas', 'diesel', 'petrol', 'lpg', 'fuel_oil', 'coal', 'biofuel'];

const emptyForm = {
  name: '', location: '', industry: '', annual_production_volume: 0,
  fuel_type: 'natural_gas', fuel_consumed_litres: 0, electricity_kwh: 0,
  emission_factor_scope3: 0.5,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api.get('/suppliers/').then(r => setSuppliers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value });

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s.id);
    setForm({
      name: s.name, location: s.location, industry: s.industry,
      annual_production_volume: s.annual_production_volume, fuel_type: s.fuel_type,
      fuel_consumed_litres: s.fuel_consumed_litres, electricity_kwh: s.electricity_kwh,
      emission_factor_scope3: s.emission_factor_scope3,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/suppliers/${editing}`, form);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers/', form);
        toast.success('Supplier added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
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
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-sm text-carbon-500 mt-1">Manage suppliers and view Scope 1, 2, 3 emissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPdfUpload(!showPdfUpload)} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import PDF
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      {/* PDF Upload Section */}
      {showPdfUpload && (
        <div className="card border-echo-600/20">
          <h3 className="text-sm font-semibold text-echo-400 mb-3">Import Suppliers from PDF</h3>
          <p className="text-xs text-carbon-500 mb-4">Upload invoices, supplier lists, or any document containing supplier information. AI will extract names, locations, industries, and estimate emission factors.</p>
          <PDFUploader entityType="suppliers" onImportComplete={() => { setShowPdfUpload(false); load(); }} />
        </div>
      )}

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="No suppliers yet"
          description="Add your first supplier to start calculating supply chain emissions."
          action={<button onClick={openNew} className="btn-primary">Add Supplier</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{s.name}</h3>
                  <p className="text-xs text-carbon-500">{s.location} · {s.industry}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-carbon-800 text-carbon-500 hover:text-white transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-carbon-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-3">
                {Math.round(s.total_emissions).toLocaleString()}
                <span className="text-sm font-normal text-carbon-500 ml-1">kgCO₂e/yr</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-amber-500/10 rounded-lg p-2 text-center">
                  <Flame className="w-3 h-3 text-amber-400 mx-auto mb-1" />
                  <p className="text-xs font-mono text-amber-300">{Math.round(s.scope1_emissions).toLocaleString()}</p>
                  <p className="text-[10px] text-carbon-500">Scope 1</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                  <Zap className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs font-mono text-blue-300">{Math.round(s.scope2_emissions).toLocaleString()}</p>
                  <p className="text-[10px] text-carbon-500">Scope 2</p>
                </div>
                <div className="bg-echo-500/10 rounded-lg p-2 text-center">
                  <Link2 className="w-3 h-3 text-echo-400 mx-auto mb-1" />
                  <p className="text-xs font-mono text-echo-300">{Math.round(s.scope3_emissions).toLocaleString()}</p>
                  <p className="text-[10px] text-carbon-500">Scope 3</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input className="input-field" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" value={form.location} onChange={set('location')} required />
            </div>
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input-field" value={form.industry} onChange={set('industry')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Annual Production Volume</label>
              <input type="number" className="input-field" value={form.annual_production_volume} onChange={set('annual_production_volume')} min="0" />
            </div>
            <div>
              <label className="label">Fuel Type</label>
              <select className="select-field" value={form.fuel_type} onChange={set('fuel_type')}>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Fuel (litres)</label>
              <input type="number" className="input-field" value={form.fuel_consumed_litres} onChange={set('fuel_consumed_litres')} min="0" />
            </div>
            <div>
              <label className="label">Electricity (kWh)</label>
              <input type="number" className="input-field" value={form.electricity_kwh} onChange={set('electricity_kwh')} min="0" />
            </div>
            <div>
              <label className="label">Scope 3 Factor</label>
              <input type="number" className="input-field" value={form.emission_factor_scope3} onChange={set('emission_factor_scope3')} min="0" step="0.01" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Supplier</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
