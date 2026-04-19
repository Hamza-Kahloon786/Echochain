import { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageLoader, EmptyState } from '../components/SharedComponents';
import { Lightbulb, TrendingDown, ArrowRight, Factory, Zap, Truck, FileText, Wrench } from 'lucide-react';

const categoryIcons = {
  'Supply Chain': Factory,
  'Energy': Zap,
  'Transport': Truck,
  'Reporting': FileText,
  'Operations': Wrench,
};

export default function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recommendations/').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Recommendations</h1>
        <p className="text-sm text-carbon-500 mt-1">Actionable steps to reduce your carbon footprint</p>
      </div>

      {/* Summary banner */}
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
              Up to {data.total_potential_reduction_pct}% reduction achievable across {data.recommendations.length} actions
            </p>
          </div>
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {data.recommendations.map((rec) => {
          const Icon = categoryIcons[rec.category] || Lightbulb;
          const priorityClass = rec.priority === 'High' ? 'badge-high' : rec.priority === 'Medium' ? 'badge-medium' : 'badge-low';

          return (
            <div key={rec.id} className="card-hover">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-carbon-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-carbon-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-white">{rec.title}</h3>
                    <span className={priorityClass}>{rec.priority}</span>
                    <span className="badge bg-carbon-800 text-carbon-400 border border-carbon-700">{rec.scope}</span>
                  </div>
                  <p className="text-sm text-carbon-400 leading-relaxed mb-3">{rec.description}</p>

                  <div className="flex items-center gap-6 text-xs">
                    {rec.potential_reduction_kgco2e > 0 && (
                      <div className="flex items-center gap-1.5 text-echo-400">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span className="font-medium">-{Math.round(rec.potential_reduction_kgco2e).toLocaleString()} kgCO₂e</span>
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
    </div>
  );
}
