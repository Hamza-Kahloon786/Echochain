import { useState } from 'react';
import api from '../utils/api';
import { PageLoader } from '../components/SharedComponents';
import {
  Brain, Send, Loader2, FileText, Lightbulb, MessageSquare,
  TrendingDown, Clock, Sparkles, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const priorityClass = {
  High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low',
};

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [aiRecs, setAiRecs] = useState(null);
  const [report, setReport] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const AI_TIMEOUT = { timeout: 60000 }; // OpenAI calls can take 10–30 s

  const loadAiRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/live/ai/recommendations', AI_TIMEOUT);
      setAiRecs(res.data);
    } catch (e) {
      toast.error(e.code === 'ECONNABORTED' ? 'AI request timed out — try again' : 'Failed to generate AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/live/ai/secr-report', AI_TIMEOUT);
      setReport(res.data);
    } catch (e) {
      toast.error(e.code === 'ECONNABORTED' ? 'AI request timed out — try again' : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await api.post('/live/ai/ask', { question }, AI_TIMEOUT);
      setAnswer(res.data);
    } catch (e) {
      toast.error(e.code === 'ECONNABORTED' ? 'AI request timed out — try again' : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb },
    { id: 'ask', label: 'Ask AI', icon: MessageSquare },
    { id: 'report', label: 'SECR Report', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-echo-400" /> AI Assistant
        </h1>
        <p className="text-sm text-carbon-500 mt-1">Powered by OpenAI GPT — intelligent analysis of your carbon data</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-carbon-800 pb-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
              activeTab === id
                ? 'bg-carbon-800 text-echo-400 border border-carbon-700 border-b-carbon-800 -mb-px'
                : 'text-carbon-500 hover:text-carbon-300'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* AI Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {!aiRecs && !loading && (
            <div className="card text-center py-12">
              <Brain className="w-12 h-12 text-echo-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Generate AI Recommendations</h3>
              <p className="text-sm text-carbon-500 mb-6 max-w-md mx-auto">
                GPT will analyse your suppliers, warehouses, and transport routes to produce
                intelligent, UK-specific reduction strategies.
              </p>
              <button onClick={loadAiRecommendations} className="btn-primary">
                Generate with AI
              </button>
            </div>
          )}

          {loading && activeTab === 'recommendations' && <PageLoader />}

          {aiRecs?.success && (
            <>
              {/* Summary */}
              <div className="card bg-gradient-to-r from-echo-600/10 to-echo-500/5 border-echo-600/20">
                <div className="flex items-start gap-4">
                  <Brain className="w-8 h-8 text-echo-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-carbon-300 leading-relaxed">{aiRecs.summary}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`badge ${
                        aiRecs.risk_level === 'high' || aiRecs.risk_level === 'critical' ? 'badge-high' :
                        aiRecs.risk_level === 'medium' ? 'badge-medium' : 'badge-low'
                      }`}>
                        Risk: {aiRecs.risk_level}
                      </span>
                      <span className="text-xs text-carbon-500">Source: {aiRecs.source}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick wins */}
              {aiRecs.quick_wins?.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-medium text-carbon-400 mb-3">Quick Wins</h3>
                  <div className="space-y-2">
                    {aiRecs.quick_wins.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-carbon-300">
                        <span className="w-5 h-5 rounded-full bg-echo-500/20 text-echo-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed recommendations */}
              <div className="space-y-3">
                {(aiRecs.recommendations || []).map((rec, i) => (
                  <div key={i} className="card-hover">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-carbon-800 flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold text-carbon-400">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-white">{rec.title}</h4>
                          <span className={priorityClass[rec.priority] || 'badge-medium'}>{rec.priority}</span>
                          <span className="badge bg-carbon-800 text-carbon-400 border border-carbon-700">{rec.scope}</span>
                        </div>
                        <p className="text-sm text-carbon-400 leading-relaxed mb-2">{rec.description}</p>
                        <div className="flex items-center gap-4 text-xs flex-wrap">
                          {rec.potential_reduction_kgco2e > 0 && (
                            <span className="text-echo-400 flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              -{Math.round(rec.potential_reduction_kgco2e).toLocaleString()} kgCO₂e ({rec.potential_reduction_pct}%)
                            </span>
                          )}
                          <span className="text-carbon-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {rec.timeframe}
                          </span>
                          {rec.uk_incentives && (
                            <span className="text-blue-400">{rec.uk_incentives}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance */}
              {aiRecs.compliance_notes && (
                <div className="card">
                  <h3 className="text-sm font-medium text-carbon-400 mb-2">Compliance Notes</h3>
                  <p className="text-sm text-carbon-300">{aiRecs.compliance_notes}</p>
                </div>
              )}

              <button onClick={loadAiRecommendations} className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
            </>
          )}

          {aiRecs && !aiRecs.success && (
            <div className="card text-center py-8">
              <p className="text-red-400 mb-3">Error: {aiRecs.error}</p>
              <button onClick={loadAiRecommendations} className="btn-primary">Retry</button>
            </div>
          )}
        </div>
      )}

      {/* Ask AI Tab */}
      {activeTab === 'ask' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-medium text-carbon-400 mb-3">Ask About Your Emissions</h3>
            <form onSubmit={askQuestion} className="flex gap-3">
              <input
                className="input-field flex-1"
                placeholder="e.g., Why are my Scope 3 emissions so high? Which supplier should I replace first?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ask
              </button>
            </form>
            <div className="flex gap-2 mt-3 flex-wrap">
              {[
                'Why are my emissions high?',
                'Which supplier should I replace?',
                'How can I reduce transport emissions?',
                'Am I SECR compliant?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuestion(q); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-carbon-800 text-carbon-400 hover:text-echo-400 hover:bg-carbon-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {loading && activeTab === 'ask' && <PageLoader />}

          {answer?.success && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-echo-400" />
                <span className="text-xs text-carbon-500">{answer.source}</span>
              </div>
              <div className="prose prose-sm prose-invert max-w-none">
                {answer.answer.split('\n').map((para, i) => (
                  <p key={i} className="text-sm text-carbon-300 leading-relaxed mb-3">{para}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECR Report Tab */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          {!report && !loading && (
            <div className="card text-center py-12">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Generate SECR Report</h3>
              <p className="text-sm text-carbon-500 mb-6 max-w-md mx-auto">
                AI will generate a Streamlined Energy and Carbon Reporting (SECR) compliant
                narrative report based on your emissions data.
              </p>
              <button onClick={loadReport} className="btn-primary">Generate SECR Report</button>
            </div>
          )}

          {loading && activeTab === 'report' && <PageLoader />}

          {report?.success && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-white">SECR Compliance Report</span>
                  <span className="badge bg-blue-500/15 text-blue-400 border border-blue-500/20">{report.compliance_standard}</span>
                </div>
              </div>
              <div className="bg-carbon-950 rounded-xl p-6 border border-carbon-800">
                {report.report.split('\n').map((line, i) => {
                  if (line.startsWith('#') || line.match(/^\d+\./)) {
                    return <h4 key={i} className="text-white font-semibold mt-4 mb-2">{line.replace(/^#+\s*/, '')}</h4>;
                  }
                  if (line.startsWith('---') || line.startsWith('===')) return <hr key={i} className="border-carbon-800 my-3" />;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-sm text-carbon-300 leading-relaxed mb-2">{line}</p>;
                })}
              </div>
              <p className="text-[10px] text-carbon-600 mt-3">Generated by {report.source} · Not legal advice — verify with a qualified consultant</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RefreshCw(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  );
}
