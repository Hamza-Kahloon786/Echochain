import { useState, useRef } from 'react';
import api from '../utils/api';
import { Upload, FileText, Check, AlertTriangle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * PDFUploader — Reusable component for uploading PDFs to extract data.
 * @param {string} entityType - "suppliers" | "warehouses" | "transport" | "all"
 * @param {function} onImportComplete - Callback after successful import
 */
export default function PDFUploader({ entityType = 'all', onImportComplete }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const fileRef = useRef(null);

  const entityLabels = {
    suppliers: 'Suppliers',
    warehouses: 'Warehouses',
    transport: 'Transport Routes',
    all: 'All Data (Suppliers, Warehouses, Transport)',
  };

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setPreview(null);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handlePreview = async () => {
    if (!file) return;
    setPreviewing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/pdf/extract-preview?data_type=${entityType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to extract data from PDF');
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = entityType === 'all'
        ? '/pdf/import-all'
        : `/pdf/import-${entityType}`;

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const count = res.data.imported_count || res.data.total_imported || 0;
        toast.success(`Imported ${count} records from PDF`);
        setFile(null);
        setPreview(null);
        if (onImportComplete) onImportComplete(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!file && (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragging
              ? 'border-echo-500 bg-echo-500/10'
              : 'border-carbon-700 hover:border-carbon-500 bg-carbon-950/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className={`w-10 h-10 mx-auto mb-3 ${dragging ? 'text-echo-400' : 'text-carbon-500'}`} />
          <p className="text-sm font-medium text-white mb-1">
            Drop a PDF here or click to browse
          </p>
          <p className="text-xs text-carbon-500">
            Upload invoices, supplier lists, delivery schedules, energy bills, or any supply chain document.
            AI will extract {entityLabels[entityType]} automatically.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* File selected */}
      {file && !preview && (
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-carbon-500">{(file.size / 1024).toFixed(1)} KB · PDF</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePreview} disabled={previewing} className="btn-secondary flex items-center gap-2 text-sm">
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Preview
            </button>
            <button onClick={handleImport} disabled={importing} className="btn-primary flex items-center gap-2 text-sm">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import Now
            </button>
            <button onClick={reset} className="p-2 rounded-lg hover:bg-carbon-800 text-carbon-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preview results */}
      {preview && (
        <div className="space-y-4">
          {/* Extraction notes */}
          {preview.extraction_notes && (
            <div className="card bg-echo-600/10 border-echo-600/20">
              <p className="text-sm text-echo-300">{preview.extraction_notes}</p>
              <p className="text-[10px] text-carbon-600 mt-1">Extracted by {preview.source || 'OpenAI GPT'}</p>
            </div>
          )}

          {/* Suppliers preview */}
          {preview.suppliers?.length > 0 && (
            <PreviewTable
              title="Suppliers"
              items={preview.suppliers}
              columns={['name', 'location', 'industry', 'annual_production_volume']}
            />
          )}

          {/* Warehouses preview */}
          {preview.warehouses?.length > 0 && (
            <PreviewTable
              title="Warehouses"
              items={preview.warehouses}
              columns={['name', 'location', 'size_sqm', 'electricity_kwh_monthly']}
            />
          )}

          {/* Transport preview */}
          {preview.transport_routes?.length > 0 && (
            <PreviewTable
              title="Transport Routes"
              items={preview.transport_routes}
              columns={['name', 'origin', 'destination', 'mode', 'distance_km']}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleImport} disabled={importing} className="btn-primary flex items-center gap-2">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Confirm & Import All
            </button>
            <button onClick={reset} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}


function PreviewTable({ title, items, columns }) {
  return (
    <div className="card">
      <h4 className="text-sm font-medium text-carbon-400 mb-3">{title} ({items.length} found)</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-carbon-800">
              {columns.map(col => (
                <th key={col} className="text-left py-2 px-3 text-carbon-500 font-medium uppercase tracking-wider">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-carbon-800/50 hover:bg-carbon-800/30">
                {columns.map(col => (
                  <td key={col} className="py-2 px-3 text-carbon-300">
                    {typeof item[col] === 'number' ? item[col].toLocaleString() : String(item[col] || '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
