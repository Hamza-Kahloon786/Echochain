import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Leaf, Check, X, ArrowRight, Zap, Shield, Star,
  Loader2, Building2, Users, HelpCircle,
} from 'lucide-react';

/* ── Plan data ──────────────────────────────────────────────────── */
const PLANS = [
  {
    id:       'starter',
    name:     'Starter',
    badge:    null,
    desc:     'Perfect for small businesses beginning their Net Zero journey.',
    monthly:  49,
    yearly:   39,
    color:    'border-carbon-700',
    btnClass: 'btn-secondary',
    features: [
      { text: 'Up to 50 suppliers',         ok: true  },
      { text: 'Carbon hotspot detection',   ok: true  },
      { text: '12-month forecasting',       ok: true  },
      { text: 'Live UK Grid intensity',     ok: true  },
      { text: '2 team members',             ok: true  },
      { text: 'Email support',              ok: true  },
      { text: 'AI recommendations',         ok: false },
      { text: 'PDF intelligence',           ok: false },
      { text: 'API access',                 ok: false },
      { text: 'Custom integrations',        ok: false },
    ],
  },
  {
    id:       'pro',
    name:     'Pro',
    badge:    'Most Popular',
    desc:     'For growing teams that need deeper AI insights and full automation.',
    monthly:  149,
    yearly:   119,
    color:    'border-echo-500/60',
    btnClass: 'btn-primary',
    features: [
      { text: 'Up to 500 suppliers',        ok: true  },
      { text: 'Carbon hotspot detection',   ok: true  },
      { text: '12-month forecasting',       ok: true  },
      { text: 'Live UK Grid intensity',     ok: true  },
      { text: '10 team members',            ok: true  },
      { text: 'Priority support',           ok: true  },
      { text: 'AI recommendations',         ok: true  },
      { text: 'PDF intelligence',           ok: true  },
      { text: 'API access',                 ok: true  },
      { text: 'Custom integrations',        ok: false },
    ],
  },
  {
    id:       'enterprise',
    name:     'Enterprise',
    badge:    null,
    desc:     'Unlimited scale, dedicated support, and bespoke integrations.',
    monthly:  null,
    yearly:   null,
    color:    'border-carbon-700',
    btnClass: 'btn-secondary',
    features: [
      { text: 'Unlimited suppliers',        ok: true  },
      { text: 'Carbon hotspot detection',   ok: true  },
      { text: '12-month forecasting',       ok: true  },
      { text: 'Live UK Grid intensity',     ok: true  },
      { text: 'Unlimited team members',     ok: true  },
      { text: 'Dedicated account manager',  ok: true  },
      { text: 'AI recommendations',         ok: true  },
      { text: 'PDF intelligence',           ok: true  },
      { text: 'API access',                 ok: true  },
      { text: 'Custom integrations',        ok: true  },
    ],
  },
];

const FAQS = [
  {
    q: 'Can I change plans at any time?',
    a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.',
  },
  {
    q: 'Is there a free trial?',
    a: 'All paid plans include a 14-day free trial. No credit card required to start — we only charge after the trial ends.',
  },
  {
    q: 'How are suppliers counted?',
    a: 'A supplier is any organisation you add under the Suppliers tab. Warehouses and transport routes are not counted against the supplier limit.',
  },
  {
    q: 'What emission factors do you use?',
    a: 'EchoChain uses DEFRA 2024 conversion factors for all UK-based calculations, updated automatically when new factors are published.',
  },
  {
    q: 'Do you offer discounts for charities or non-profits?',
    a: 'Yes — contact us at pricing@echochain.uk with proof of charitable status and we\'ll apply a 40% discount.',
  },
];

