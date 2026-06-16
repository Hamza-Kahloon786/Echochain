import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, Map, TrendingUp, Lightbulb, FileText,
  ArrowRight, Play, ChevronLeft, ChevronRight, Menu, X,
  Check, Star, Globe, Zap, Mail, Twitter, Linkedin, Youtube, Github,
  ArrowUp, Shield, Clock, BarChart3,
  UserPlus, Upload, Users, DollarSign, EyeOff, AlertCircle,
} from 'lucide-react';
import { POSTS } from './BlogPage';

/* ── Static data ────────────────────────────────────────────────── */

const FEATURES = [
  {
    Icon: BarChart3, color: 'echo',
    title: 'Scope 1, 2 & 3 Tracking',
    desc:  'Automatic calculation using official DEFRA 2024 emission factors across all scopes.',
  },
  {
    Icon: Zap, color: 'cyan',
    title: 'Live National Grid Data',
    desc:  'Real-time live grid carbon intensity from National Grid ESO API, updated every 30 minutes.',
  },
  {
    Icon: Map, color: 'blue',
    title: 'Carbon Hotspot Map',
    desc:  'Interactive map showing highest emission nodes across your supplier and transport networks.',
  },
  {
    Icon: FileText, color: 'purple',
    title: 'GPT-4o SECR Reports',
    desc:  'Auto-generates SECR and UK ETS compliant reports with one click using AI.',
  },
  {
    Icon: TrendingUp, color: 'amber',
    title: 'ML Emissions Forecasting',
    desc:  'RandomForest machine learning predicts your emissions 6 to 24 months ahead.',
  },
  {
    Icon: Lightbulb, color: 'rose',
    title: 'AI Recommendations',
    desc:  'Prioritised, actionable carbon reduction strategies ranked by impact.',
  },
];

/* Full static class names so Tailwind JIT includes them */
const ICON_STYLE = {
  echo:   { wrap: 'bg-echo-500/15',   icon: 'text-echo-400'   },
  blue:   { wrap: 'bg-blue-500/15',   icon: 'text-blue-400'   },
  amber:  { wrap: 'bg-amber-500/15',  icon: 'text-amber-400'  },
  cyan:   { wrap: 'bg-cyan-500/15',   icon: 'text-cyan-400'   },
  purple: { wrap: 'bg-purple-500/15', icon: 'text-purple-400' },
  rose:   { wrap: 'bg-rose-500/15',   icon: 'text-rose-400'   },
};

const TESTIMONIALS = [
  { quote: "Chain scope AI flagged three warehouse sites we hadn't even identified in our manual audit. We redirected those savings into 11 new renewable energy contracts.", name: 'Priya Sharma',  role: 'Head of Sustainability, PulseGroup',         img: 'https://picsum.photos/id/1025/100/100' },
  { quote: "The forecasting engine is genuinely impressive. We now model the carbon impact of a supplier swap before committing — that's never been possible before.", name: 'James Clifton', role: 'Supply Chain Director, NovaTech UK',          img: 'https://picsum.photos/id/1012/100/100' },
  { quote: "Setup took 20 minutes. Within a week we had a full heatmap of our UK operations. The AI recommendations alone justified the subscription in month one.",   name: 'Rachel Torres', role: 'ESG Officer, LayerStack',                     img: 'https://picsum.photos/id/1027/100/100' },
  { quote: "Live grid intensity scheduling cut our electricity-related emissions by 22% — we didn't change a single process, just shifted the timing.",               name: 'David Okafor',  role: 'Operations Manager, ClearPath Logistics',    img: 'https://picsum.photos/id/1074/100/100' },
  { quote: "Our investors now ask for Chain scope AI reports directly. It's become the standard for how we communicate carbon performance across the board.",              name: 'Emma Walsh',    role: 'CEO, Apex Green Manufacturing',              img: 'https://picsum.photos/id/1062/100/100' },
];

const TW_PHRASES = ['Identify carbon hotspots in minutes', 'Forecast emissions up to 12 months ahead', 'Get AI-ranked reduction actions', 'Track Scope 1, 2 & 3 in one place'];

