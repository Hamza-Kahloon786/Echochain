import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf, ArrowRight, Loader2, Eye, EyeOff, ChevronLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-carbon-950" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-echo-600/5 rounded-full blur-[120px]" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-echo-500/3 rounded-full blur-[100px]" aria-hidden="true" />

      {/* Back to Home — fixed top-left */}
      <div className="fixed top-5 left-5 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-carbon-300 hover:text-white transition-all duration-200"
          style={{ background: 'rgba(39,39,51,0.8)', border: '1px solid rgba(61,61,79,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" aria-label="EchoChain home">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-echo-600/20 hover:scale-105 transition-transform">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">EchoChain</h1>
          <p className="text-carbon-400 text-sm mt-1">AI-Assisted Carbon Hotspot Identifier</p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Sign In</h2>
            <p className="text-sm text-carbon-500 mt-1">
              Don't have an account?{' '}
              <Link to="/signup" className="text-echo-400 hover:text-echo-300 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email" type="email" autoComplete="email"
                className="input-field" placeholder="you@company.co.uk"
                value={form.email} onChange={set('email')} required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                <button type="button" className="text-xs text-carbon-500 hover:text-echo-400 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  className="input-field pr-11" placeholder="••••••••"
                  value={form.password} onChange={set('password')} required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-carbon-500 hover:text-carbon-300 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

        </div>

        <p className="text-center text-xs text-carbon-600 mt-6">
          By signing in you agree to our{' '}
          <button className="hover:text-carbon-400 underline underline-offset-2 transition-colors">Terms</button>
          {' '}and{' '}
          <button className="hover:text-carbon-400 underline underline-offset-2 transition-colors">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}
