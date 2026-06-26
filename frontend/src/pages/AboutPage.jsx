import { useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, Menu, X, Linkedin, Mail, Globe,
  Check, Shield, GraduationCap, Building2, Target, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const CREDENTIALS = [
  'BSc Chemical Engineering — University of the Punjab, Lahore',
  'MSc Supply Chain Management — University of Worcester, UK',
  'CMI Level 7 Diploma in Strategic Management and Leadership',
];

const COMPANY_INFO = [
  { label: 'Company Name',     value: 'Chainscope AI Ltd' },
  { label: 'Company Number',   value: '17256706' },
  { label: 'Registered In',    value: 'England and Wales' },
  { label: 'Registered Office',value: 'Worcester, United Kingdom' },
  { label: 'Founded',          value: '2026' },
];

const STORY_PARAGRAPHS = [
  `CHAINSCOPE AI was founded by Muhammad Hamza Tariq with a clear conviction: the transition to a low-carbon economy will only accelerate when organisations can make faster, smarter, and evidence-based decisions powered by data.`,
  `My background spans Chemical Engineering, supply chain research, applied artificial intelligence, and a research focus on industrial decarbonization. Through academic research, industry engagement, and direct exposure to sustainability challenges, I recognised a critical gap: organisations are increasingly committed to reducing emissions, yet many lack the tools to accurately identify where emissions originate and which interventions deliver measurable results. This insight became the foundation for CHAINSCOPE AI.`,
  `CHAINSCOPE AI is developing AI-powered carbon intelligence solutions that enable organisations to uncover emissions hotspots, optimise operations, and embed sustainability into decision-making across complex supply chains. Our approach integrates machine learning, carbon analytics, and operational intelligence to convert fragmented environmental data into actionable insights with measurable business and climate outcomes.`,
  `Since founding the company, the focus has been on translating research into scalable real-world impact through product innovation, pilot validation, and collaboration with businesses, research institutions, and innovation ecosystems.`,
  `Our long-term vision is to make carbon intelligence accessible, actionable, and scalable globally — empowering organisations to reduce emissions while strengthening resilience and performance.`,
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const goHome = (hash) => {
    navigate(`/${hash ? '#' + hash : ''}`);
    setMobileOpen(false);
  };

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
              { label: 'Home',          action: () => navigate('/') },
              { label: 'About',         action: () => navigate('/about'), active: true },
              { label: 'Services',      action: () => navigate('/#features') },
              { label: 'Tech Services', action: () => navigate('/#cases') },
              { label: 'Pricing',       action: () => navigate('/pricing') },
              { label: 'Blog',          action: () => navigate('/blog') },
              { label: 'Contact',       action: () => navigate('/contact') },
            ].map(({ label, action, active }) => (
              <li key={label}>
                <button onClick={action}
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
            { label: 'Home',          action: () => navigate('/') },
            { label: 'About',         action: () => navigate('/about') },
            { label: 'Services',      action: () => navigate('/services') },
            { label: 'Tech Services', action: () => navigate('/tech-services') },
            { label: 'Pricing',       action: () => navigate('/pricing') },
            { label: 'Blog',          action: () => navigate('/blog') },
            { label: 'Contact',       action: () => navigate('/contact') },
          ].map(({ label, action }) => (
            <button key={label} onClick={() => { action(); setMobileOpen(false); }}
              className="block text-3xl font-bold text-carbon-300 hover:text-white transition-colors py-3 px-8">
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={() => { navigate('/signup'); setMobileOpen(false); }}
            className="flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── PAGE HERO ── */}
      <section className="relative pt-[72px] pb-0 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '0%', left: '20%', width: '700px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,209,94,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Leaf className="w-3 h-3" /> About ChainscopeAI
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white max-w-6xl mx-auto">
            Built by a researcher who got tired of waiting for<br />
            someone else to solve the problem
          </h1>
        </div>
      </section>

      {/* ── FOUNDER SECTION ── */}
      <section className="py-16 md:py-24 border-t border-carbon-800/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">

            {/* Left — photo + credentials card */}
            <div className="lg:col-span-1 flex flex-col items-center lg:items-start gap-6">

              {/* Photo */}
              <div className="relative">
                <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 shadow-2xl"
                  style={{ borderColor: 'rgba(20,209,94,0.3)', boxShadow: '0 0 60px rgba(20,209,94,0.15), 0 24px 60px rgba(0,0,0,0.5)' }}>
                  <img
                    src="/about.jpg"
                    alt="Muhammad Hamza Tariq — Founder of Chainscope AI"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center shadow-lg shadow-echo-900/50">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Name & title */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-black text-white">Muhammad Hamza Tariq</h2>
                <p className="text-echo-400 font-semibold text-sm mt-1">Founder &amp; CEO, Chainscope AI Ltd</p>
                <div className="flex items-center justify-center lg:justify-start gap-3 mt-3">
                  <a href="https://linkedin.com/company/chainscopeai" target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 hover:bg-echo-500/10 transition-all duration-200">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="mailto:Info@chainscopeai.com"
                    className="w-9 h-9 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 hover:bg-echo-500/10 transition-all duration-200">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Credentials */}
              <div className="w-full p-6 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4 text-echo-400" />
                  <h3 className="text-xs font-bold tracking-widest uppercase text-carbon-400">Credentials</h3>
                </div>
                <ul className="space-y-3">
                  {CREDENTIALS.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-xs text-carbon-400 leading-relaxed">
                      <ChevronRight className="w-3.5 h-3.5 text-echo-500 flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — story */}
            <div className="lg:col-span-2">
              <div className="space-y-5">
                {STORY_PARAGRAPHS.map((para, i) => (
                  <p key={i}
                    className={`leading-[1.85] text-base ${i === 0 ? 'text-white font-medium text-lg' : 'text-carbon-400'}`}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPANY INFORMATION ── */}
      <section className="py-16 md:py-24 border-t border-carbon-800/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Company info card */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Building2 className="w-4 h-4 text-echo-400" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-carbon-400">Company Information</h2>
              </div>
              <div className="p-7 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-sm">
                <dl className="divide-y divide-carbon-800">
                  {COMPANY_INFO.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <dt className="text-sm text-carbon-500">{label}</dt>
                      <dd className="text-sm font-semibold text-white text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {['GDPR Compliant', 'ISO 27001 Certified', 'DEFRA 2024 Compliant'].map((b) => (
                  <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-echo-400 border border-echo-500/25 bg-echo-500/8">
                    <Check className="w-3 h-3" /> {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Target className="w-4 h-4 text-echo-400" />
                <h2 className="text-xs font-bold tracking-widest uppercase text-carbon-400">Our Mission</h2>
              </div>
              <div className="p-8 rounded-2xl border backdrop-blur-sm"
                style={{ background: 'rgba(20,209,94,0.04)', borderColor: 'rgba(20,209,94,0.2)' }}>
                <p className="text-xl md:text-2xl font-bold text-white leading-[1.5]">
                  Making carbon intelligence accessible to every business — because Net Zero 2050 cannot be achieved without SMEs.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/signup')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)', boxShadow: '0 0 20px rgba(20,209,94,0.25)' }}>
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </button>
                <a href="mailto:Info@chainscopeai.com"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-all duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                  <Mail className="w-4 h-4" /> Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-carbon-800/60 py-10 mt-8">
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
              <p>Registered Office: Worcester, United Kingdom &nbsp;|&nbsp; Info@chainscopeai.com</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com/company/chainscopeai" target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 transition-all duration-200">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:Info@chainscopeai.com"
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
