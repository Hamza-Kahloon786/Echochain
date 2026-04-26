import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, XCircle } from 'lucide-react';
import api from '../utils/api';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [plan, setPlan] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No session ID found. If you completed payment, it may take a moment to reflect.');
      setStatus('error');
      return;
    }

    api.post('/payments/verify-session', { session_id: sessionId })
      .then((res) => {
        setPlan(res.data.plan || 'starter');
        setStatus('success');
      })
      .catch((err) => {
        const msg = err.response?.data?.detail || 'Verification failed. Please contact support if you were charged.';
        setError(msg);
        setStatus('error');
      });
  }, [searchParams]);

  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1)
    : 'Paid';

  return (
    <div className="min-h-screen bg-carbon-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mx-auto mb-10 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center shadow-lg shadow-echo-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight group-hover:text-echo-400 transition-colors">
            EchoChain
          </span>
        </button>

        {/* Card */}
        <div className="bg-carbon-900 border border-carbon-700 rounded-2xl p-8 text-center shadow-2xl">

          {/* Verifying */}
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-14 h-14 text-echo-400 animate-spin" />
              <p className="text-carbon-300 text-lg font-medium">Verifying your payment…</p>
              <p className="text-carbon-500 text-sm">This takes just a moment.</p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-6">
              {/* Animated circle */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-echo-500/15 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-echo-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-echo-500/40 animate-ping" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  You're all set!
                </h1>
                <p className="text-carbon-400 text-sm">
                  Your <span className="text-echo-400 font-semibold">{planLabel} plan</span> is now active.
                  Start reducing your supply chain emissions today.
                </p>
              </div>

              {/* Plan badge */}
              <div className="flex items-center gap-2 bg-echo-500/10 border border-echo-500/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-echo-400 animate-pulse" />
                <span className="text-echo-300 text-sm font-medium">{planLabel} Plan · Active</span>
              </div>

              {/* What's next */}
              <div className="w-full bg-carbon-800 rounded-xl p-4 text-left space-y-3 border border-carbon-700">
                <p className="text-carbon-400 text-xs font-semibold uppercase tracking-wider">What's next</p>
                {[
                  'Add your first supplier to start tracking emissions',
                  'Upload logistics data or connect a live feed',
                  'Run your first AI hotspot scan',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-echo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-echo-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-carbon-300 text-sm">{item}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/app')}
                className="w-full flex items-center justify-center gap-2 bg-echo-500 hover:bg-echo-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-echo-500/20"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white mb-2">Verification failed</h1>
                <p className="text-carbon-400 text-sm">{error}</p>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate('/app')}
                  className="w-full flex items-center justify-center gap-2 bg-echo-500 hover:bg-echo-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full text-carbon-400 hover:text-white text-sm transition-colors py-2"
                >
                  Back to Pricing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-carbon-600 text-xs mt-6">
          Questions? Email us at{' '}
          <a href="mailto:support@echochain.io" className="text-carbon-400 hover:text-echo-400 transition-colors">
            support@echochain.io
          </a>
        </p>
      </div>
    </div>
  );
}