/* ── Component ──────────────────────────────────────────────────── */
export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [billing,    setBilling]    = useState('monthly'); // monthly | yearly
  const [loadingId,  setLoadingId]  = useState(null);
  const [openFaq,    setOpenFaq]    = useState(null);

  const handleChoosePlan = async (plan) => {
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:sales@echochain.uk?subject=Enterprise Enquiry';
      return;
    }

    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    setLoadingId(plan.id);
    try {
      const res = await api.post('/payments/create-checkout', {
        plan:    plan.id,
        billing: billing,
      }, { timeout: 15000 });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start checkout. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const yearlyDiscount = Math.round(((149 - 119) / 149) * 100); // Pro discount %

  return (
    <div style={{ background: '#0f1117', color: '#e4e4ec', minHeight: '100vh' }}>

      {/* ── NAVBAR (minimal) ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 h-[68px] flex items-center border-b border-carbon-800/60 bg-[#0f1117]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">EchoChain</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/app" className="btn-secondary text-sm px-4 py-2">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login"  className="text-sm text-carbon-400 hover:text-white transition-colors px-3 py-2">Sign In</Link>
                <Link to="/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-24">

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="text-center pt-16 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/8 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Zap className="w-3 h-3" /> Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white leading-tight mb-4">
            Choose your plan
          </h1>
          <p className="text-carbon-400 text-lg max-w-xl mx-auto mb-10">
            Start free for 14 days. No credit card required. Cancel any time.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-carbon-900 border border-carbon-800">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                billing === 'monthly'
                  ? 'bg-carbon-700 text-white shadow'
                  : 'text-carbon-400 hover:text-carbon-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-carbon-700 text-white shadow'
                  : 'text-carbon-400 hover:text-carbon-200'
              }`}
            >
              Yearly
              <span className="px-1.5 py-0.5 rounded-md bg-echo-500/20 text-echo-400 text-[10px] font-bold tracking-wide">
                -{yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>

        {/* ── PLAN CARDS ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => {
            const price   = billing === 'yearly' ? plan.yearly : plan.monthly;
            const isBusy  = loadingId === plan.id;
            const isPro   = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border-2 ${plan.color} bg-carbon-900/70 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 ${
                  isPro ? 'ring-1 ring-echo-500/30 shadow-xl shadow-echo-950/30' : ''
                }`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-echo-600 text-white text-xs font-bold tracking-wide shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Plan name */}
                  <div className="mb-5">
                    <h2 className="text-xl font-black text-white mb-1.5">{plan.name}</h2>
                    <p className="text-sm text-carbon-400 leading-relaxed">{plan.desc}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {price !== null ? (
                      <div className="flex items-end gap-1.5">
                        <span className="text-4xl font-black text-white">£{price}</span>
                        <span className="text-carbon-500 text-sm mb-1.5">/mo</span>
                        {billing === 'yearly' && (
                          <span className="ml-2 mb-1.5 text-xs font-semibold text-echo-400">
                            billed yearly
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-4xl font-black text-white">Custom</div>
                    )}
                    {price !== null && (
                      <p className="text-xs text-carbon-500 mt-1">
                        14-day free trial included
                      </p>
                    )}
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={() => handleChoosePlan(plan)}
                    disabled={isBusy}
                    className={`${plan.btnClass} w-full flex items-center justify-center gap-2 py-3 mb-7 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isBusy ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                    ) : plan.id === 'enterprise' ? (
                      <>Contact Sales <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Start Free Trial <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  {/* Feature list */}
                  <ul className="space-y-3 mt-auto">
                    {plan.features.map((f) => (
                      <li key={f.text} className={`flex items-start gap-3 text-sm ${f.ok ? 'text-carbon-200' : 'text-carbon-600'}`}>
                        <span className="mt-0.5 flex-shrink-0">
                          {f.ok
                            ? <Check className="w-4 h-4 text-echo-400" />
                            : <X    className="w-4 h-4 text-carbon-700" />
                          }
                        </span>
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TRUST STRIP ───────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-8 flex-wrap py-10 border-t border-b border-carbon-800/50 mb-16 text-sm text-carbon-500">
          {[
            [Shield, 'SOC 2 Type II certified'],
            [Zap,    'DEFRA 2024 compliant'],
            [Users,  '500+ UK businesses'],
            [Star,   '98% satisfaction rate'],
          ].map(([Icon, text]) => (
            <span key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-echo-500" />
              {text}
            </span>
          ))}
        </div>

        {/* ── COMPARISON TABLE ──────────────────────────────────── */}
        <div className="mb-20">
          <h2 className="text-3xl font-black text-white text-center mb-10">Full feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-carbon-800">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-carbon-800 bg-carbon-900/80">
                  <th className="text-left py-4 px-6 text-carbon-400 font-semibold w-1/2">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} className="py-4 px-4 text-center">
                      <span className={`font-bold ${p.id === 'pro' ? 'text-echo-400' : 'text-white'}`}>{p.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Suppliers',           ['50',       '500',           'Unlimited']],
                  ['Team members',        ['2',        '10',            'Unlimited']],
                  ['Hotspot detection',   [true,        true,            true]],
                  ['Emissions forecasting',[true,       true,            true]],
                  ['Live UK Grid',        [true,        true,            true]],
                  ['AI recommendations',  [false,       true,            true]],
                  ['PDF intelligence',    [false,       true,            true]],
                  ['API access',          [false,       true,            true]],
                  ['Custom integrations', [false,       false,           true]],
                  ['Dedicated manager',   [false,       false,           true]],
                  ['SLA guarantee',       [false,       false,           true]],
                  ['Support',             ['Email',    'Priority email', 'Dedicated']],
                ].map(([label, values], ri) => (
                  <tr key={label} className={`border-b border-carbon-800/50 ${ri % 2 === 0 ? '' : 'bg-carbon-900/30'}`}>
                    <td className="py-3.5 px-6 text-carbon-300 font-medium">{label}</td>
                    {values.map((v, ci) => (
                      <td key={ci} className="py-3.5 px-4 text-center">
                        {typeof v === 'boolean' ? (
                          v ? <Check className="w-4 h-4 text-echo-400 mx-auto" />
                            : <X     className="w-4 h-4 text-carbon-700 mx-auto" />
                        ) : (
                          <span className={`text-sm font-semibold ${ci === 1 ? 'text-echo-400' : 'text-carbon-200'}`}>{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ ───────────────────────────────────────────────── */}
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
                  <HelpCircle className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${openFaq === i ? 'text-echo-400' : 'text-carbon-600'}`} />
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

        {/* ── BOTTOM CTA ────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden text-center py-14 px-8 border border-carbon-800"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(20,209,94,0.08) 0%, transparent 70%)' }}>
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(20,209,94,0.4),transparent)' }} />
          <Building2 className="w-10 h-10 text-echo-500/40 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-3">Need a custom plan?</h2>
          <p className="text-carbon-400 mb-7 max-w-md mx-auto">
            Large supply chains, government bodies, or multi-entity groups — talk to us about a tailored solution.
          </p>
          <a href="mailto:sales@echochain.uk" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
            Contact Sales <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
