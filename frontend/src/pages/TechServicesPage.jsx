import { useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, Menu, X, Linkedin, Mail, Globe, Check,
  Phone, Calendar, Star, Clock, Users, Zap, ChevronRight,
  FileText, TrendingUp, BarChart3, Shield, Building2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const PACKAGES = [
  {
    number: '01',
    Icon: BarChart3,
    title: 'Carbon Baseline Assessment',
    type: 'One-off engagement',
    price: '£1,500',
    priceSub: 'one-off',
    color: 'echo',
    tagColor: 'bg-echo-500/10 border-echo-500/20 text-echo-400',
    summary: 'We access your operational data, set up ChainscopeAI for your business, calculate your full Scope 1, 2 and 3 emissions baseline, and deliver a professional report with your current carbon position and key findings.',
    includes: [
      'Data collection and operational audit',
      'ChainscopeAI platform setup for your business',
      'Full Scope 1, 2 & 3 emissions calculation',
      'Carbon hotspot map of your supply chain',
      'Written professional report with key findings',
      '1-hour presentation of findings',
    ],
    timeline: '5 to 7 working days',
    bestFor: 'Businesses needing a carbon baseline for the first time or ahead of a tender or contract requirement.',
    highlight: false,
  },
  {
    number: '02',
    Icon: FileText,
    title: 'SECR Report Preparation',
    type: 'Annual engagement',
    price: '£2,500',
    priceSub: 'per year',
    color: 'blue',
    tagColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    summary: 'We prepare and deliver your full Streamlined Energy and Carbon Reporting compliant report using ChainscopeAI. Includes data collection, emissions calculation, report generation, and submission guidance.',
    includes: [
      'Everything in Package 01',
      'SECR-formatted report ready for Companies House submission',
      'Methodology statement and emission factor references',
      'Year-on-year comparison tables',
      'Submission guidance and email support',
    ],
    timeline: '10 working days',
    bestFor: 'Businesses with SECR reporting obligations who want a fully managed annual report.',
    highlight: false,
  },
  {
    number: '03',
    Icon: TrendingUp,
    title: 'Net Zero Roadmap',
    type: 'Strategic engagement',
    price: '£3,500',
    priceSub: 'one-off',
    color: 'purple',
    tagColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    summary: 'A full carbon baseline plus a 12-month emissions reduction roadmap with prioritised actions, supplier engagement guidance, and quarterly progress check-ins.',
    includes: [
      'Everything in Package 02',
      '12-month emissions reduction roadmap',
      'Prioritised action plan ranked by impact',
      'Supplier carbon questionnaire and engagement guide',
      'Quarterly review calls',
      'Ongoing email support',
    ],
    timeline: '15 working days for initial delivery',
    bestFor: 'Businesses serious about achieving measurable Net Zero progress with a clear plan and accountability.',
    highlight: true,
  },
  {
    number: '04',
    Icon: Zap,
    title: 'Ongoing Tech Support & Management',
    type: 'Monthly retainer',
    price: '£500',
    priceSub: 'per month',
    color: 'amber',
    tagColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    summary: 'We manage your ChainscopeAI account continuously — updating data, monitoring emissions, generating reports, and providing quarterly strategy sessions.',
    includes: [
      'Monthly data updates and emissions monitoring',
      'Continuous hotspot tracking and alerts',
      'Quarterly SECR progress report',
      'One strategy call per quarter',
      'Priority email support',
    ],
    timeline: 'Ongoing — minimum 3-month commitment',
    bestFor: 'Businesses that want carbon compliance handled completely without any internal resource.',
    highlight: false,
  },
  {
    number: '05',
    Icon: Building2,
    title: 'Enterprise',
    type: 'Custom engagement',
    price: 'Custom',
    priceSub: 'pricing',
    color: 'rose',
    tagColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    summary: 'Multi-site, multi-year engagements for larger organisations. White-label ChainscopeAI with your branding. API integrations with existing systems. Dedicated account management.',
    includes: [
      'Multi-site and multi-year scope',
      'White-label ChainscopeAI with your branding',
      'API integrations with existing ERP or ESG systems',
      'Dedicated account manager',
      'Custom reporting and data pipelines',
    ],
    timeline: 'Scoped per project',
    bestFor: 'Larger organisations requiring bespoke carbon technology solutions at scale.',
    highlight: false,
  },
];

const COLOR_ICON = {
  echo:   'text-echo-400',
  blue:   'text-blue-400',
  purple: 'text-purple-400',
  amber:  'text-amber-400',
  rose:   'text-rose-400',
};

const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'About',         path: '/about' },
  { label: 'Services',      path: '/services' },
  { label: 'Tech Services', path: '/tech-services', active: true },
  { label: 'Pricing',       path: '/pricing' },
  { label: 'Blog',          path: '/blog' },
  { label: 'Contact',       path: '/contact' },
];

