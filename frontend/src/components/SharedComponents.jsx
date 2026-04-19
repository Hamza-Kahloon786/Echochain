import { Loader2 } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, unit, color = 'echo', subtitle }) {
  const colorMap = {
    echo: 'from-echo-500/20 to-echo-600/5 border-echo-600/20 text-echo-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-600/20 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-600/20 text-red-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-600/20 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-600/20 text-purple-400',
  };
  const c = colorMap[color] || colorMap.echo;

  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-br ${c}`}>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 opacity-70" />}
        <span className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <div className="stat-value text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-base font-normal text-carbon-400 ml-1">{unit}</span>}
      </div>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-echo-500 animate-spin" />
        <p className="text-sm text-carbon-500">Loading data...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-carbon-800 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-carbon-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-carbon-500 max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}

export function ScopeBar({ scope1, scope2, scope3, total }) {
  if (!total || total === 0) return null;
  const p1 = (scope1 / total) * 100;
  const p2 = (scope2 / total) * 100;
  const p3 = (scope3 / total) * 100;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-carbon-800">
        <div className="bg-amber-500 transition-all duration-500" style={{ width: `${p1}%` }} title={`Scope 1: ${p1.toFixed(1)}%`} />
        <div className="bg-blue-500 transition-all duration-500" style={{ width: `${p2}%` }} title={`Scope 2: ${p2.toFixed(1)}%`} />
        <div className="bg-echo-500 transition-all duration-500" style={{ width: `${p3}%` }} title={`Scope 3: ${p3.toFixed(1)}%`} />
      </div>
      <div className="flex justify-between mt-2 text-xs text-carbon-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Scope 1 ({p1.toFixed(1)}%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Scope 2 ({p2.toFixed(1)}%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-echo-500" />Scope 3 ({p3.toFixed(1)}%)</span>
      </div>
    </div>
  );
}
