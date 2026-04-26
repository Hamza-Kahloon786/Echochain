import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, Map, TrendingUp, Lightbulb, Activity, FileText,
  ArrowRight, Play, ChevronLeft, ChevronRight, Menu, X,
  Check, Star, Globe, Building2, Truck, ShoppingCart,
  Heart, Zap, Mail, Twitter, Linkedin, Youtube, Github,
  ArrowUp, Shield, Clock, BarChart3, Sparkles,
} from 'lucide-react';

/* ── Static data ────────────────────────────────────────────────── */

const FEATURES = [
  {
    Icon: Map, color: 'echo',
    title: 'Carbon Hotspot Mapping',
    desc:  'AI pinpoints the highest-emission nodes across your supplier network, warehouses, and transport routes on an interactive geo-map.',
  },
  {
    Icon: TrendingUp, color: 'blue',
    title: 'Emissions Forecasting',
    desc:  'Predict carbon output up to 12 months ahead with ML models trained on DEFRA 2024 emission factors and your historical data.',
  },
  {
    Icon: Lightbulb, color: 'amber',
    title: 'Smart Recommendations',
    desc:  'Receive prioritised, actionable reduction strategies aligned with UK Net Zero targets and sector-specific benchmarks.',
  },
  {
    Icon: Zap, color: 'cyan',
    title: 'Live UK Grid Intensity',
    desc:  'Real-time carbon intensity from National Grid ESO — schedule energy-intensive operations for low-carbon windows automatically.',
  },
  {
    Icon: Globe, color: 'purple',
    title: 'Supply Chain Network',
    desc:  'Visualise your entire supply network as a geo-located graph. Drill into any node to see granular Scope 1, 2, and 3 data.',
  },
  {
    Icon: FileText, color: 'rose',
    title: 'PDF Intelligence',
    desc:  'Upload supplier sustainability reports — AI extracts and ingests emission data automatically, no manual re-entry required.',
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

const USE_CASES = [
  { img: 'https://picsum.photos/id/42/800/500',   Icon: ShoppingCart, tag: 'FMCG Retail',    title: 'Scope 3 Supplier Audit',              stat: '31% fewer Scope 3 emissions' },
  { img: 'https://picsum.photos/id/180/800/500',  Icon: Truck,        tag: 'Logistics',      title: 'Route Emission Optimisation',         stat: '200+ routes re-routed to low-carbon' },
  { img: 'https://picsum.photos/id/96/800/500',   Icon: Heart,        tag: 'Healthcare',     title: 'NHS Supply Chain Decarbonisation',    stat: '18% reduction across 120 suppliers' },
  { img: 'https://picsum.photos/id/1031/800/500', Icon: Building2,    tag: 'Manufacturing',  title: 'Factory Footprint Reduction',         stat: '45% lower transport-related emissions' },
];

const TESTIMONIALS = [
  { quote: "EchoChain flagged three warehouse sites we hadn't even identified in our manual audit. We redirected those savings into 11 new renewable energy contracts.", name: 'Priya Sharma',  role: 'Head of Sustainability, PulseGroup',         img: 'https://picsum.photos/id/1025/100/100' },
  { quote: "The forecasting engine is genuinely impressive. We now model the carbon impact of a supplier swap before committing — that's never been possible before.", name: 'James Clifton', role: 'Supply Chain Director, NovaTech UK',          img: 'https://picsum.photos/id/1012/100/100' },
  { quote: "Setup took 20 minutes. Within a week we had a full heatmap of our UK operations. The AI recommendations alone justified the subscription in month one.",   name: 'Rachel Torres', role: 'ESG Officer, LayerStack',                     img: 'https://picsum.photos/id/1027/100/100' },
  { quote: "Live grid intensity scheduling cut our electricity-related emissions by 22% — we didn't change a single process, just shifted the timing.",               name: 'David Okafor',  role: 'Operations Manager, ClearPath Logistics',    img: 'https://picsum.photos/id/1074/100/100' },
  { quote: "Our investors now ask for EchoChain reports directly. It's become the standard for how we communicate carbon performance across the board.",              name: 'Emma Walsh',    role: 'CEO, Apex Green Manufacturing',              img: 'https://picsum.photos/id/1062/100/100' },
];

const STATS = [
  { label: 'Suppliers Tracked',    value: 500,  suffix: '+',  decimal: false },
  { label: 'Forecast Accuracy',    value: 98,   suffix: '%',  decimal: false },
  { label: 'Avg CO₂ Saved / Month',value: 2.3,  suffix: 't',  decimal: true  },
  { label: 'Platform Uptime',      value: 99.9, suffix: '%',  decimal: true  },
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
  const [counters,      setCounters]      = useState([0, 0, 0, 0]);
  const [countStarted,  setCountStarted]  = useState(false);
  const [newsEmail,     setNewsEmail]     = useState('');
  const [newsState,     setNewsState]     = useState('idle'); // idle|loading|ok|err
  const statsRef = useRef(null);

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

  /* ── Stats counter ───────────────────────────────────────────────── */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !countStarted) {
        setCountStarted(true);
        STATS.forEach((stat, i) => {
          const start = performance.now();
          const step = (now) => {
            const p  = Math.min((now - start) / 1600, 1);
            const e  = 1 - Math.pow(1 - p, 4);
            const v  = e * stat.value;
            setCounters(prev => { const n = [...prev]; n[i] = stat.decimal ? parseFloat(v.toFixed(1)) : Math.round(v); return n; });
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [countStarted]);

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
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group" aria-label="EchoChain home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center shadow-lg shadow-echo-900/40 group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">EchoChain</span>
          </button>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {[['features','Features'],['about','About'],['cases','Use Cases'],['testimonials','Reviews']].map(([id, label]) => (
              <li key={id}>
                <button onClick={() => scrollTo(id)} className="px-4 py-2 rounded-full text-sm font-medium text-carbon-400 hover:text-white hover:bg-carbon-800/60 transition-all duration-200">
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden sm:block px-4 py-2 text-sm font-medium text-carbon-300 hover:text-white transition-colors duration-200">
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="hidden sm:flex btn-primary text-sm items-center gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
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
          {[['features','Features'],['about','About'],['cases','Use Cases'],['testimonials','Reviews'],['contact','Contact']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} className="block text-3xl font-bold text-carbon-300 hover:text-white transition-colors py-3 px-8">
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={() => { navigate('/signup'); setMobileOpen(false); }} className="btn-primary px-10 py-3.5 text-base flex items-center gap-2">
            Get Started Free <ArrowRight className="w-4 h-4" />
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
          <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translateX(-50%)', width:'900px', height:'2px', background:'linear-gradient(90deg, transparent, rgba(20,209,94,0.15), transparent)' }} />
        </div>

        {/* ── Top text zone ── */}
        <div className="relative z-10 text-center w-full max-w-4xl mx-auto px-8 pt-16 pb-10">

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
              Intelligence
            </span>
            <br />
            <span className="text-white">for UK Supply Chains</span>
          </h1>

          {/* Typewriter sub-line */}
          <p className="text-echo-400 font-semibold text-lg mb-5 h-7" aria-live="polite">
            {twText}
            <span className="inline-block w-[2px] h-[1em] bg-echo-500 ml-0.5 align-middle animate-pulse rounded-sm" aria-hidden="true" />
          </p>

          <p className="text-base md:text-lg text-carbon-400 max-w-[560px] mx-auto leading-relaxed mb-10">
            Pinpoint emission hotspots, forecast trends with AI, and get ranked reduction actions — all in one platform.
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
              onClick={() => scrollTo('features')}
              className="text-sm font-semibold px-7 py-3 rounded-xl text-carbon-300 hover:text-white transition-all duration-200 flex items-center gap-2"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
            >
              <Play className="w-3.5 h-3.5 text-echo-400" /> See how it works
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              {['1025','1012','1027','1074','1062'].map(id => (
                <img key={id} src={`https://picsum.photos/id/${id}/32/32`} alt=""
                  className="w-7 h-7 rounded-full border-2 object-cover"
                  style={{ borderColor: '#0f1117' }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-carbon-500">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />)}
              </div>
              <span><strong className="text-carbon-300 font-semibold">500+</strong> UK businesses · No card required</span>
            </div>
          </div>
        </div>

        {/* ── Dashboard mockup ── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-16">
          <div className="relative">

            {/* Glow under mockup */}
            <div className="absolute -inset-x-4 -bottom-8 h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(20,209,94,0.12) 0%, transparent 70%)' }} aria-hidden="true" />

            {/* Browser chrome */}
            <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]"
              style={{ background: '#13151f' }}
            >
              {/* Browser top bar */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#1a1c27' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-echo-500/70" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs text-carbon-500" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-echo-400 animate-pulse" />
                    app.echochain.io/dashboard
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-carbon-600">
                  <Shield className="w-3 h-3 text-echo-600" /> Secure
                </div>
              </div>

              {/* Dashboard UI */}
              <div className="flex" style={{ height: '420px', background: '#0e1018' }}>

                {/* Sidebar */}
                <div className="hidden md:flex flex-col w-[200px] flex-shrink-0 border-r py-4" style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#13151f' }}>
                  <div className="flex items-center gap-2.5 px-4 mb-6">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #14d15e, #09ad4a)' }}>
                      <Leaf className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">EchoChain</span>
                  </div>
                  {[
                    { icon: BarChart3, label: 'Dashboard', active: true },
                    { icon: Globe,     label: 'Suppliers',  active: false },
                    { icon: Truck,     label: 'Transport',  active: false },
                    { icon: Map,       label: 'Hotspot Map',active: false },
                    { icon: TrendingUp,label: 'Forecasting',active: false },
                    { icon: Sparkles,  label: 'AI Assistant',active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div key={label} className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg mb-0.5 cursor-default transition-colors ${active ? 'text-white' : 'text-carbon-600'}`}
                      style={active ? { background: 'rgba(20,209,94,0.12)', border: '1px solid rgba(20,209,94,0.15)' } : {}}>
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-echo-400' : ''}`} />
                      <span className="text-xs font-medium">{label}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-echo-400" />}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 overflow-hidden">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                    {[
                      { label: 'Total Emissions', value: '847 tCO₂e', delta: '-12%', up: false, color: '#14d15e' },
                      { label: 'Active Hotspots',  value: '3',         delta: '+1',   up: true,  color: '#f59e0b' },
                      { label: 'Suppliers',        value: '42',        delta: '+5',   up: true,  color: '#3b82f6' },
                      { label: 'Grid Intensity',   value: '182 gCO₂',  delta: 'Live', up: false, color: '#a855f7' },
                    ].map(kpi => (
                      <div key={kpi.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-[10px] text-carbon-600 mb-1.5 truncate">{kpi.label}</div>
                        <div className="text-sm font-bold text-white mb-1">{kpi.value}</div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full`}
                            style={{ background: kpi.up ? 'rgba(239,68,68,0.12)' : 'rgba(20,209,94,0.12)', color: kpi.up ? '#f87171' : '#4ade80' }}>
                            {kpi.delta}
                          </span>
                          <span className="text-[10px] text-carbon-600 hidden sm:inline">vs last mo</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart + hotspots row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Emission trend chart */}
                    <div className="sm:col-span-2 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-white">Emission Trend</span>
                        <span className="text-[10px] text-carbon-600 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>Last 6 months</span>
                      </div>
                      <svg viewBox="0 0 280 90" className="w-full" aria-hidden="true">
                        <defs>
                          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14d15e" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#14d15e" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        {[20,45,70].map(y => <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                        {/* Area fill */}
                        <path d="M0,72 C20,68 40,60 70,55 C100,50 120,42 150,38 C180,34 210,30 240,25 C260,22 270,20 280,18 L280,90 L0,90 Z" fill="url(#chartFill)" />
                        {/* Line */}
                        <path d="M0,72 C20,68 40,60 70,55 C100,50 120,42 150,38 C180,34 210,30 240,25 C260,22 270,20 280,18" fill="none" stroke="#14d15e" strokeWidth="2" strokeLinecap="round" />
                        {/* Forecast dashed */}
                        <path d="M240,25 C255,20 270,16 280,12" fill="none" stroke="#14d15e" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
                        {/* Point */}
                        <circle cx="240" cy="25" r="4" fill="#14d15e" />
                        <circle cx="240" cy="25" r="7" fill="rgba(20,209,94,0.2)" />
                        {/* Month labels */}
                        {[['Nov','0'],['Dec','56'],['Jan','112'],['Feb','168'],['Mar','224'],['Apr','280']].map(([m, x]) => (
                          <text key={m} x={x} y="88" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">{m}</text>
                        ))}
                      </svg>
                    </div>

                    {/* Hotspot list */}
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-white">Top Hotspots</span>
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      </div>
                      {[
                        { name: 'DHL Depot — M1',   pct: 78, color: '#ef4444' },
                        { name: 'Supplier #14 — Leeds', pct: 54, color: '#f59e0b' },
                        { name: 'Cold Chain WH B',  pct: 31, color: '#3b82f6' },
                      ].map(h => (
                        <div key={h.name} className="mb-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-carbon-400 truncate pr-1">{h.name}</span>
                            <span className="text-[10px] font-bold flex-shrink-0" style={{ color: h.color }}>{h.pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${h.pct}%`, background: h.color, opacity: 0.85 }} />
                          </div>
                        </div>
                      ))}
                      <button className="mt-3 w-full text-[10px] font-semibold text-echo-400 hover:text-echo-300 flex items-center justify-center gap-1 transition-colors">
                        View all <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating metric cards */}
            <div className="absolute -left-4 top-[30%] hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border"
              style={{ background: 'rgba(19,21,31,0.92)', borderColor: 'rgba(20,209,94,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(20,209,94,0.1)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(20,209,94,0.12)' }}>
                <TrendingUp className="w-4 h-4 text-echo-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">−31% CO₂</div>
                <div className="text-[10px] text-carbon-500">vs baseline this quarter</div>
              </div>
            </div>

            <div className="absolute -right-4 top-[22%] hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border"
              style={{ background: 'rgba(19,21,31,0.92)', borderColor: 'rgba(59,130,246,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">Grid: Low</div>
                <div className="text-[10px] text-carbon-500">Best window: 14:00–18:00</div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-[18%] hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border"
              style={{ background: 'rgba(19,21,31,0.92)', borderColor: 'rgba(168,85,247,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.12)' }}>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none mb-1">3 AI actions</div>
                <div className="text-[10px] text-carbon-500">ready to implement now</div>
              </div>
            </div>
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
          <div className="flex items-center justify-center gap-4 flex-wrap" role="list">
            {['NHS Supply Chain','Network Rail','DHL UK','Marks & Spencer','Tesco'].map(name => (
              <div key={name} role="listitem"
                className="px-7 py-3.5 rounded-xl bg-carbon-900/70 border border-carbon-800 text-carbon-500 text-sm font-semibold tracking-tight backdrop-blur-sm grayscale hover:grayscale-0 hover:text-carbon-200 hover:border-carbon-700 transition-all duration-300 hover:-translate-y-0.5 cursor-default"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────── FEATURES ──────────────────── */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16 lp-animate">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/8 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-5">
              <BarChart3 className="w-3 h-3" /> Platform Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Everything you need to reach<br />
              <span className="text-echo-400">Net Zero faster</span>
            </h2>
            <p className="text-carbon-400 text-lg mt-4 max-w-xl mx-auto leading-relaxed">
              One unified platform for all your carbon intelligence — powered by AI models trained on real UK supply chain data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`lp-animate lp-delay-${i + 1} group p-7 rounded-2xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-sm cursor-default transition-all duration-300 hover:-translate-y-1.5 hover:border-carbon-700 hover:shadow-2xl hover:shadow-black/40 relative overflow-hidden`}
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(20,209,94,0.05) 0%, transparent 70%)' }} aria-hidden="true" />
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-4deg] ${ICON_STYLE[f.color].wrap}`}>
                  <f.Icon className={`w-5 h-5 ${ICON_STYLE[f.color].icon}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2.5">{f.title}</h3>
                <p className="text-sm text-carbon-400 leading-relaxed">{f.desc}</p>
                <button onClick={() => navigate('/signup')} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-echo-400 hover:gap-3 transition-all duration-200">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── ABOUT / STATS ──────────────────── */}
      <section id="about" className="py-24 md:py-32 border-t border-carbon-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Image side */}
            <div className="lp-animate-left relative rounded-2xl overflow-hidden group" style={{ opacity: 0, transform: 'translateX(-32px)' }}>
              <img
                src="https://picsum.photos/id/1/800/600"
                alt="EchoChain dashboard showing carbon hotspot analysis"
                loading="lazy"
                className="w-full h-[460px] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(20,209,94,0.1), rgba(9,173,74,0.05))' }} aria-hidden="true" />
              {/* Floating badge */}
              <div className="absolute bottom-5 left-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0f1117]/90 border border-carbon-800 backdrop-blur-lg">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Live Hotspot Engine</div>
                  <div className="text-xs text-carbon-500 mt-0.5">Updated every 60 seconds</div>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="lp-animate-right" style={{ opacity: 0, transform: 'translateX(32px)' }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/8 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-5">
                <Shield className="w-3 h-3" /> Why EchoChain
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-4">
                Built for businesses that<br />
                <span className="text-echo-400">can't afford to miss</span>
              </h2>
              <p className="text-carbon-400 text-base leading-relaxed mb-7">
                We built EchoChain because spreadsheets and annual audits can't keep pace with the urgency of Net Zero. Our AI engine runs continuously, catching new hotspots as your supply chain evolves.
              </p>

              <ul className="space-y-3.5 mb-9" aria-label="Key benefits">
                {[
                  'AI-driven hotspot detection across Scope 1, 2, and 3 emissions',
                  'Deploy in under 30 minutes with guided onboarding and sample data',
                  'Aligned with DEFRA 2024 factors, GHG Protocol, and UK Net Zero targets',
                  'Enterprise-grade security — SOC 2 Type II, ISO 27001, GDPR compliant',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-carbon-300">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-echo-500/15 border border-echo-500/30 flex items-center justify-center" aria-hidden="true">
                      <Check className="w-3 h-3 text-echo-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Stat counter grid */}
              <div ref={statsRef} className="grid grid-cols-2 gap-4" role="list">
                {STATS.map((s, i) => (
                  <div key={s.label} role="listitem" className="p-5 rounded-xl bg-carbon-900/70 border border-carbon-800 backdrop-blur-sm">
                    <div className="text-3xl font-black text-echo-400 leading-none tabular-nums">
                      {counters[i]}{s.suffix}
                    </div>
                    <div className="text-xs text-carbon-500 mt-1.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── USE CASES / PORTFOLIO ──────────────────── */}
      <section id="cases" className="py-24 md:py-32 border-t border-carbon-800/40">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16 lp-animate">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/8 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-5">
              <Sparkles className="w-3 h-3" /> Real-World Results
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              How UK businesses use<br />
              <span className="text-echo-400">EchoChain every day</span>
            </h2>
            <p className="text-carbon-400 text-lg mt-4 max-w-xl mx-auto">
              From retail to healthcare — see how teams across industries map and cut their carbon footprint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {USE_CASES.map((uc, i) => (
              <div key={uc.title} className={`lp-animate lp-delay-${i + 1} group relative rounded-2xl overflow-hidden cursor-pointer border border-carbon-800 hover:border-carbon-700 transition-all duration-300`} style={{ aspectRatio: '16/10' }}>
                <img src={uc.img} alt={uc.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                {/* Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6" style={{ background: 'linear-gradient(to top, rgba(15,17,23,0.96) 0%, rgba(15,17,23,0.4) 60%, transparent 100%)' }}>
                  <span className="inline-block mb-2 px-3 py-1 rounded-full bg-echo-500/20 border border-echo-500/35 text-echo-400 text-xs font-semibold tracking-wide translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {uc.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-[40ms]">{uc.title}</h3>
                  <p className="text-sm text-echo-400 font-semibold translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-[80ms]">{uc.stat}</p>
                </div>
                {/* Always-visible tag */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f1117]/80 border border-carbon-800 backdrop-blur-sm">
                  <uc.Icon className="w-3.5 h-3.5 text-echo-400" aria-hidden="true" />
                  <span className="text-xs font-semibold text-carbon-300">{uc.tag}</span>
                </div>
              </div>
            ))}
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
                <span className="text-lg font-bold text-white tracking-tight">EchoChain</span>
              </div>
              <p className="text-sm text-carbon-500 leading-relaxed mb-5 max-w-[240px]">
                AI-powered carbon intelligence for UK supply chains. Identify hotspots, forecast emissions, reach Net Zero.
              </p>
              {/* Newsletter */}
              <form onSubmit={handleNewsletter} noValidate aria-label="Newsletter signup">
                <div className="flex gap-2">
                  <input
                    type="email" value={newsEmail} onChange={e => { setNewsEmail(e.target.value); setNewsState('idle'); }}
                    placeholder="Your email" className="input-field flex-1 text-sm py-2.5"
                    aria-label="Email address" required
                  />
                  <button type="submit" className="btn-primary px-4 py-2.5 text-sm" disabled={newsState === 'loading'}>
                    {newsState === 'loading' ? '...' : <Mail className="w-4 h-4" />}
                  </button>
                </div>
                {newsState === 'ok'  && <p className="text-xs text-echo-400 mt-2">You're subscribed!</p>}
                {newsState === 'err' && <p className="text-xs text-red-400 mt-2">Please enter a valid email.</p>}
              </form>
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
                {['Privacy Policy','Terms of Service','Cookie Policy','GDPR'].map(l => (
                  <li key={l}><button className="text-sm text-carbon-500 hover:text-carbon-200 transition-colors relative group">{l}<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-echo-500 group-hover:w-full transition-all duration-200" /></button></li>
                ))}
              </ul>
              <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-white mb-4">Social</h3>
              <div className="flex gap-2.5" role="list">
                {[['Twitter / X', Twitter], ['LinkedIn', Linkedin], ['YouTube', Youtube], ['GitHub', Github]].map(([label, Icon]) => (
                  <button key={label} aria-label={`EchoChain on ${label}`} role="listitem"
                    className="w-9 h-9 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 hover:bg-echo-500/10 transition-all duration-200 hover:-translate-y-0.5">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-7 flex-wrap gap-4 text-xs text-carbon-600">
            <span>© {new Date().getFullYear()} EchoChain Ltd. All rights reserved.</span>
            <span className="flex gap-5">
              {['Privacy','Terms','Cookies'].map(l => (
                <button key={l} className="hover:text-carbon-400 transition-colors">{l}</button>
              ))}
            </span>
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