export default function TechServicesPage() {
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

      {/* ── PAGE HERO ── */}
      <section className="relative pt-[72px] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '0%', left: '15%', width: '700px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,209,94,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: '0%', right: '10%', width: '500px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Users className="w-3 h-3" /> Managed Carbon Tech Services
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.1] text-white mb-6">
            Expert carbon technology —{' '}
            <span style={{ background: 'linear-gradient(135deg, #14d15e 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              we build and manage it for you
            </span>
          </h1>

          {/* Intro */}
          <div className="max-w-3xl mx-auto space-y-4 text-left md:text-center mb-10">
            <p className="text-carbon-400 text-base md:text-lg leading-relaxed">
              Not every business has the time or resource to manage carbon compliance internally.{' '}
              <strong className="text-carbon-200">Chainscope AI Ltd</strong> offers a fully managed carbon technology service — we implement, integrate, and automate your carbon management using ChainscopeAI, so you can focus on running your business.
            </p>
            <p className="text-carbon-500 text-sm md:text-base leading-relaxed">
              Our tech services combines the power of AI-driven carbon intelligence with expert technical guidance from a Chemical Engineering researcher with published IEEE research in industrial decarbonisation.
            </p>
          </div>

          {/* Trust chips */}
          <div className="flex items-center justify-center gap-x-5 gap-y-2 flex-wrap text-xs text-carbon-500 font-medium">
            {['IEEE Research Backed', 'Chemical Engineering Expert', 'DEFRA 2024 Compliant', 'GDPR Compliant', 'ISO 27001 Certified'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-echo-600 flex-shrink-0" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="border-t border-carbon-800/40 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Choose your service package</h2>
            <p className="text-carbon-500 text-base">Fixed pricing. No hidden fees. Professional delivery guaranteed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {PACKAGES.map((pkg) => {
              const iconColor = COLOR_ICON[pkg.color];
              return (
                <div
                  key={pkg.number}
                  className={`relative flex flex-col rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 ${
                    pkg.highlight
                      ? 'border-echo-500/40 shadow-lg shadow-echo-900/20'
                      : 'border-carbon-800 hover:border-carbon-700'
                  }`}
                  style={{ background: pkg.highlight ? 'rgba(20,209,94,0.04)' : '#13151f' }}
                >
                  {/* Most popular badge */}
                  {pkg.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                      <Star className="w-3 h-3 fill-white" /> Most Popular
                    </div>
                  )}

                  <div className="p-7 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${pkg.tagColor.split(' ').slice(0,2).join(' ')} border ${pkg.tagColor.split(' ')[1]}`}>
                        <pkg.Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${pkg.tagColor}`}>
                        {pkg.type}
                      </span>
                    </div>

                    {/* Title + price */}
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className={`text-4xl font-black ${pkg.price === 'Custom' ? 'text-carbon-300' : 'text-white'}`}>{pkg.price}</span>
                        <span className="text-sm text-carbon-500">{pkg.priceSub}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-snug">{pkg.title}</h3>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-carbon-400 leading-relaxed mb-6">{pkg.summary}</p>

                    {/* Includes */}
                    <div className="mb-6 flex-1">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-carbon-600 mb-3">What's included</p>
                      <ul className="space-y-2.5">
                        {pkg.includes.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm text-carbon-300">
                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Timeline + best for */}
                    <div className="space-y-3 mb-7 pt-5 border-t border-carbon-800">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-carbon-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-carbon-600 block mb-0.5">Timeline</span>
                          <span className="text-sm text-carbon-400">{pkg.timeline}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Shield className="w-4 h-4 text-carbon-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-carbon-600 block mb-0.5">Best for</span>
                          <span className="text-sm text-carbon-400">{pkg.bestFor}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={pkg.price === 'Custom'
                        ? 'mailto:info@chainscopeai.co.uk?subject=Enterprise%20Enquiry'
                        : `mailto:info@chainscopeai.co.uk?subject=${encodeURIComponent(pkg.title + ' Enquiry')}`}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        pkg.highlight
                          ? 'text-white hover:scale-[1.02]'
                          : 'text-carbon-300 hover:text-white'
                      }`}
                      style={pkg.highlight
                        ? { background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }
                        : { border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }
                      }
                    >
                      {pkg.price === 'Custom' ? 'Contact Us' : 'Enquire About This Package'}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DISCOVERY CALL CTA ── */}
      <section className="relative py-20 border-t border-carbon-800/40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '900px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,209,94,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-7">
            <Calendar className="w-3 h-3" /> Free 30-Minute Discovery Call
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Not sure which package<br />is right for you?
          </h2>
          <p className="text-carbon-400 text-lg mb-10 leading-relaxed">
            Book a free 30-minute discovery call and we will recommend the best option for your business — with no obligation to proceed.
          </p>

          <a
            href="mailto:info@chainscopeai.co.uk?subject=Free%20Discovery%20Call%20Request"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] mb-10"
            style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)', boxShadow: '0 0 30px rgba(20,209,94,0.3)' }}
          >
            <Calendar className="w-4 h-4" /> Book a Free Discovery Call
          </a>

          {/* Contact details */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-carbon-800">
            <a href="mailto:info@chainscopeai.co.uk"
              className="flex items-center gap-2.5 text-sm text-carbon-400 hover:text-carbon-200 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center group-hover:border-echo-500/40 group-hover:bg-echo-500/10 transition-all duration-200">
                <Mail className="w-4 h-4 text-carbon-500 group-hover:text-echo-400 transition-colors" />
              </div>
              info@chainscopeai.co.uk
            </a>
            <a href="tel:+447448781708"
              className="flex items-center gap-2.5 text-sm text-carbon-400 hover:text-carbon-200 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center group-hover:border-echo-500/40 group-hover:bg-echo-500/10 transition-all duration-200">
                <Phone className="w-4 h-4 text-carbon-500 group-hover:text-echo-400 transition-colors" />
              </div>
              +44 7448 781708
            </a>
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
