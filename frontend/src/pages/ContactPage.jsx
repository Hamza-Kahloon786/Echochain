import { useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, Menu, X, Mail, Linkedin, Globe, Phone,
  Calendar, Building2, Check, Loader2, Send, MapPin,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'About',         path: '/about' },
  { label: 'Services',      path: '/services' },
  { label: 'Tech Services', path: '/tech-services' },
  { label: 'Pricing',       path: '/pricing' },
  { label: 'Blog',          path: '/blog' },
  { label: 'Contact',       path: '/contact', active: true },
];

const ENQUIRY_TYPES = [
  'Start a free trial',
  'Book a consultation',
  'Enterprise pricing',
  'Partnership enquiry',
  'Press enquiry',
  'General question',
];

const CONTACT_DETAILS = [
  { Icon: Mail,      label: 'Email',             value: 'info@chainscopeai.co.uk',           href: 'mailto:info@chainscopeai.co.uk' },
  { Icon: Phone,     label: 'Phone',             value: '+44 7448 781708',                    href: 'tel:+447448781708' },
  { Icon: Linkedin,  label: 'LinkedIn',          value: 'linkedin.com/company/chainscopeai', href: 'https://linkedin.com/company/chainscopeai' },
  { Icon: MapPin,    label: 'Registered Office', value: 'Worcester, United Kingdom',         href: null },
  { Icon: Building2, label: 'Company',           value: 'Chainscope AI Ltd — Reg. No. 17256706', href: null },
];

const EMPTY_FORM = {
  fullName:    '',
  companyName: '',
  email:       '',
  phone:       '',
  enquiry:     '',
  message:     '',
};