/* ── Component ──────────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate  = useNavigate();

  /* State */
  const [navScrolled,   setNavScrolled]   = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [showBtt,       setShowBtt]       = useState(false);
  const [twText,        setTwText]        = useState('');
  const [slide,         setSlide]         = useState(0);
  const [visCount,      setVisCount]      = useState(3);
  const [newsEmail,     setNewsEmail]     = useState('');
  const [newsState,     setNewsState]     = useState('idle'); // idle|loading|ok|err

  /* ── Typewriter ─────────────────────────────────────────────────── */
  useEffect(() => {
    let pi = 0, ci = 0, deleting = false, wait = 0, timer;
    const tick = () => {
      if (wait-- > 0) { timer = setTimeout(tick, 40); return; }
      const phrase = TW_PHRASES[pi];
      if (!deleting) {
        setTwText(phrase.slice(0, ++ci));
        if (ci === phrase.length) { deleting = true; wait = 50; }
        timer = setTimeout(tick, 70);
      } else {
        setTwText(phrase.slice(0, --ci));
        if (ci === 0) { deleting = false; pi = (pi + 1) % TW_PHRASES.length; wait = 8; }
        timer = setTimeout(tick, 35);
      }
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, []);

  /* ── Scroll effects ─────────────────────────────────────────────── */
  useEffect(() => {
    const fn = () => { setNavScrolled(window.scrollY > 20); setShowBtt(window.scrollY > 500); };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Intersection Observer: scroll-in animations ─────────────────── */
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-visible'); io.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.lp-animate, .lp-animate-left, .lp-animate-right').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ── Carousel ────────────────────────────────────────────────────── */
  useEffect(() => {
    const update = () => setVisCount(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxSlide = Math.max(0, TESTIMONIALS.length - visCount);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s >= maxSlide ? 0 : s + 1)), 5000);
    return () => clearInterval(t);
  }, [maxSlide]);

  /* ── Newsletter ──────────────────────────────────────────────────── */
  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsEmail)) { setNewsState('err'); return; }
    setNewsState('loading');
    setTimeout(() => { setNewsState('ok'); setNewsEmail(''); }, 900);
  };

  /* ── Smooth anchor scroll ────────────────────────────────────────── */
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="overflow-x-hidden" style={{ background: '#0f1117', color: '#e4e4ec' }}>

      {/* ──────────────────── NAVBAR ──────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 h-[72px] flex items-center transition-all duration-500 ${navScrolled ? 'bg-[#0f1117]/90 backdrop-blur-xl border-b border-carbon-800 shadow-xl shadow-black/30' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2.5 group" aria-label="ChainscopeAI home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center shadow-lg shadow-echo-900/40 group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ChainscopeAI</span>
          </button>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {[
              { label: 'Home',          action: () => scrollTo('home') },
              { label: 'About',         action: () => navigate('/about') },
              { label: 'Services',      action: () => navigate('/services') },
              { label: 'Tech Services', action: () => navigate('/tech-services') },
              { label: 'Pricing',       action: () => navigate('/pricing') },
              { label: 'Blog',          action: () => navigate('/blog') },
              { label: 'Contact',       action: () => navigate('/contact') },
            ].map(({ label, action }) => (
              <li key={label}>
                <button onClick={action} className="px-3 py-2 rounded-full text-sm font-medium text-white hover:text-echo-400 hover:bg-carbon-800/60 transition-all duration-200">
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/signup')} className="hidden sm:flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200 shadow-lg shadow-echo-900/40">
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-carbon-400 hover:bg-carbon-800 transition-colors" aria-label="Open menu" aria-expanded={mobileOpen}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ──────────────────── MOBILE OVERLAY ──────────────────── */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(15,17,23,0.98)', backdropFilter: 'blur(24px)' }}
        role="dialog" aria-modal="true" aria-label="Mobile navigation"
      >
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 w-11 h-11 rounded-full bg-carbon-800 flex items-center justify-center text-carbon-300 hover:bg-carbon-700 transition-colors" aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
        <nav>
          {[
            { label: 'Home',          action: () => scrollTo('home') },
            { label: 'About',         action: () => { navigate('/about'); setMobileOpen(false); } },
            { label: 'Services',      action: () => { navigate('/services'); setMobileOpen(false); } },
            { label: 'Tech Services', action: () => { navigate('/tech-services'); setMobileOpen(false); } },
            { label: 'Pricing',       action: () => { navigate('/pricing'); setMobileOpen(false); } },
            { label: 'Blog',          action: () => { navigate('/blog'); setMobileOpen(false); } },
            { label: 'Contact',       action: () => { navigate('/contact'); setMobileOpen(false); } },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} className="block text-3xl font-bold text-carbon-300 hover:text-white transition-colors py-3 px-8">
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={() => { navigate('/signup'); setMobileOpen(false); }} className="flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="text-sm text-carbon-400 hover:text-white transition-colors py-2">
            Already have an account? <span className="text-echo-400 font-semibold">Sign In</span>
          </button>
        </div>
      </div>

      {/* ──────────────────── HERO ──────────────────── */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-[72px]">

        {/* Multi-layer background glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position:'absolute', top:'10%', left:'15%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(20,209,94,0.10) 0%, transparent 70%)', filter:'blur(40px)' }} />
          <div style={{ position:'absolute', bottom:'5%', right:'10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(9,173,74,0.07) 0%, transparent 70%)', filter:'blur(40px)' }} />
          <div style={{ position:'absolute', top:'60%', left:'50%', transform:'translateX(-50%)', width:'900px', height:'2px', background:'linear-gradient(90deg, transparent, rgba(20,209,94,0.15), transparent)' }} />
        </div>

        {/* ── Top text zone ── */}
        <div className="relative z-10 text-center w-full max-w-7xl mx-auto px-8 pt-16 pb-10">

          {/* Announcement badge — minimal, no coloured background */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-echo-400 animate-pulse flex-shrink-0" />
            <span className="text-xs text-carbon-400 font-medium">DEFRA 2024 emission factors now live</span>
            <span className="hidden sm:block w-px h-3 bg-carbon-700" />
            <button onClick={() => scrollTo('features')} className="hidden sm:flex items-center gap-1 text-xs text-echo-500 hover:text-echo-400 transition-colors font-semibold">
              Learn more <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-black tracking-tight leading-[1.05] mb-5">
            <span className="text-white">AI Carbon</span>{' '}
            <span style={{ background: 'linear-gradient(135deg, #14d15e 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Intelligence for
            </span>
            <br />
            <span className="text-white">Supply Chains</span>
          </h1>

          {/* Subheadline */}
          <p className="text-echo-400 font-semibold text-lg md:text-xl max-w-[640px] mx-auto leading-relaxed mb-4">
            Replace £30,000/year consultants with automated Scope 1, 2 &amp; 3 tracking, live National Grid data, and one-click SECR reports —
          </p>

          {/* Pricing */}
          <p className="text-carbon-300 font-bold text-base mb-8 tracking-wide">
            £19/week &nbsp;·&nbsp; £49/month &nbsp;·&nbsp; £499/year
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
            <button
              onClick={() => navigate('/signup')}
              className="relative group text-sm font-bold px-7 py-3 rounded-xl text-white flex items-center gap-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)', boxShadow: '0 0 24px rgba(20,209,94,0.3), 0 2px 12px rgba(0,0,0,0.4)' }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" style={{ background: 'linear-gradient(135deg, #1be86b 0%, #0cc252 100%)' }} />
              <span className="relative flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="text-sm font-semibold px-7 py-3 rounded-xl text-carbon-300 hover:text-white transition-all duration-200 flex items-center gap-2"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
            >
              <Play className="w-3.5 h-3.5 text-echo-400" /> Book a Free Discovery Call
            </button>
          </div>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-x-5 gap-y-2.5 flex-wrap text-[11px] text-carbon-500 font-medium">
            {[
              'DEFRA 2024 Compliant',
              'ISO 27001 Certified',
              'GDPR Compliant',
              'Chainscope AI Ltd Reg. No. 17256706',
              'Built on IEEE Research',
              'Active UK Industry Pilots',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-echo-500 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>


        {/* Scroll nudge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-carbon-600 text-[10px] tracking-[0.15em] uppercase" aria-hidden="true">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-echo-700 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ──────────────────── CLIENTS ──────────────────── */}
      <div className="border-t border-b border-carbon-800/60 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold tracking-[0.14em] uppercase text-carbon-500 mb-8">
            Trusted by UK sustainability leaders
          </p>
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .auto-scroll {
              animation: scroll 40s linear infinite;
              width: 200%;
            }
            .auto-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="overflow-hidden" role="list">
            <div className="flex items-center gap-6 auto-scroll">
              {[...Array(2)].map((_, idx) => (
                <div key={`set-${idx}`} className="flex items-center gap-6 whitespace-nowrap">
                  {['NHS Supply Chain','Network Rail','DHL UK','Marks & Spencer','Tesco','Government Digital Service','British Retail Consortium','Environment Agency'].map(name => (
                    <div key={`${name}-${idx}`} role="listitem"
                      className="px-7 py-3.5 rounded-xl bg-carbon-900/70 border border-carbon-800 text-white text-sm font-semibold tracking-tight backdrop-blur-sm hover:text-echo-400 hover:border-carbon-700 transition-all duration-300 hover:-translate-y-0.5 cursor-default flex-shrink-0 inline-block"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────── PROBLEM ──────────────────── */}
      <section id="problem" className="py-24 md:py-32 border-t border-carbon-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 lp-animate">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/25 bg-red-500/10 text-red-400 text-xs font-semibold tracking-widest uppercase mb-5">
              <Shield className="w-3 h-3" /> The Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              The carbon compliance gap is <span className="text-red-400">costing</span><br />
              <span className="text-red-400">businesses contracts</span>
            </h2>
          </div>

          <p className="text-center text-carbon-400 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-14 lp-animate">
            Large companies are legally required to report their Scope 3 supply chain emissions. That means they ask their
            suppliers — you — to provide verified carbon data. SMEs that cannot provide it{' '}
            <strong className="text-carbon-200">risk losing contracts</strong>.
            <br /><br />
            Professional carbon management software charges{' '}
            <strong className="text-carbon-200">£5,000 to £30,000 per year</strong>. Most SMEs have no affordable
            technology to comply. Until now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                Icon: DollarSign,
                title: 'Prohibitive Cost',
                desc: 'Consultants charge up to £30,000/year. Most SMEs simply cannot afford professional carbon management.',
              },
              {
                Icon: EyeOff,
                title: 'No Visibility',
                desc: "Excel spreadsheets and guesswork do not meet regulatory scrutiny or satisfy your customers' Scope 3 requirements.",
              },
              {
                Icon: AlertCircle,
                title: 'Supply Chain Pressure',
                desc: 'Large companies require verified emissions data from suppliers. SMEs that cannot provide it lose contracts.',
              },
            ].map((card, i) => (
              <div key={card.title}
                className={`lp-animate lp-delay-${i + 1} p-7 rounded-2xl border backdrop-blur-sm`}
                style={{ background: 'rgba(20,209,94,0.04)', borderColor: 'rgba(20,209,94,0.2)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-echo-500/15 border border-echo-500/20 flex items-center justify-center flex-shrink-0">
                    <card.Icon className="w-5 h-5 text-echo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-carbon-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── FEATURES ──────────────────── */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16 lp-animate">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-5">
              <BarChart3 className="w-3 h-3" /> The Solution
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Enterprise carbon intelligence<br />
              <span className="text-echo-400">at SME prices</span>
            </h2>
            <p className="text-carbon-400 text-lg mt-4 max-w-xl mx-auto leading-relaxed">
              One unified platform for all your carbon compliance — powered by AI, official DEFRA 2024 factors, and live National Grid data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`lp-animate lp-delay-${i + 1} group p-7 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-sm cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:border-carbon-700 hover:shadow-2xl hover:shadow-black/40 relative overflow-hidden`}
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(20,209,94,0.05) 0%, transparent 70%)' }} aria-hidden="true" />
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-4deg] ${ICON_STYLE[f.color].wrap}`}>
                    <f.Icon className={`w-5 h-5 ${ICON_STYLE[f.color].icon}`} />
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{f.title}</h3>
                </div>
                <p className="text-sm text-carbon-400 leading-relaxed">{f.desc}</p>
                <button onClick={() => navigate('/signup')} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-echo-400 hover:gap-3 transition-all duration-200">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── HOW IT WORKS ──────────────────── */}
      <section id="how-it-works" className="py-24 md:py-32 border-t border-carbon-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lp-animate">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-5">
              <Clock className="w-3 h-3" /> Get Started in Minutes
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              How it works —<br />
              <span className="text-echo-400">5 simple steps</span>
            </h2>
          </div>

          {/* Step number connector — desktop only */}
          <div className="hidden lg:flex items-center mb-8">
            {['01','02','03','04','05'].map((n, i) => (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <div className="w-12 h-12 rounded-full border-2 border-echo-500/40 bg-echo-500/10 flex items-center justify-center flex-shrink-0 mx-auto" style={{ marginLeft: i === 0 ? 0 : undefined }}>
                  <span className="text-sm font-black text-echo-400">{n}</span>
                </div>
                {i < 4 && <div className="flex-1 h-px bg-gradient-to-r from-echo-500/30 to-echo-500/10 mx-1" />}
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: '01', Icon: UserPlus, title: 'Sign Up',
                desc: 'Create your account in under 5 minutes.',
                bullets: ['Free 14-day trial', 'No credit card required', 'Instant access'],
                badge: 'Free forever',
              },
              {
                step: '02', Icon: Upload, title: 'Upload Data',
                desc: 'Import suppliers, warehouses, and transport routes via our Excel template.',
                bullets: ['Excel template provided', 'Bulk import supported', 'Auto-validation'],
                badge: 'Excel ready',
              },
              {
                step: '03', Icon: Map, title: 'View Hotspot Map',
                desc: 'Instantly see carbon hotspots across your supply chain on an interactive geo-map.',
                bullets: ['Interactive geo-map', 'Real-time hotspots', 'Supplier nodes'],
                badge: 'Live data',
              },
              {
                step: '04', Icon: TrendingUp, title: 'Get Forecasts',
                desc: 'Our ML model predicts emissions 6 to 24 months ahead with confidence intervals.',
                bullets: ['6–24 month predictions', 'Confidence intervals', 'Trend analysis'],
                badge: 'ML powered',
              },
              {
                step: '05', Icon: FileText, title: 'Generate Report',
                desc: 'One-click SECR and UK ETS compliant report ready to submit to regulators.',
                bullets: ['SECR compliant', 'UK ETS ready', 'One-click export'],
                badge: 'AI generated',
              },
            ].map(({ step, Icon, title, desc, bullets, badge }, i) => (
              <div key={step}
                className={`lp-animate lp-delay-${i + 1} flex flex-col p-6 rounded-2xl border backdrop-blur-sm hover:border-echo-600/30 hover:-translate-y-1 transition-all duration-300`}
                style={{ background: 'rgba(20,22,32,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                {/* Mobile step number */}
                <div className="lg:hidden text-[11px] font-black text-echo-500 mb-3 tracking-widest">{step}</div>

                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-echo-500/15 border border-echo-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-echo-400" style={{ width: '18px', height: '18px' }} />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
                </div>

                {/* Description */}
                <p className="text-xs text-carbon-400 leading-relaxed mb-4">{desc}</p>

                {/* Bullets */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-xs text-carbon-500">
                      <div className="w-1 h-1 rounded-full bg-echo-500/60 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit"
                  style={{ background: 'rgba(20,209,94,0.08)', border: '1px solid rgba(20,209,94,0.2)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-echo-400" />
                  <span className="text-[11px] font-semibold text-echo-400">{badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── BLOG ──────────────────── */}
      <section id="blog" className="py-24 md:py-32 border-t border-carbon-800/40">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16 lp-animate">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-5">
              <FileText className="w-3 h-3" /> From the Blog
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Visit my blog and<br />
              <span className="text-echo-400">keep your feedback</span>
            </h2>
            <p className="text-carbon-400 text-lg mt-4 max-w-xl mx-auto">
              Practical guidance on carbon compliance, SECR reporting, and AI-driven sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {POSTS.slice(0, 3).map((post, i) => (
              <div
                key={post.slug}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className={`lp-animate lp-delay-${i + 1} group flex flex-col rounded-2xl border border-carbon-800 overflow-hidden cursor-pointer hover:border-carbon-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40`}
                style={{ background: '#13151f' }}
              >
                {/* Top strip */}
                <div className="relative h-64 overflow-hidden">
                  <img src="/logo-carbon-340x250.webp" alt="ChainscopeAI" className="absolute inset-0 w-full h-full object-cover" />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-carbon-500 uppercase tracking-widest">{post.week}</span>
                      <span className="w-1 h-1 rounded-full bg-carbon-700" />
                      <span className="flex items-center gap-1 text-xs text-carbon-600"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${post.categoryColor}`}>{post.category}</span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-snug mb-3 flex-1 group-hover:text-echo-100 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-carbon-500 leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-echo-400 text-sm font-semibold group-hover:gap-3 transition-all duration-200 mt-auto">
                    Read Article <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
              My Blog <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────── TWO PATHS ──────────────────── */}
      <section id="two-paths" className="py-24 md:py-32 border-t border-carbon-800/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 lp-animate">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Use the platform yourself —<br />
              <span className="text-echo-400">or let us do it for you</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Self-service */}
            <div className="p-8 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-sm hover:border-echo-600/40 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-echo-500/15 border border-echo-500/25 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-echo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Self-Service</h3>
              </div>
              <p className="text-carbon-400 text-sm leading-relaxed mb-8 flex-1">
                Sign up at <span className="text-echo-400 font-semibold">chainscopeai.com</span> and manage your carbon
                compliance independently. Full platform access from{' '}
                <strong className="text-white">£499/year</strong>.
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Managed */}
            <div className="p-8 rounded-2xl border backdrop-blur-sm hover:border-blue-600/40 transition-all duration-300 flex flex-col"
              style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.2)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Managed Tech Services</h3>
              </div>
              <p className="text-carbon-400 text-sm leading-relaxed mb-8 flex-1">
                Our experts set up, manage, and report on your carbon emissions for you. Ideal for businesses who want a{' '}
                <strong className="text-white">fully managed technology solution</strong>.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
              >
                Book a Free Discovery Call <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── TESTIMONIALS ──────────────────── */}
      <section id="testimonials" className="py-24 md:py-32 border-t border-carbon-800/40" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(39,39,51,0.2) 50%, transparent 100%)' }}>
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14 lp-animate">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/8 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-5">
              <Star className="w-3 h-3" /> Customer Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Loved by sustainability<br />
              <span className="text-echo-400">professionals across the UK</span>
            </h2>
          </div>

          {/* Track */}
          <div className="overflow-hidden" aria-label="Customer testimonials">
            <div
              className="flex gap-5 transition-transform duration-500"
              style={{ transform: `translateX(calc(-${slide} * (${100 / visCount}% + ${visCount > 1 ? 20 / visCount : 20}px)))` }}
              role="list"
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.name} role="listitem"
                  className="flex-shrink-0 p-7 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-sm transition-all duration-300 hover:border-carbon-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
                  style={{ width: `calc(${100 / visCount}% - ${visCount > 1 ? 20 * (visCount - 1) / visCount : 0}px)` }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4" aria-label="5 stars">
                    {Array(5).fill(0).map((_, si) => <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />)}
                  </div>
                  <p className="text-sm text-carbon-300 leading-[1.8] italic mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-carbon-800">
                    <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-carbon-700" loading="lazy" />
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-carbon-500 mt-0.5">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
              className="w-10 h-10 rounded-full border border-carbon-700 bg-carbon-900/70 text-carbon-400 hover:border-echo-500/50 hover:text-echo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              aria-label="Previous testimonials">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
              {Array(maxSlide + 1).fill(0).map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} role="tab" aria-selected={i === slide} aria-label={`Go to group ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${i === slide ? 'bg-echo-500 w-6 h-2' : 'bg-carbon-700 hover:bg-carbon-500 w-2 h-2'}`}
                />
              ))}
            </div>
            <button onClick={() => setSlide(s => Math.min(maxSlide, s + 1))} disabled={slide === maxSlide}
              className="w-10 h-10 rounded-full border border-carbon-700 bg-carbon-900/70 text-carbon-400 hover:border-echo-500/50 hover:text-echo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              aria-label="Next testimonials">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────── CTA BANNER ──────────────────── */}
      <section id="contact" className="relative py-24 md:py-32 overflow-hidden border-t border-carbon-800/40">
        <div className="absolute inset-0 animate-pulse" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(20,209,94,0.08) 0%, transparent 70%)', animationDuration: '6s' }} aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(20,209,94,0.4), transparent)' }} aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(9,173,74,0.3), transparent)' }} aria-hidden="true" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center lp-animate">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/8 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-7">
            <Zap className="w-3 h-3" /> 14-Day Free Trial
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-5">
            Start reducing emissions<br />
            <span className="text-echo-400">in under 30 minutes</span>
          </h2>
          <p className="text-carbon-400 text-lg mb-10">No credit card required. Full access to all features. Cancel anytime.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('/signup')}
              className="btn-primary text-base px-10 py-4 flex items-center gap-2 shadow-2xl shadow-echo-900/50"
              style={{ animation: 'cta-pulse 3s ease infinite' }}
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/signup')} className="btn-secondary text-base px-8 py-4">
              Book a Demo
            </button>
          </div>
          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap text-xs text-carbon-500 font-medium">
            {[<><Check className="w-3.5 h-3.5 text-echo-500" />No credit card</>, <><Shield className="w-3.5 h-3.5 text-echo-500" />GDPR compliant</>, <><Clock className="w-3.5 h-3.5 text-echo-500" />Setup in 30 min</>].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── FOOTER ──────────────────── */}
      <footer id="footer" className="border-t border-carbon-800/60 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-carbon-800/60">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">ChainscopeAI</span>
              </div>
              <p className="text-sm text-carbon-500 leading-relaxed mb-5 max-w-[260px]">
                AI-powered carbon management for global supply chains. Scope 1, 2 &amp; 3 tracking, SECR reports, and live grid data.
              </p>
              <div className="space-y-2 text-xs text-carbon-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-carbon-600 flex-shrink-0" />
                  <a href="mailto:info@chainscopeai.co.uk" className="hover:text-carbon-300 transition-colors">info@chainscopeai.co.uk</a>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-carbon-600 flex-shrink-0" />
                  <span>chainscopeai.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5 text-carbon-600 flex-shrink-0" />
                  <a href="https://linkedin.com/company/chainscopeai" target="_blank" rel="noreferrer" className="hover:text-carbon-300 transition-colors">linkedin.com/company/chainscopeai</a>
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-white mb-4">Product</h3>
              <ul className="space-y-2.5">
                {['Hotspot Mapping','Forecasting','Recommendations','Live Grid','AI Assistant','PDF Upload'].map(l => (
                  <li key={l}><button onClick={() => navigate('/signup')} className="text-sm text-carbon-500 hover:text-carbon-200 transition-colors relative group">{l}<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-echo-500 group-hover:w-full transition-all duration-200" /></button></li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-white mb-4">Resources</h3>
              <ul className="space-y-2.5">
                {['Documentation','API Reference','DEFRA Factors','Changelog','Status Page','Blog'].map(l => (
                  <li key={l}><button className="text-sm text-carbon-500 hover:text-carbon-200 transition-colors relative group">{l}<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-echo-500 group-hover:w-full transition-all duration-200" /></button></li>
                ))}
              </ul>
            </div>

            {/* Legal + Social */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-white mb-4">Legal</h3>
              <ul className="space-y-2.5 mb-7">
                {[
                  { label: 'Privacy Policy',  path: '/privacy' },
                  { label: 'Terms of Service', path: '/terms' },
                ].map(({ label, path }) => (
                  <li key={label}><button onClick={() => navigate(path)} className="text-sm text-carbon-500 hover:text-carbon-200 transition-colors relative group">{label}<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-echo-500 group-hover:w-full transition-all duration-200" /></button></li>
                ))}
              </ul>
              <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-white mb-4">Follow Us</h3>
              <div className="flex gap-2.5" role="list">
                {[['LinkedIn', Linkedin, 'https://linkedin.com/company/chainscopeai'], ['Twitter / X', Twitter, '#'], ['YouTube', Youtube, '#']].map(([label, Icon, href]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`ChainscopeAI on ${label}`} role="listitem"
                    className="w-9 h-9 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 hover:bg-echo-500/10 transition-all duration-200 hover:-translate-y-0.5">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-7 space-y-3 text-xs text-carbon-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <p>Chainscope AI Ltd — Company No. 17256706 — Registered in England and Wales</p>
                <p>Registered Office: Worcester, United Kingdom</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap text-carbon-700">
                {['GDPR Compliant','ISO 27001 Certified','DEFRA 2024 Compliant'].map(b => (
                  <span key={b} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-echo-700" />{b}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-carbon-800/60">
              <span>Copyright © {new Date().getFullYear()} Chainscope AI Ltd. All rights reserved.</span>
              <span className="flex gap-5">
                <button onClick={() => navigate('/privacy')} className="hover:text-carbon-400 transition-colors">Privacy</button>
                <button onClick={() => navigate('/terms')}   className="hover:text-carbon-400 transition-colors">Terms</button>
                <button onClick={() => navigate('/contact')} className="hover:text-carbon-400 transition-colors">Contact</button>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ──────────────────── BACK TO TOP ──────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`fixed bottom-7 right-7 z-50 w-11 h-11 rounded-full bg-echo-600 hover:bg-echo-500 flex items-center justify-center shadow-lg shadow-echo-900/50 transition-all duration-500 ${showBtt ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <ArrowUp className="w-4 h-4 text-white" />
      </button>

      {/* CTA pulse keyframe */}
      <style>{`
        @keyframes cta-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(20,209,94,0.55); }
          50%      { box-shadow: 0 0 0 14px rgba(20,209,94,0); }
        }
      `}</style>
    </div>
  );
}
