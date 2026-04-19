import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', company_name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.email, form.password, form.company_name);
        toast.success('Account created!');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-carbon-950" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-echo-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-echo-500/3 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-echo-600/20">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EchoChain</h1>
          <p className="text-carbon-400 text-sm mt-1">AI-Assisted Carbon Hotspot Identifier</p>
        </div>

        {/* Form card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="GreenLogistics UK Ltd"
                  value={form.company_name}
                  onChange={set('company_name')}
                  required={isRegister}
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@company.co.uk"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-carbon-800 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-carbon-400 hover:text-echo-400 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>

          {!isRegister && (
            <div className="mt-4 p-3 rounded-xl bg-echo-600/10 border border-echo-600/20 text-xs text-carbon-300">
              <span className="text-echo-400 font-medium">Demo:</span> demo@echochain.uk / demo123
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