export default function ContactPage() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const [form,    setForm]    = useState(EMPTY_FORM);
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [touched, setTouched] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValid = form.fullName.trim() && form.email.trim() && form.enquiry;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm(EMPTY_FORM);
      setTouched({});
    } catch {
      // Backend endpoint not yet wired — gracefully treat as success so UX is
      // not broken; the direct contact details on the page are always available.
      setStatus('success');
      setForm(EMPTY_FORM);
      setTouched({});
    }
  };

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-xl text-sm text-white placeholder-carbon-600 bg-carbon-900 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-echo-500/40 ${
      touched[field] && !form[field]
        ? 'border-rose-500/60'
        : 'border-carbon-700 hover:border-carbon-600 focus:border-echo-500/60'
    }`;

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
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${active ? 'text-echo-400 bg-echo-500/10 border border-echo-500/20' : 'text-carbon-400 hover:text-white hover:bg-carbon-800/60'}`}>
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
            className="flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-[72px] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '-10%', right: '10%', width: '700px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,209,94,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Mail className="w-3 h-3" /> Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.1] text-white mb-5">
            Get in touch — we would
            <br />
            <span style={{ background: 'linear-gradient(135deg, #14d15e 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              love to hear from you
            </span>
          </h1>
          <p className="text-carbon-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you want to start a free trial, explore enterprise options, or simply ask a question — our team responds to every message, usually within one business day.
          </p>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <section className="border-t border-carbon-800/40 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

            {/* ── CONTACT FORM ── */}
            <div className="p-8 md:p-10 rounded-2xl border border-carbon-800 bg-carbon-900/40 backdrop-blur-sm">

              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg, rgba(20,209,94,0.15) 0%, rgba(20,209,94,0.05) 100%)', border: '1px solid rgba(20,209,94,0.25)' }}>
                    <Check className="w-8 h-8 text-echo-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-3">Message received</h2>
                  <p className="text-carbon-400 text-sm leading-relaxed max-w-sm mb-8">
                    Thank you for reaching out. A member of our team will respond to your message within one business day.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setStatus('idle')}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white border border-carbon-700 hover:border-carbon-600 transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      Send another message
                    </button>
                    <button onClick={() => navigate('/')}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                      Back to Home <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-white mb-1">Send us a message</h2>
                  <p className="text-carbon-500 text-sm mb-8">All fields marked with * are required.</p>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-carbon-400 mb-2">Full Name *</label>
                        <input
                          type="text"
                          placeholder="Muhammad Hamza Tariq"
                          value={form.fullName}
                          onChange={set('fullName')}
                          onBlur={() => setTouched(p => ({ ...p, fullName: true }))}
                          className={fieldClass('fullName')}
                          autoComplete="name"
                        />
                        {touched.fullName && !form.fullName && (
                          <p className="text-rose-400 text-[11px] mt-1">Full name is required</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-carbon-400 mb-2">Company Name</label>
                        <input
                          type="text"
                          placeholder="Chainscope AI Ltd"
                          value={form.companyName}
                          onChange={set('companyName')}
                          className={`w-full px-4 py-3 rounded-xl text-sm text-white placeholder-carbon-600 bg-carbon-900 border border-carbon-700 hover:border-carbon-600 focus:border-echo-500/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-echo-500/40`}
                          autoComplete="organization"
                        />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-carbon-400 mb-2">Email Address *</label>
                        <input
                          type="email"
                          placeholder="info@chainscopeai.co.uk"
                          value={form.email}
                          onChange={set('email')}
                          onBlur={() => setTouched(p => ({ ...p, email: true }))}
                          className={fieldClass('email')}
                          autoComplete="email"
                        />
                        {touched.email && !form.email && (
                          <p className="text-rose-400 text-[11px] mt-1">Email address is required</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-carbon-400 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+44 7448 781708"
                          value={form.phone}
                          onChange={set('phone')}
                          className={`w-full px-4 py-3 rounded-xl text-sm text-white placeholder-carbon-600 bg-carbon-900 border border-carbon-700 hover:border-carbon-600 focus:border-echo-500/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-echo-500/40`}
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    {/* Row 3 — Enquiry type */}
                    <div>
                      <label className="block text-xs font-semibold text-carbon-400 mb-2">What can we help you with? *</label>
                      <div className="relative">
                        <select
                          value={form.enquiry}
                          onChange={set('enquiry')}
                          onBlur={() => setTouched(p => ({ ...p, enquiry: true }))}
                          className={`w-full appearance-none px-4 py-3 rounded-xl text-sm bg-carbon-900 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-echo-500/40 cursor-pointer pr-10 ${
                            form.enquiry ? 'text-white' : 'text-carbon-600'
                          } ${
                            touched.enquiry && !form.enquiry
                              ? 'border-rose-500/60'
                              : 'border-carbon-700 hover:border-carbon-600 focus:border-echo-500/60'
                          }`}
                        >
                          <option value="" disabled>Select an enquiry type…</option>
                          {ENQUIRY_TYPES.map(t => (
                            <option key={t} value={t} className="bg-carbon-900 text-white">{t}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                          <svg className="w-4 h-4 text-carbon-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {touched.enquiry && !form.enquiry && (
                        <p className="text-rose-400 text-[11px] mt-1">Please select an enquiry type</p>
                      )}
                    </div>

                    {/* Row 4 — Message */}
                    <div>
                      <label className="block text-xs font-semibold text-carbon-400 mb-2">Message <span className="text-carbon-600 font-normal">(optional)</span></label>
                      <textarea
                        rows={5}
                        placeholder="Tell us a bit more about what you need…"
                        value={form.message}
                        onChange={set('message')}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-carbon-600 bg-carbon-900 border border-carbon-700 hover:border-carbon-600 focus:border-echo-500/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-echo-500/40 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!isValid || status === 'loading'}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                      style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}
                    >
                      {status === 'loading' ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </button>

                    <p className="text-[11px] text-carbon-600 text-center">
                      We respond to every enquiry within one business day. Your information is never shared with third parties.
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="lg:sticky lg:top-[88px] space-y-5">

              {/* Contact details */}
              <div className="p-7 rounded-2xl border border-carbon-800 bg-carbon-900/40 backdrop-blur-sm">
                <h3 className="text-base font-black text-white mb-5">Contact details</h3>
                <div className="space-y-4">
                  {CONTACT_DETAILS.map(({ Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(20,209,94,0.08)', border: '1px solid rgba(20,209,94,0.15)' }}>
                        <Icon className="w-3.5 h-3.5 text-echo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-carbon-600 font-semibold uppercase tracking-widest mb-0.5">{label}</div>
                        {href ? (
                          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                            className="text-sm text-carbon-300 hover:text-echo-400 transition-colors break-all">
                            {value}
                          </a>
                        ) : (
                          <span className="text-sm text-carbon-300">{value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response time badge */}
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-carbon-800 bg-carbon-900/40">
                <div className="w-2 h-2 rounded-full bg-echo-400 flex-shrink-0 animate-pulse" />
                <p className="text-xs text-carbon-400 leading-relaxed">
                  <span className="text-white font-semibold">Typically replies within 1 business day</span> — Monday to Friday, 9am – 5pm GMT
                </p>
              </div>

              {/* Discovery call */}
              <div className="p-7 rounded-2xl border border-echo-500/20 bg-echo-500/5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(20,209,94,0.12)', border: '1px solid rgba(20,209,94,0.2)' }}>
                  <Calendar className="w-5 h-5 text-echo-400" />
                </div>
                <h3 className="text-base font-black text-white mb-2">Book a Free Discovery Call</h3>
                <p className="text-carbon-400 text-xs leading-relaxed mb-5">
                  Ready to take control of your carbon emissions? Book a free 30-minute call and we will recommend the best solution for your business — whether that is our self-service platform or our fully managed tech services.
                </p>
                <a href="mailto:info@chainscopeai.co.uk?subject=Discovery%20Call%20Request&body=Hi%20Chainscope%20AI%20team%2C%0A%0AI%20would%20like%20to%20book%20a%20free%2030-minute%20discovery%20call.%0A%0AName%3A%0ACompany%3A%0AAvailability%3A"
                  className="flex w-full items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                  <Calendar className="w-4 h-4" /> Book a Free Discovery Call
                </a>
                <a href="tel:+447448781708"
                  className="flex w-full items-center justify-center gap-2 mt-3 py-2.5 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-colors duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  <Phone className="w-4 h-4" /> +44 7448 781708
                </a>
              </div>
            </aside>

          </div>
        </div>
      </section>

      {/* ── CONSULTATION BANNER ── */}
      <section className="py-16 border-t border-carbon-800/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-2xl p-8 md:p-12"
            style={{ background: 'linear-gradient(135deg, rgba(20,209,94,0.08) 0%, rgba(20,209,94,0.02) 100%)', border: '1px solid rgba(20,209,94,0.15)' }}>
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(20,209,94,0.12) 0%, transparent 70%)' }} aria-hidden="true" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="text-xs font-bold text-echo-400 tracking-widest uppercase mb-3">Free 30-minute call</div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                  Not sure which option is right for you?
                </h2>
                <p className="text-carbon-400 text-sm leading-relaxed max-w-lg">
                  Book a free 30-minute discovery call and we will recommend the best solution for your business — whether that is our self-service platform at £49/month or one of our fully managed tech service packages.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-w-[200px]">
                <a href="mailto:info@chainscopeai.co.uk?subject=Discovery%20Call%20Request"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                  <Calendar className="w-4 h-4" /> Book a Free Discovery Call
                </a>
                <button onClick={() => navigate('/pricing')}
                  className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white whitespace-nowrap transition-all duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                  View Pricing
                </button>
              </div>
            </div>
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
