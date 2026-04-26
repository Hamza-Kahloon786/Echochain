import { useRef, useState } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle, AlertCircle, ChevronRight, Download } from 'lucide-react';
import api from '../utils/api';

/* ── Format definitions per entity type ────────────────────────────── */
const FORMATS = {
  suppliers: {
    title: 'Suppliers Excel Format',
    endpoint: '/excel/import-suppliers',
    description: 'Each row represents one supplier. Required: Supplier_Name. All other columns are optional but improve emission accuracy.',
    columns: [
      { name: 'Supplier_Name',             example: 'Supplier A',    required: true,  note: 'Unique name for the supplier' },
      { name: 'Location',                  example: 'Manchester',    required: false, note: 'City or region' },
      { name: 'Industry',                  example: 'Manufacturing', required: false, note: 'Sector / industry type' },
      { name: 'Annual_Production_Volume',  example: '1000',          required: false, note: 'Units produced per year' },
      { name: 'Fuel_Type',                 example: 'diesel',        required: false, note: 'diesel · petrol · natural_gas · lpg · coal · biofuel' },
      { name: 'Fuel_Consumed_Litres',      example: '500',           required: false, note: 'Annual fuel consumption in litres' },
      { name: 'Electricity_kWh',           example: '2000',          required: false, note: 'Annual electricity usage in kWh' },
      { name: 'Emission_Factor_Scope3',    example: '0.5',           required: false, note: 'kgCO₂e per unit of production (default 0.5)' },
    ],
  },
  warehouses: {
    title: 'Warehouses Excel Format',
    endpoint: '/excel/import-warehouses',
    description: 'Each row represents one warehouse or facility. Required: Name. Energy columns drive emission calculations.',
    columns: [
      { name: 'Name',                    example: 'Warehouse B',  required: true,  note: 'Facility name' },
      { name: 'Location',                example: 'Birmingham',   required: false, note: 'City or region' },
      { name: 'Size_sqm',               example: '5000',         required: false, note: 'Floor area in square metres' },
      { name: 'Electricity_kWh_Monthly', example: '3000',         required: false, note: 'Average monthly electricity in kWh' },
      { name: 'Gas_kWh_Monthly',         example: '1500',         required: false, note: 'Average monthly gas in kWh' },
      { name: 'Refrigeration',           example: 'true',         required: false, note: 'true / false — adds 30% surcharge to electricity' },
      { name: 'Renewable_Percentage',    example: '20',           required: false, note: '% of electricity from renewables (0–100)' },
    ],
  },
  transport: {
    title: 'Transport Routes Excel Format',
    endpoint: '/excel/import-transport',
    description: 'Each row represents one transport route. Required: Route_Name. Distance and weight drive the emission calculation.',
    columns: [
      { name: 'Route_Name',      example: 'Route A',      required: true,  note: 'Descriptive name for the route' },
      { name: 'Origin',          example: 'Manchester',   required: false, note: 'Starting location' },
      { name: 'Destination',     example: 'London',       required: false, note: 'End location' },
      { name: 'Distance_km',     example: '320',          required: false, note: 'One-way distance in kilometres' },
      { name: 'Transport_Mode',  example: 'road_diesel',  required: false, note: 'road_diesel · road_petrol · road_electric · rail · sea · air' },
      { name: 'Weight_Tonnes',   example: '10',           required: false, note: 'Cargo weight per trip in tonnes' },
      { name: 'Trips_Per_Month', example: '5',            required: false, note: 'Number of round trips per month' },
    ],
  },
};

