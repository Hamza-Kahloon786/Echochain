import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Leaf, Check, X, ArrowRight, Zap, Shield, Star,
  Loader2, Building2, HelpCircle, Menu, ChevronDown,
  Calendar, Mail, Phone, Linkedin, Globe,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'About',         path: '/about' },
  { label: 'Services',      path: '/services' },
  { label: 'Tech Services', path: '/tech-services' },
  { label: 'Pricing',       path: '/pricing', active: true },
  { label: 'Blog',          path: '/blog' },
  { label: 'Contact',       path: '/contact' },
];

const TECH_SERVICES = [
  {
    name: 'Carbon Baseline Assessment',
    includes: 'Full emissions calculation, hotspot map, written report, 1-hour presentation',
    price: '£1,500',
    type: 'One-off',
    path: '/tech-services',
  },
  {
    name: 'SECR Report Preparation',
    includes: 'Full baseline plus SECR-compliant report ready for Companies House submission',
    price: '£2,500',
    type: 'Annual',
    path: '/tech-services',
  },
  {
    name: 'Net Zero Roadmap',
    includes: 'SECR report plus 12-month reduction roadmap and quarterly check-ins',
    price: '£3,500',
    type: 'One-off',
    path: '/tech-services',
  },
  {
    name: 'Ongoing Management',
    includes: 'Monthly data updates, quarterly reports and strategy calls',
    price: '£500/month',
    type: 'Monthly',
    path: '/tech-services',
  },
  {
    name: 'Enterprise',
    includes: 'Multi-site, white-label, API integration — custom pricing',
    price: 'Contact us',
    type: 'Custom',
    path: '/tech-services',
  },
];

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No long-term contracts, no cancellation fees on the Starter plan. You can cancel at any time from your account settings.',
  },
  {
    q: 'What is the difference between software and tech services?',
    a: 'Software: You use ChainscopeAI yourself — self-service, automated, from £49/month. Tech Services: We implement and manage everything for you — data collection, calculations, reports, and strategy. Ideal for businesses without internal resource.',
  },
  {
    q: 'Can I combine software and tech services?',
    a: 'Yes — most clients use our tech services to get started and then manage the platform themselves. We offer a discounted tech services rate for active software subscribers.',
  },
];

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [billing,   setBilling]   = useState('monthly'); // weekly | monthly | yearly
  const [loadingId, setLoadingId] = useState(null);
  const [openFaq,   setOpenFaq]   = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const handleStarterCheckout = async () => {
    if (!isAuthenticated) { navigate('/signup'); return; }
    setLoadingId('starter');
    try {
      const res = await api.post('/payments/create-checkout', {
        plan: 'starter',
        billing: billing === 'yearly' ? 'yearly' : 'monthly',
      }, { timeout: 15000 });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start checkout. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const starterPrice = { weekly: '£19/wk', monthly: '£49/mo', yearly: '£499/yr' }[billing];
  const starterSub   = { weekly: 'per week', monthly: 'per month', yearly: 'per year — best value' }[billing];

  return (
    <div style={{ background: '#0f1117', color: '#e4e4ec', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-500 ${navScrolled ? 'bg-[#0f1117]/90 backdrop-blur-xl border-b border-carbon-800 shadow-xl shadow-black/30' : 'bg-[#0f1117]/90 backdrop-blur-xl border-b border-carbon-800/60'}`}>
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group" aria-label="ChainscopeAI home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center shadow-lg shadow-echo-900/40 group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ChainscopeAI</span>
          </button>

          <ul className="hidden lg:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ label, path, active }) => (
              <li key={label}>
                <button onClick={() => navigate(path)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-echo-400 bg-echo-500/10 border border-echo-500/20'
                      : 'text-carbon-400 hover:text-white hover:bg-carbon-800/60'
                  }`}>
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={() => navigate('/app')}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200">
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={() => navigate('/signup')}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200 shadow-lg shadow-echo-900/40">
                Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-carbon-400 hover:bg-carbon-800 transition-colors" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE OVERLAY ── */}
      <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(15,17,23,0.98)', backdropFilter: 'blur(24px)' }}
        role="dialog" aria-modal="true">
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 w-11 h-11 rounded-full bg-carbon-800 flex items-center justify-center text-carbon-300 hover:bg-carbon-700 transition-colors" aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
        <nav>
          {NAV_LINKS.map(({ label, path }) => (
            <button key={label} onClick={() => { navigate(path); setMobileOpen(false); }}
              className="block text-3xl font-bold text-carbon-300 hover:text-white transition-colors py-3 px-8">
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-6">
          <button onClick={() => { navigate('/signup'); setMobileOpen(false); }}
            className="flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24 pt-[72px]">

        {/* ── HEADER ── */}
        <div className="text-center pt-16 pb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Zap className="w-3 h-3" /> Transparent Pricing
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4">
            Simple pricing. Serious capability.<br />
            <span style={{ background: 'linear-gradient(135deg, #14d15e 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              No hidden fees.
            </span>
          </h1>
          <p className="text-carbon-400 text-lg max-w-xl mx-auto">
            Start with a demo, subscribe when ready. Flexible billing options to suit your business.
          </p>
        </div>

        {/* ── SOFTWARE PLANS ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl font-black text-white">Software Subscription</h2>

            {/* Billing toggle — 3-way */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-carbon-900 border border-carbon-800">
              {[
                { key: 'weekly',  label: 'Weekly' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'yearly',  label: 'Annual', badge: 'Best value' },
              ].map(({ key, label, badge }) => (
                <button key={key} onClick={() => setBilling(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    billing === key ? 'bg-carbon-700 text-white shadow' : 'text-carbon-400 hover:text-carbon-200'
                  }`}>
                  {label}
                  {badge && <span className="px-1.5 py-0.5 rounded-md bg-echo-500/20 text-echo-400 text-[10px] font-bold tracking-wide">{badge}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* FREE / DEMO */}
            <div className="relative flex flex-col rounded-2xl border border-carbon-800 bg-carbon-900/70 backdrop-blur-sm p-7 transition-all duration-300 hover:border-carbon-700 hover:shadow-2xl hover:shadow-black/40">
              <div className="mb-5">
                <h3 className="text-xl font-black text-white mb-1.5">Book a Demo</h3>
                <p className="text-sm text-carbon-400 leading-relaxed">See the platform live before committing. 30-minute guided walkthrough with our team.</p>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black text-white">Free</span>
                </div>
                <p className="text-xs text-carbon-500 mt-1">No credit card required</p>
              </div>
              <a href="mailto:info@chainscopeai.co.uk?subject=Demo%20Request"
                className="w-full flex items-center justify-center gap-2 py-3 mb-7 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                <Calendar className="w-4 h-4" /> Book a Demo
              </a>
              <ul className="space-y-2.5 mt-auto">
                {['Live platform walkthrough', 'Tailored to your industry', 'Q&A with our team', 'No obligation to proceed'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-carbon-300">
                    <Check className="w-4 h-4 text-echo-400 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* STARTER — RECOMMENDED */}
            <div className="relative flex flex-col rounded-2xl border-2 border-echo-500/60 backdrop-blur-sm p-7 ring-1 ring-echo-500/30 shadow-xl shadow-echo-950/30 transition-all duration-300 hover:shadow-2xl hover:shadow-echo-900/20"
              style={{ background: 'rgba(20,209,94,0.04)' }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-white text-xs font-bold tracking-wide shadow-lg flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                  <Star className="w-3 h-3 fill-white" /> Recommended
                </span>
              </div>

              <div className="mb-5">
                <h3 className="text-xl font-black text-white mb-1.5">Starter</h3>
                <p className="text-sm text-carbon-400 leading-relaxed">Full platform access. Unlimited suppliers. Everything you need to manage carbon compliance.</p>
              </div>

              <div className="mb-2">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black text-white">{starterPrice}</span>
                </div>
                <p className="text-xs text-echo-500 font-semibold mt-1">{starterSub}</p>
              </div>

              {/* All three prices shown */}
              <div className="flex items-center gap-2 flex-wrap mb-6">
                {[
                  { key: 'weekly',  label: '£19/wk' },
                  { key: 'monthly', label: '£49/mo' },
                  { key: 'yearly',  label: '£499/yr' },
                ].map(({ key, label }) => (
                  <span key={key}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border cursor-pointer transition-all duration-200 ${
                      billing === key
                        ? 'bg-echo-500/20 border-echo-500/40 text-echo-300'
                        : 'bg-carbon-800/60 border-carbon-700 text-carbon-500 hover:border-carbon-600'
                    }`}
                    onClick={() => setBilling(key)}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <button
                onClick={handleStarterCheckout}
                disabled={loadingId === 'starter'}
                className="w-full flex items-center justify-center gap-2 py-3 mb-7 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}
              >
                {loadingId === 'starter'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                  : <>Start Free Trial <ArrowRight className="w-4 h-4" /></>
                }
              </button>

              <ul className="space-y-2.5 mt-auto">
                {[
                  'Unlimited suppliers, warehouses & routes',
                  'Scope 1, 2 & 3 automatic calculation',
                  'One-click SECR report generation',
                  'ML emissions forecasting (6–24 months)',
                  'Live National Grid carbon intensity',
                  'AI reduction recommendations',
                  'Email support',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-carbon-200">
                    <Check className="w-4 h-4 text-echo-400 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
            </div>

            {/* ENTERPRISE */}
            <div className="relative flex flex-col rounded-2xl border border-carbon-800 bg-carbon-900/70 backdrop-blur-sm p-7 transition-all duration-300 hover:border-carbon-700 hover:shadow-2xl hover:shadow-black/40">
              <div className="mb-5">
                <h3 className="text-xl font-black text-white mb-1.5">Enterprise</h3>
                <p className="text-sm text-carbon-400 leading-relaxed">Multi-site, white-label, and fully custom deployments for larger organisations.</p>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black text-white">Custom</span>
                </div>
                <p className="text-xs text-carbon-500 mt-1">Contact us for a quote</p>
              </div>
              <a href="mailto:info@chainscopeai.co.uk?subject=Enterprise%20Enquiry"
                className="w-full flex items-center justify-center gap-2 py-3 mb-7 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                Contact Us <ArrowRight className="w-4 h-4" />
              </a>
              <ul className="space-y-2.5 mt-auto">
                {[
                  'White-label with your branding',
                  'API access and custom integrations',
                  'Dedicated account manager',
                  'Custom data pipelines',
                  'Training for your team',
                  'SLA guarantee',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-carbon-300">
                    <Check className="w-4 h-4 text-echo-400 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── TRUST STRIP ── */}
        <div className="flex items-center justify-center gap-8 flex-wrap py-10 border-t border-b border-carbon-800/50 my-14 text-sm text-carbon-500">
          {[
            [Shield, 'ISO 27001 Certified'],
            [Zap,    'DEFRA 2024 Compliant'],
            [Star,   'IEEE Research Backed'],
            [Building2, 'Co. No. 17256706'],
          ].map(([Icon, text]) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-echo-600" />{text}
            </span>
          ))}
        </div>

        {/* ── TECH SERVICES PRICING TABLE ── */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Tech Services Pricing</h2>
              <p className="text-carbon-500 text-sm">Fully managed carbon compliance — we do everything for you.</p>
            </div>
            <button onClick={() => navigate('/tech-services')}
              className="flex items-center gap-1.5 text-sm font-semibold text-echo-400 hover:text-echo-300 transition-colors">
              Full service details <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-carbon-800 overflow-hidden">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }} className="border-b border-carbon-800">
                  <th className="text-left py-4 px-6 text-carbon-400 font-semibold">Service Package</th>
                  <th className="text-left py-4 px-6 text-carbon-400 font-semibold hidden md:table-cell">What is included</th>
                  <th className="text-left py-4 px-6 text-carbon-400 font-semibold hidden sm:table-cell">Type</th>
                  <th className="text-right py-4 px-6 text-carbon-400 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {TECH_SERVICES.map((svc, i) => (
                  <tr key={svc.name}
                    className={`border-b border-carbon-800/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white text-sm">{svc.name}</span>
                    </td>
                    <td className="py-4 px-6 text-carbon-500 text-xs leading-relaxed hidden md:table-cell max-w-xs">
                      {svc.includes}
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-carbon-800 border border-carbon-700 text-carbon-400">
                        {svc.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {svc.price === 'Contact us' ? (
                        <a href="mailto:info@chainscopeai.co.uk?subject=Enterprise%20Tech%20Services%20Enquiry"
                          className="text-echo-400 hover:text-echo-300 font-semibold text-sm transition-colors">
                          Contact us
                        </a>
                      ) : (
                        <span className="font-black text-white text-sm">{svc.price}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-carbon-600 mt-4 text-center">
            All tech services packages include a scoping call before work begins. No hidden fees. VAT may apply.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-white text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-carbon-800 bg-carbon-900/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 text-carbon-500 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-echo-400' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-carbon-400 leading-relaxed border-t border-carbon-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="relative rounded-2xl overflow-hidden text-center py-14 px-8 border border-carbon-800"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(20,209,94,0.07) 0%, transparent 70%)' }}>
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(20,209,94,0.4),transparent)' }} />
          <h2 className="text-3xl font-black text-white mb-3">Not sure where to start?</h2>
          <p className="text-carbon-400 mb-8 max-w-md mx-auto text-base leading-relaxed">
            Book a free 30-minute discovery call. We will recommend the right option — software, tech services, or both.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a href="mailto:info@chainscopeai.co.uk?subject=Discovery%20Call%20Request"
              className="flex items-center gap-2 px-9 py-4 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)', boxShadow: '0 0 30px rgba(20,209,94,0.25)' }}>
              <Calendar className="w-4 h-4" /> Book a Free Discovery Call
            </a>
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-9 py-4 rounded-xl text-base font-semibold text-carbon-300 hover:text-white transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-carbon-500">
            <a href="mailto:info@chainscopeai.co.uk" className="flex items-center gap-2 hover:text-carbon-300 transition-colors">
              <Mail className="w-4 h-4" /> info@chainscopeai.co.uk
            </a>
            <a href="tel:+447448781708" className="flex items-center gap-2 hover:text-carbon-300 transition-colors">
              <Phone className="w-4 h-4" /> +44 7448 781708
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-carbon-800/60 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-carbon-600">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-carbon-500">ChainscopeAI</span>
            </div>
            <div className="space-y-1">
              <p>Chainscope AI Ltd — Company No. 17256706 — Registered in England and Wales</p>
              <p>Registered Office: Worcester, United Kingdom &nbsp;|&nbsp; info@chainscopeai.co.uk &nbsp;|&nbsp; +44 7448 781708</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com/company/chainscopeai" target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 transition-all duration-200">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:info@chainscopeai.co.uk"
                className="w-8 h-8 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 transition-all duration-200">
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a href="https://chainscopeai.com"
                className="w-8 h-8 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 transition-all duration-200">
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-carbon-800/60 text-xs text-carbon-700 text-center">
            Copyright © {new Date().getFullYear()} Chainscope AI Ltd. All rights reserved. &nbsp;|&nbsp; GDPR Compliant &nbsp;|&nbsp; ISO 27001 Certified &nbsp;|&nbsp; DEFRA 2024 Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
