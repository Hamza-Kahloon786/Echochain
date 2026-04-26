import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Leaf, ArrowRight, Loader2, Eye, EyeOff, Check,
  Map, TrendingUp, Zap, Shield, Star, Phone, MapPin, ChevronLeft,
} from 'lucide-react';

/* ── Password strength ──────────────────────────────────────────── */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  return score; // 0-4
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-amber-400', 'bg-blue-400', 'bg-echo-500'];
const STRENGTH_TEXT  = ['', 'text-red-400', 'text-amber-400', 'text-blue-400', 'text-echo-400'];

/* ── Left-panel features ────────────────────────────────────────── */
const PERKS = [
  { Icon: Map,       text: 'AI-powered carbon hotspot detection across your supply chain' },
  { Icon: TrendingUp,text: '12-month emission forecasting with DEFRA 2024 factors' },
  { Icon: Zap,       text: 'Live UK Grid Intensity data for smarter energy scheduling' },
  { Icon: Shield,    text: 'SOC 2 Type II, GDPR, and ISO 27001 compliant infrastructure' },
];

export default function SignupPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    company_name:    '',
    email:           '',
    company_phone:   '',
    company_address: '',
    password:        '',
    confirm:         '',
    agreed:          false,
  });
  const [showPw,  setShowPw]  = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: '' }));
  };

  const strength = getStrength(form.password);

  /* ── Validation ─────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.company_name.trim())       e.company_name    = 'Company name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                         e.email           = 'Enter a valid email address.';
    if (!form.company_phone.trim())      e.company_phone   = 'Company phone is required.';
    if (!form.company_address.trim())    e.company_address = 'Company address is required.';
    if (form.password.length < 8)        e.password        = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm)  e.confirm         = 'Passwords do not match.';
    if (!form.agreed)                    e.agreed          = 'You must accept the terms to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.email, form.password, form.company_name, '', form.company_phone, form.company_address);
      toast.success('Account created! Welcome to EchoChain.');
      navigate('/app');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('email')) {
        setErrors(er => ({ ...er, email: detail }));
      } else {
        toast.error(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#0f1117' }}>

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

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        {/* Background glow */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 70% at 30% 50%, rgba(20,209,94,0.1) 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="absolute inset-0 border-r border-carbon-800/60" aria-hidden="true" />

        {/* Top: Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 w-fit group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center shadow-lg shadow-echo-900/50 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">EchoChain</span>
        </Link>

        {/* Middle: headline + perks */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/8 text-echo-400 text-xs font-semibold tracking-wider uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-echo-500 animate-pulse" aria-hidden="true" />
            14-day free trial · No credit card
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white leading-tight mb-3">
            Join 500+ UK businesses<br />
            <span className="text-echo-400">reaching Net Zero faster</span>
          </h2>
          <p className="text-carbon-400 text-base leading-relaxed mb-10">
            EchoChain gives your sustainability team an AI-powered carbon intelligence platform — from hotspot detection to actionable reduction plans.
          </p>
          <ul className="space-y-4" aria-label="Platform features">
            {PERKS.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl bg-echo-500/12 border border-echo-500/20 flex items-center justify-center" aria-hidden="true">
                  <Icon className="w-4 h-4 text-echo-400" />
                </span>
                <span className="text-sm text-carbon-300 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: testimonial */}
        <div className="relative p-5 rounded-2xl bg-carbon-900/60 border border-carbon-800 backdrop-blur-sm">
          <div className="flex gap-0.5 mb-3" aria-label="5 stars">
            {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />)}
          </div>
          <p className="text-sm text-carbon-300 italic leading-relaxed mb-4">
            "Setup took 20 minutes. Within a week we had a full heatmap of our UK operations. The AI recommendations justified the subscription in month one."
          </p>
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/id/1027/80/80" alt="Rachel Torres" className="w-9 h-9 rounded-full object-cover border-2 border-carbon-700" loading="lazy" />
            <div>
              <div className="text-sm font-semibold text-white">Rachel Torres</div>
              <div className="text-xs text-carbon-500">ESG Officer, LayerStack</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8 w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">EchoChain</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight">Create your account</h1>
            <p className="text-carbon-400 text-sm mt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-echo-400 hover:text-echo-300 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Company name */}
            <div>
              <label htmlFor="company_name" className="label">Company Name</label>
              <input
                id="company_name" type="text" autoComplete="organization"
                className={`input-field ${errors.company_name ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="GreenLogistics UK Ltd"
                value={form.company_name} onChange={set('company_name')}
              />
              {errors.company_name && <p className="mt-1.5 text-xs text-red-400">{errors.company_name}</p>}
            </div>

            {/* Company Email */}
            <div>
              <label htmlFor="email" className="label">Company Email</label>
              <input
                id="email" type="email" autoComplete="email"
                className={`input-field ${errors.email ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="info@company.co.uk"
                value={form.email} onChange={set('email')}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Company Phone */}
            <div>
              <label htmlFor="company_phone" className="label">Company Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon-500 pointer-events-none" />
                <input
                  id="company_phone" type="tel" autoComplete="tel"
                  className={`input-field pl-10 ${errors.company_phone ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="+44 20 7946 0958"
                  value={form.company_phone} onChange={set('company_phone')}
                />
              </div>
              {errors.company_phone && <p className="mt-1.5 text-xs text-red-400">{errors.company_phone}</p>}
            </div>

            {/* Company Address */}
            <div>
              <label htmlFor="company_address" className="label">Company Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-carbon-500 pointer-events-none" />
                <textarea
                  id="company_address" autoComplete="street-address" rows={2}
                  className={`input-field pl-10 resize-none ${errors.company_address ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="12 Green Lane, Manchester, M1 1AA"
                  value={form.company_address} onChange={set('company_address')}
                />
              </div>
              {errors.company_address && <p className="mt-1.5 text-xs text-red-400">{errors.company_address}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                  className={`input-field pr-11 ${errors.password ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={set('password')}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-carbon-500 hover:text-carbon-300 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5" aria-label={`Password strength: ${STRENGTH_LABEL[strength]}`}>
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLOR[strength] : 'bg-carbon-800'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${STRENGTH_TEXT[strength]}`}>{STRENGTH_LABEL[strength]} password</p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="label">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm" type={showCfm ? 'text' : 'password'} autoComplete="new-password"
                  className={`input-field pr-11 ${errors.confirm ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : form.confirm && form.confirm === form.password ? 'border-echo-600/50' : ''}`}
                  placeholder="Re-enter your password"
                  value={form.confirm} onChange={set('confirm')}
                />
                <button type="button" onClick={() => setShowCfm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-carbon-500 hover:text-carbon-300 transition-colors"
                  aria-label={showCfm ? 'Hide confirm password' : 'Show confirm password'}>
                  {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirm && form.confirm === form.password && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2" aria-label="Passwords match">
                    <Check className="w-4 h-4 text-echo-400" />
                  </span>
                )}
              </div>
              {errors.confirm && <p className="mt-1.5 text-xs text-red-400">{errors.confirm}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox" className="sr-only"
                    checked={form.agreed} onChange={set('agreed')}
                    aria-label="Agree to terms and privacy policy"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    form.agreed ? 'bg-echo-600 border-echo-600' : 'border-carbon-600 bg-carbon-900 group-hover:border-carbon-500'
                  }`}>
                    {form.agreed && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
                  </div>
                </div>
                <span className="text-sm text-carbon-400 leading-snug">
                  I agree to EchoChain's{' '}
                  <button type="button" className="text-echo-400 hover:text-echo-300 underline underline-offset-2 transition-colors">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-echo-400 hover:text-echo-300 underline underline-offset-2 transition-colors">Privacy Policy</button>
                </span>
              </label>
              {errors.agreed && <p className="mt-1.5 text-xs text-red-400">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base mt-2 shadow-lg shadow-echo-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : <><ArrowRight className="w-4 h-4" /> Create Free Account</>
              }
            </button>
          </form>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-7 flex-wrap text-xs text-carbon-600 font-medium">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-carbon-600" />GDPR compliant</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-carbon-600" />No credit card</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-carbon-600" />Setup in 30 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