export default function ExcelUploader({ entityType, onImportComplete }) {
  const fmt = FORMATS[entityType];
  const fileRef = useRef(null);
  const [step, setStep]     = useState('format');   // format | uploading | done | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!fmt) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';          // reset so same file can be re-selected

    setStep('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(fmt.endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setResult(res.data);
      setStep('done');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Upload failed. Please check the file format and try again.');
      setStep('error');
    }
  };

  const reset = () => { setStep('format'); setResult(null); setErrorMsg(''); };

  const handleDone = () => { onImportComplete?.(); reset(); };

  /* ── Download sample helper (builds a tiny CSV in-browser) ── */
  const downloadSample = () => {
    const headers = fmt.columns.map(c => c.name).join(',');
    const examples = fmt.columns.map(c => c.example).join(',');
    const blob = new Blob([headers + '\n' + examples + '\n'], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${entityType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,11,17,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) { reset(); onImportComplete?.(); } }}
      role="dialog" aria-modal="true" aria-label={fmt.title}
    >
      <div className="w-full max-w-2xl bg-carbon-900 border border-carbon-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-echo-500/15 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-echo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{fmt.title}</h2>
              <p className="text-xs text-carbon-500">Upload a .xlsx, .xls, or .csv file</p>
            </div>
          </div>
          <button onClick={() => { reset(); onImportComplete?.(); }}
            className="w-8 h-8 rounded-lg hover:bg-carbon-800 flex items-center justify-center text-carbon-500 hover:text-white transition-colors"
            aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP: format guide ── */}
        {step === 'format' && (
          <>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-carbon-400 leading-relaxed">{fmt.description}</p>

              {/* Column table */}
              <div className="rounded-xl overflow-hidden border border-carbon-800">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-carbon-800/60">
                      <th className="text-left px-4 py-2.5 text-carbon-400 font-semibold w-[38%]">Column Name</th>
                      <th className="text-left px-4 py-2.5 text-carbon-400 font-semibold w-[22%]">Example</th>
                      <th className="text-left px-4 py-2.5 text-carbon-400 font-semibold">Notes</th>
                      <th className="px-4 py-2.5 text-carbon-400 font-semibold text-center w-[80px]">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fmt.columns.map((col, i) => (
                      <tr key={col.name} className={`border-t border-carbon-800 ${i % 2 === 0 ? '' : 'bg-carbon-800/20'}`}>
                        <td className="px-4 py-2.5">
                          <code className="text-echo-300 font-mono text-[11px]">{col.name}</code>
                        </td>
                        <td className="px-4 py-2.5 text-carbon-300 font-mono text-[11px]">{col.example}</td>
                        <td className="px-4 py-2.5 text-carbon-500 leading-snug">{col.note}</td>
                        <td className="px-4 py-2.5 text-center">
                          {col.required
                            ? <span className="inline-block px-2 py-0.5 rounded-full bg-echo-500/15 text-echo-400 text-[10px] font-semibold">Yes</span>
                            : <span className="text-carbon-700 text-[10px]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-blue-500/8 border border-blue-500/20 text-xs text-blue-300">
                <span className="font-bold flex-shrink-0 mt-0.5">Tip</span>
                <span>Column names are case-insensitive and spaces are treated as underscores. Extra columns are ignored. Both Excel and CSV are accepted. Download the template for a ready-to-fill starting point.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 border-t border-carbon-800">
              <button onClick={downloadSample}
                className="flex items-center gap-2 text-xs font-medium text-carbon-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-carbon-700 hover:border-carbon-500">
                <Download className="w-3.5 h-3.5" /> Download Template
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#14d15e,#09ad4a)', boxShadow: '0 0 16px rgba(20,209,94,0.25)' }}>
                <Upload className="w-4 h-4" /> Choose File <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            </div>
          </>
        )}

        {/* ── STEP: uploading ── */}
        {step === 'uploading' && (
          <div className="flex flex-col items-center gap-4 px-6 py-12">
            <div className="w-14 h-14 rounded-full border-2 border-echo-500/30 border-t-echo-500 animate-spin" />
            <p className="text-sm text-carbon-300 font-medium">Parsing and importing data…</p>
            <p className="text-xs text-carbon-600">This may take a few seconds</p>
          </div>
        )}

        {/* ── STEP: done ── */}
        {step === 'done' && result && (
          <div className="px-6 py-8 space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-echo-500/15 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-echo-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">Import complete</p>
                <p className="text-carbon-400 text-sm mt-1">
                  <span className="text-echo-400 font-bold">{result.imported}</span> records imported successfully
                  {result.errors?.length > 0 && (
                    <span className="text-amber-400"> · {result.errors.length} skipped</span>
                  )}
                </p>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-4 space-y-1 max-h-32 overflow-y-auto">
                <p className="text-xs font-semibold text-amber-400 mb-2">Skipped rows</p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-amber-300/80">{err}</p>
                ))}
              </div>
            )}

            <button onClick={handleDone}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#14d15e,#09ad4a)' }}>
              Done — View Records
            </button>
          </div>
        )}

        {/* ── STEP: error ── */}
        {step === 'error' && (
          <div className="px-6 py-8 space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">Upload failed</p>
                <p className="text-carbon-400 text-sm mt-1">{errorMsg}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={reset}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#14d15e,#09ad4a)' }}>
                Try Again
              </button>
              <button onClick={() => { reset(); onImportComplete?.(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-carbon-300 border border-carbon-700 hover:border-carbon-500 hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
