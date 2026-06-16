import { useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, Menu, X, Linkedin, Mail, Globe, Check,
  BarChart3, Zap, Map, FileText, TrendingUp, Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const SERVICES = [
  {
    number: '01',
    Icon: BarChart3,
    color: 'echo',
    title: 'Scope 1, 2 & 3 Emissions Tracking',
    headline: 'Your entire carbon footprint — calculated automatically.',
    body: `Automatically calculate your entire carbon footprint using official DEFRA 2024 emission conversion factors. No manual spreadsheets. No guesswork.`,
    bullets: [
      'Scope 1 — Direct emissions from your own operations and vehicles',
      'Scope 2 — Indirect emissions from purchased electricity and energy',
      'Scope 3 — Supply chain emissions from all suppliers and transport routes',
    ],
    detail: 'Calculated automatically and continuously as your supply chain data is updated — not once a year when your consultant visits.',
    badge: 'DEFRA 2024 Compliant',
  },
  {
    number: '02',
    Icon: Zap,
    color: 'cyan',
    title: 'Live National Grid Integration',
    headline: 'Real-time grid carbon intensity — updated every 30 minutes.',
    body: `The only carbon platform integrating live carbon intensity data from the National Grid ESO API, updated every 30 minutes.`,
    bullets: [
      'Real-time electricity emissions calculated at actual grid intensity',
      'Not outdated annual averages — live data from National Grid ESO',
      'Materially more accurate for businesses with significant electricity or EV fleets',
    ],
    detail: 'For businesses with significant electricity consumption or electric vehicles, this delivers materially more accurate carbon calculations than any static emission factor.',
    badge: 'National Grid ESO API',
  },
  {
    number: '03',
    Icon: Map,
    color: 'blue',
    title: 'Carbon Hotspot Map',
    headline: 'See exactly where your emissions are coming from — geographically.',
    body: `Our interactive Google Maps-powered map shows every supplier, warehouse, and transport route in your supply chain, colour-coded by carbon intensity.`,
    bullets: [
      'Every supplier, warehouse, and transport route plotted on the map',
      'Colour-coded by carbon intensity — hotspots visible at a glance',
      'Click any node to drill into granular Scope 1, 2, and 3 data',
    ],
    detail: 'Identify your highest-risk nodes at a glance and prioritise reduction efforts for maximum impact — instead of wading through spreadsheets to find where to act.',
    badge: 'Google Maps Powered',
  },
  {
    number: '04',
    Icon: FileText,
    color: 'purple',
    title: 'SECR Report Generation',
    headline: 'One click. Fully compliant SECR report. Ready to submit.',
    body: `Generate a fully compliant Streamlined Energy and Carbon Reporting report with one click. Our GPT-4o AI formats your emissions data into the exact structure required by regulatory authorities and your auditors.`,
    bullets: [
      'Methodology statements and emission factor references included',
      'Year-on-year comparison tables auto-generated',
      'UK ETS compliant formatting built in',
    ],
    detail: 'What previously took consultants weeks now takes seconds. Download as PDF and submit directly to your auditors or include in your annual report.',
    badge: 'GPT-4o Powered',
  },
  {
    number: '05',
    Icon: TrendingUp,
    color: 'amber',
    title: 'ML Emissions Forecasting',
    headline: 'See where you are heading — before you get there.',
    body: `Our RandomForest machine learning model analyses your historical emissions data and forecasts your trajectory 6 to 24 months ahead.`,
    bullets: [
      '6 to 24 month emissions forecasting with confidence intervals',
      'Identifies seasonal patterns and growth-related emission risks',
      'Models the projected impact of specific reduction initiatives',
    ],
    detail: 'Stop reacting to emissions data after the fact. Use predictive intelligence to plan interventions before your trajectory breaches regulatory thresholds or customer requirements.',
    badge: 'RandomForest ML',
  },
  {
    number: '06',
    Icon: Lightbulb,
    color: 'rose',
    title: 'AI Reduction Recommendations',
    headline: 'Not just measurement — a ranked action plan for reduction.',
    body: `ChainscopeAI does not just measure your emissions — it tells you what to do about them. Our AI generates a prioritised list of reduction recommendations, ranked by impact and feasibility.`,
    bullets: [
      'Recommendations specific to your business data — not generic advice',
      'Quantified in tonnes of CO₂ so you can evaluate business cases',
      'Ranked by impact and feasibility — highest ROI actions first',
    ],
    detail: 'Each recommendation links directly back to your hotspot data so you can trace the logic, share it with your team, and track progress as you implement changes.',
    badge: 'AI Prioritised',
  },
];

const COLOR_MAP = {
  echo:   { icon: 'text-echo-400',   bg: 'bg-echo-500/10',   border: 'border-echo-500/20',   num: 'text-echo-600'   },
  cyan:   { icon: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   num: 'text-cyan-700'   },
  blue:   { icon: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   num: 'text-blue-700'   },
  purple: { icon: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', num: 'text-purple-700' },
  amber:  { icon: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  num: 'text-amber-700'  },
  rose:   { icon: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   num: 'text-rose-700'   },
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="overflow-x-hidden" style={{ background: '#0f1117', color: '#e4e4ec' }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-500 ${navScrolled ? 'bg-[#0f1117]/90 backdrop-blur-xl border-b border-carbon-800 shadow-xl shadow-black/30' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group" aria-label="ChainscopeAI home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center shadow-lg shadow-echo-900/40 group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ChainscopeAI</span>
          </button>

          <ul className="hidden lg:flex items-center gap-1" role="list">
            {[
              { label: 'Home',          path: '/' },
              { label: 'About',         path: '/about' },
              { label: 'Services',      path: '/services', active: true },
              { label: 'Tech Services', path: '/tech-services' },
              { label: 'Pricing',       path: '/pricing' },
              { label: 'Blog',          path: '/blog' },
              { label: 'Contact',       path: '/contact' },
            ].map(({ label, path, active }) => (
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
            <button onClick={() => navigate('/signup')}
              className="hidden sm:flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200 shadow-lg shadow-echo-900/40">
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
          {[
            { label: 'Home',          path: '/' },
            { label: 'About',         path: '/about' },
            { label: 'Services',      path: '/services' },
            { label: 'Tech Services', path: '/tech-services' },
            { label: 'Pricing',       path: '/pricing' },
            { label: 'Blog',          path: '/blog' },
            { label: 'Contact',       path: '/contact' },
          ].map(({ label, path }) => (
            <button key={label} onClick={() => { navigate(path); setMobileOpen(false); }}
              className="block text-3xl font-bold text-carbon-300 hover:text-white transition-colors py-3 px-8">
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-6">
          <button onClick={() => { navigate('/signup'); setMobileOpen(false); }}
            className="flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── PAGE HERO ── */}
      <section className="relative pt-[72px] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '0%', left: '10%', width: '700px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,209,94,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: '0%', right: '5%', width: '500px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <BarChart3 className="w-3 h-3" /> Platform Services
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.1] text-white max-w-3xl mx-auto mb-6">
            Everything you need for carbon compliance —{' '}
            <span style={{ background: 'linear-gradient(135deg, #14d15e 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              in one platform
            </span>
          </h1>
          <p className="text-carbon-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Six integrated capabilities built on DEFRA 2024 factors, live National Grid data, and enterprise AI — delivered at SME prices.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)', boxShadow: '0 0 24px rgba(20,209,94,0.25)' }}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <a href="mailto:info@chainscopeai.co.uk"
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              Book a Discovery Call
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-6">
        {SERVICES.map((svc, i) => {
          const c = COLOR_MAP[svc.color];
          const isEven = i % 2 === 0;
          return (
            <div
              key={svc.number}
              id={`service-${svc.number}`}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-carbon-800 transition-all duration-300 hover:border-carbon-700`}
              style={{ background: '#13151f' }}
            >
              {/* Content panel */}
              <div className={`p-10 md:p-14 flex flex-col justify-center ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                {/* Number + badge row */}
                <div className="flex items-center gap-3 mb-6">
                  <span className={`text-5xl font-black ${c.num} opacity-40 leading-none`}>{svc.number}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${c.bg} ${c.border} ${c.icon}`}>
                    {svc.badge}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">{svc.title}</h2>
                <p className={`text-base font-semibold mb-4 ${c.icon}`}>{svc.headline}</p>
                <p className="text-carbon-400 text-sm leading-relaxed mb-6">{svc.body}</p>

                <ul className="space-y-2.5 mb-6">
                  {svc.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-carbon-300">
                      <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${c.bg} border ${c.border}`}>
                        <Check className={`w-3 h-3 ${c.icon}`} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-carbon-500 leading-relaxed italic border-l-2 border-carbon-700 pl-4">
                  {svc.detail}
                </p>
              </div>

              {/* Visual panel */}
              <div className={`flex items-center justify-center p-10 md:p-14 min-h-[260px] relative overflow-hidden ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
                style={{ background: 'rgba(255,255,255,0.015)' }}>
                {/* Background glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                  <div className={`w-64 h-64 rounded-full opacity-20 blur-3xl ${c.bg}`} />
                </div>

                {/* Large icon */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center ${c.bg} border ${c.border}`}>
                    <svc.Icon className={`w-12 h-12 ${c.icon}`} />
                  </div>

                  {/* Mini stat chip */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className={`text-4xl font-black ${c.icon}`}>
                      {['£30k', '30 min', '1-click', '100%', '24 mo', 'AI'][i]}
                    </span>
                    <span className="text-xs text-carbon-500 max-w-[160px] leading-relaxed">
                      {[
                        'consultant cost eliminated per year',
                        'live grid updates — not annual averages',
                        'SECR report generation',
                        'automated — no spreadsheets',
                        'emissions forecast horizon',
                        'powered reduction recommendations',
                      ][i]}
                    </span>
                  </div>

                  {/* Three detail pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      ['DEFRA 2024', 'ISO 27001', 'GDPR'],
                      ['ESO API', 'Real-time', '30 min'],
                      ['Google Maps', 'Interactive', 'Scope 3'],
                      ['GPT-4o', 'PDF Export', 'UK ETS'],
                      ['RandomForest', '6-24 months', 'CI bands'],
                      ['Priority ranked', 'CO₂ quantified', 'Actionable'],
                    ][i].map((pill) => (
                      <span key={pill} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg} ${c.icon} border ${c.border}`}>
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="relative py-20 border-t border-carbon-800/40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,209,94,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Ready to get started?
          </h2>
          <p className="text-carbon-400 text-lg mb-8 leading-relaxed">
            Full access to all six services from <strong className="text-white">£49/month</strong> or <strong className="text-white">£499/year</strong>. No consultants. No spreadsheets. No waiting.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-9 py-4 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)', boxShadow: '0 0 30px rgba(20,209,94,0.3)' }}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 px-9 py-4 rounded-xl text-base font-semibold text-carbon-300 hover:text-white transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              View Pricing <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap text-xs text-carbon-500 font-medium">
            {['DEFRA 2024 Compliant', 'ISO 27001 Certified', 'GDPR Compliant', 'Co. No. 17256706'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-echo-600" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

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
              <p>Registered Office: Worcester, United Kingdom &nbsp;|&nbsp; info@chainscopeai.co.uk</p>
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
