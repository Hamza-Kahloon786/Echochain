import { useNavigate, useParams } from 'react-router-dom';
import {
  Leaf, ArrowRight, Menu, X, ArrowLeft, Clock, Calendar,
  Mail, Linkedin, Globe, Check, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

/* ── Blog post data ──────────────────────────────────────────── */
export const POSTS = [
  {
    slug: 'why-50000-uk-businesses-failing-carbon-reporting',
    week: 'Week 1',
    date: 'June 2026',
    category: 'Regulation & Compliance',
    categoryColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    readTime: '5 min read',
    title: 'Why 50,000 UK Businesses Are Failing Their Carbon Reporting Obligations',
    metaDescription: 'SECR regulations require thousands of businesses to report carbon emissions annually. Most are not compliant. Here is why — and how AI is changing that.',
    excerpt: 'Every year, thousands of businesses are legally required to report their carbon emissions under the Streamlined Energy and Carbon Reporting regulations. Every year, most of them struggle to do it affordably.',
    content: [
      {
        type: 'intro',
        text: 'Every year, thousands of businesses are legally required to report their carbon emissions under the Streamlined Energy and Carbon Reporting regulations. Every year, most of them struggle to do it affordably. Professional carbon technology specialists charge between £5,000 and £30,000 per year — and for most SMEs, that cost is simply not possible. The result is that carbon compliance has become something only large corporations can afford. That is about to change.',
      },
      {
        type: 'heading',
        text: 'What SECR Actually Requires',
      },
      {
        type: 'paragraph',
        text: 'The Streamlined Energy and Carbon Reporting framework requires qualifying UK businesses to include energy and carbon information in their annual Directors\' Report. Businesses that qualify include all UK incorporated companies and LLPs that are either quoted on a recognised stock exchange, or unquoted but large — defined as employing more than 250 people, or with a turnover above £36 million and a balance sheet above £18 million.',
      },
      {
        type: 'paragraph',
        text: 'The report must include: total UK energy consumption from all activities, at least one intensity metric such as emissions per £ of turnover, a description of energy efficiency measures taken, and Scope 1 and Scope 2 greenhouse gas emissions data calculated using DEFRA-approved emission factors.',
      },
      {
        type: 'heading',
        text: 'Why Most Businesses Are Not Compliant',
      },
      {
        type: 'paragraph',
        text: 'Despite these clear legal requirements, a substantial proportion of qualifying businesses either submit incomplete reports, use out-of-date emission factors, or fail to report at all. There are three primary reasons for this.',
      },
      {
        type: 'bullets',
        items: [
          'Cost: Professional carbon consultants charge between £5,000 and £30,000 per year. For a business with £50 million turnover, that represents a meaningful line item — for a business at the qualifying threshold, it is often unaffordable.',
          'Complexity: Calculating Scope 1 and Scope 2 emissions requires applying DEFRA conversion factors to fuel consumption, electricity use, and other energy inputs. Without dedicated software, this means large, error-prone spreadsheets.',
          'Awareness: Many businesses at the qualifying threshold are not aware they are required to report, or are uncertain about their obligations and defer action.',
        ],
      },
      {
        type: 'heading',
        text: 'The Supply Chain Dimension',
      },
      {
        type: 'paragraph',
        text: 'The compliance gap is widening. Large corporations are now required to include Scope 3 supply chain emissions in their own reporting — which means they need carbon data from every supplier in their network. Businesses that cannot provide that data are increasingly being removed from approved supplier lists. What started as a direct compliance obligation for larger businesses has become an indirect compliance pressure on every SME in the UK supply chain.',
      },
      {
        type: 'heading',
        text: 'How AI Is Changing This',
      },
      {
        type: 'paragraph',
        text: 'ChainscopeAI was built specifically to eliminate the cost barrier. Using official DEFRA 2024 emission conversion factors, machine learning forecasting, and GPT-4o AI report generation, the platform automatically calculates your Scope 1, 2, and 3 emissions — and generates a fully compliant SECR report with one click. The result: professional carbon compliance at SME prices, without the need for a consultant.',
      },
      {
        type: 'cta',
        text: 'If your business has SECR reporting obligations, or if you supply businesses that do, the time to act is now.',
        btnText: 'Start Free Trial',
        btnLink: '/signup',
      },
    ],
  },
  {
    slug: 'what-is-scope-3-carbon-and-why-customers-are-asking',
    week: 'Week 2',
    date: 'June 2026',
    category: 'Carbon Education',
    categoryColor: 'bg-echo-500/10 border-echo-500/20 text-echo-400',
    readTime: '6 min read',
    title: 'What is Scope 3 Carbon — And Why Your Biggest Customers Are Asking You About It',
    metaDescription: 'Your biggest customers are asking their suppliers to provide verified Scope 3 emissions data. Here is what that means, why it matters, and how to prepare before you lose a contract.',
    excerpt: 'If you have received a supplier questionnaire recently asking about your carbon emissions, you are not alone. Large companies across the UK are legally and commercially required to report their Scope 3 supply chain emissions.',
    content: [
      {
        type: 'intro',
        text: 'If you have received a supplier questionnaire recently asking about your carbon emissions, you are not alone. Large companies across the UK are legally and commercially required to report their Scope 3 supply chain emissions — which means your emissions data is now their problem. Businesses that cannot provide verified carbon data are increasingly finding themselves removed from supplier lists. Here is what Scope 3 actually means and what you need to do about it.',
      },
      {
        type: 'heading',
        text: 'The Three Scopes — A Plain English Guide',
      },
      {
        type: 'paragraph',
        text: 'Carbon emissions are categorised into three scopes under the GHG Protocol, the international standard for carbon accounting.',
      },
      {
        type: 'bullets',
        items: [
          'Scope 1 — Direct emissions: These are the emissions you create directly. Burning gas in your boilers, diesel in your company vehicles, fuel in your delivery fleet. You own these emissions completely.',
          'Scope 2 — Indirect energy emissions: These are the emissions from the electricity you buy and use. You do not generate the electricity yourself, but the power station that does generates carbon on your behalf. The amount varies depending on when and where you consume electricity.',
          'Scope 3 — Supply chain and value chain emissions: Everything else. The emissions embedded in the products and services you buy from suppliers. The emissions from transport and distribution you do not own. The emissions from your customers using your product. This category typically accounts for 70 to 90 percent of a company\'s total carbon footprint.',
        ],
      },
      {
        type: 'heading',
        text: 'Why Scope 3 Has Become a Commercial Pressure',
      },
      {
        type: 'paragraph',
        text: 'Until recently, Scope 3 was largely voluntary for UK businesses. That has changed. Under SECR and emerging requirements aligned with the Task Force on Climate-Related Financial Disclosures, large UK companies are now expected to include Scope 3 data in their annual reporting. Because Scope 3 includes the emissions of every supplier in their network, those companies need that data from you.',
      },
      {
        type: 'paragraph',
        text: 'The practical result: if you supply to a large retailer, manufacturer, NHS trust, or government body, you will increasingly receive supplier carbon questionnaires. If you cannot answer them with verified data — not estimates, not guesses — you risk being marked as non-compliant and removed from the approved supplier list.',
      },
      {
        type: 'heading',
        text: 'What "Verified" Actually Means',
      },
      {
        type: 'paragraph',
        text: 'Verified emissions data means calculations made using official DEFRA emission conversion factors, applied to actual operational data — fuel consumption, electricity use, transport distances and modes, and so on. A spreadsheet estimate based on turnover or headcount is not sufficient. What is required is methodology-backed calculation with traceable inputs.',
      },
      {
        type: 'heading',
        text: 'How to Prepare',
      },
      {
        type: 'bullets',
        items: [
          'Collect your operational data: fuel bills, electricity consumption, transport data, supplier spend categories.',
          'Apply DEFRA 2024 emission conversion factors to each activity — or use a platform like ChainscopeAI that does this automatically.',
          'Document your methodology so you can answer questionnaires with confidence.',
          'Generate a Scope 3 emissions figure you can share with customers in a standardised format.',
        ],
      },
      {
        type: 'paragraph',
        text: 'ChainscopeAI automates all of this. The platform calculates your full Scope 1, 2, and 3 emissions baseline using DEFRA 2024 factors, builds a carbon hotspot map of your supply chain, and generates a verified report you can share with any customer or auditor.',
      },
      {
        type: 'cta',
        text: 'The next supplier questionnaire that asks about your carbon data does not need to catch you off guard.',
        btnText: 'Calculate Your Scope 3 Now',
        btnLink: '/signup',
      },
    ],
  },
  {
    slug: 'how-ai-making-carbon-management-affordable-smes',
    week: 'Week 3',
    date: 'July 2026',
    category: 'Technology',
    categoryColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    readTime: '7 min read',
    title: 'How AI Is Making Carbon Management Affordable for SMEs Globally',
    metaDescription: 'Machine learning, live grid data, and AI report generation are replacing expensive consultants. Here is how ChainscopeAI uses peer-reviewed research to deliver enterprise carbon intelligence at SME prices.',
    excerpt: 'Carbon management has always been a problem that technology should solve — but until recently, the technology available was either too expensive, too generic, or too complex for small businesses to use.',
    content: [
      {
        type: 'intro',
        text: 'Carbon management has always been a problem that technology should solve — but until recently, the technology available was either too expensive, too generic, or too complex for small businesses to use. ChainscopeAI was built from the ground up to change this. Drawing on peer-reviewed research published at IEEE-affiliated international conferences, the platform combines Random Forest machine learning, live National Grid data, and GPT-4o AI to give every business the same carbon intelligence that large corporations pay tens of thousands of pounds for — at a fraction of the cost.',
      },
      {
        type: 'heading',
        text: 'The Research Foundation',
      },
      {
        type: 'paragraph',
        text: 'ChainscopeAI\'s approach is grounded in academic research into industrial decarbonisation, supply chain optimisation, and applied artificial intelligence. The platform was designed by a Chemical Engineering researcher with published work in AI-driven sustainability and industrial Net Zero. That foundation matters: every algorithm and methodology in the platform has been validated against real-world data and peer-reviewed literature, not invented as a commercial shortcut.',
      },
      {
        type: 'heading',
        text: 'Random Forest ML for Emissions Forecasting',
      },
      {
        type: 'paragraph',
        text: 'One of the core innovations in ChainscopeAI is the use of Random Forest machine learning models to forecast emissions trajectories. Unlike simple linear projections, Random Forest models can identify non-linear patterns in emissions data — seasonal variations, growth-driven increases, the effect of specific reduction initiatives on the trend line. The model is trained on your historical emissions data and outputs a 6 to 24-month forecast with confidence intervals.',
      },
      {
        type: 'paragraph',
        text: 'This matters because carbon reporting is not just about where you are — it is about where you are heading. A business approaching a regulatory threshold needs to know that six months in advance, not after the fact. A business that has implemented a reduction initiative needs to know whether it is working. ML forecasting provides that visibility.',
      },
      {
        type: 'heading',
        text: 'Live National Grid Integration',
      },
      {
        type: 'paragraph',
        text: 'Most carbon management platforms calculate electricity-related emissions using annual average grid emission factors. ChainscopeAI integrates directly with the National Grid ESO API to retrieve live carbon intensity data — updated every 30 minutes. This matters significantly for businesses with large electricity consumption or EV fleets, because the actual carbon intensity of the grid varies by a factor of three or more between low-carbon windows (high renewable generation) and high-carbon windows (high gas generation).',
      },
      {
        type: 'heading',
        text: 'GPT-4o SECR Report Generation',
      },
      {
        type: 'paragraph',
        text: 'Generating a compliant SECR report previously required a specialist consultant to gather data, apply emission factors, write methodology statements, and format the output correctly. ChainscopeAI automates this entire process using GPT-4o, which formats your emissions data into the exact structure required by regulatory authorities — including methodology statements, emission factor references, year-on-year comparisons, and intensity metrics. What consultants charged £3,000 to £10,000 to produce now takes one click.',
      },
      {
        type: 'heading',
        text: 'The Price Point That Changes Everything',
      },
      {
        type: 'paragraph',
        text: 'The combination of machine learning, live data integration, and AI report generation is not new technology in isolation. What is new is the price. ChainscopeAI delivers all of this from £49 per month — or £499 per year. That is a reduction of 97 percent or more compared to traditional carbon management consultancy. For the 50,000+ UK businesses with carbon reporting obligations who could previously not afford professional compliance, that difference is everything.',
      },
      {
        type: 'cta',
        text: 'Enterprise carbon intelligence. SME prices. Built on research that works.',
        btnText: 'See the Platform',
        btnLink: '/signup',
      },
    ],
  },
  {
    slug: 'from-research-to-startup-story-behind-chainscope-ai',
    week: 'Week 4',
    date: 'July 2026',
    category: 'Founder Story',
    categoryColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    readTime: '4 min read',
    title: 'From Research to Startup: The Story Behind CHAINSCOPE AI',
    metaDescription: 'How peer-reviewed research in chemical engineering and industrial decarbonisation became a platform making carbon intelligence accessible to every business.',
    excerpt: 'CHAINSCOPE AI started with a simple observation: industrial decarbonisation is still too expensive and too difficult for most businesses.',
    content: [
      {
        type: 'intro',
        text: 'CHAINSCOPE AI started with a simple observation: industrial decarbonisation is still too expensive and too difficult for most businesses.',
      },
      {
        type: 'paragraph',
        text: 'During my research in chemical engineering, AI, and industrial Net Zero, I explored how data-driven approaches could reduce carbon emissions while improving operational performance. The research involved real supply chains, real emissions data, and real organisations trying to navigate the gap between ambition and action on sustainability.',
      },
      {
        type: 'paragraph',
        text: 'I realised that although large corporations had access to expensive sustainability platforms — tools that cost tens of thousands of pounds per year and required specialist consultants to operate — SMEs were left entirely behind. The technology existed. The knowledge existed. The regulatory pressure existed. But the affordable, accessible implementation did not.',
      },
      {
        type: 'paragraph',
        text: 'That insight led to the creation of CHAINSCOPE AI.',
      },
      {
        type: 'heading',
        text: 'Research That Became a Platform',
      },
      {
        type: 'paragraph',
        text: 'The platform was not built speculatively. It was built from validated research into how machine learning models can identify carbon hotspots in complex supply chains, how live energy data can replace outdated average emission factors, and how AI can automate the reporting process that previously required specialist knowledge to complete correctly.',
      },
      {
        type: 'paragraph',
        text: 'That research foundation is what makes ChainscopeAI different from a generic SaaS tool built by developers without domain expertise. Every feature in the platform exists because the underlying research showed it delivers measurably better carbon intelligence than the alternatives.',
      },
      {
        type: 'heading',
        text: 'The Mission',
      },
      {
        type: 'paragraph',
        text: 'Our mission is simple: make carbon intelligence affordable, practical, and accessible through AI-powered tools and expert support. We believe sustainability should not be limited to companies with large budgets. Every business should have access to technology that helps them measure, understand, and reduce emissions — without needing to hire a team of consultants.',
      },
      {
        type: 'paragraph',
        text: 'CHAINSCOPE AI exists to help make that transition possible. The platform is live. The price is accessible. The research behind it is published. And the need — for affordable, accurate, actionable carbon intelligence across UK supply chains — has never been greater.',
      },
      {
        type: 'cta',
        text: 'If you believe carbon intelligence should be accessible to every business, not just the largest ones — this platform was built for you.',
        btnText: 'Start Free Trial',
        btnLink: '/signup',
      },
    ],
  },
];

/* ── Nav ──────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'About',         path: '/about' },
  { label: 'Services',      path: '/services' },
  { label: 'Tech Services', path: '/tech-services' },
  { label: 'Pricing',       path: '/pricing' },
  { label: 'Blog',          path: '/blog', active: true },
  { label: 'Contact',       path: '/contact' },
];

/* ── Shared navbar ────────────────────────────────────────────── */
function BlogNav({ navScrolled, mobileOpen, setMobileOpen, navigate }) {
  return (
    <>
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

      <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(15,17,23,0.98)', backdropFilter: 'blur(24px)' }}
        role="dialog" aria-modal="true">
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 w-11 h-11 rounded-full bg-carbon-800 flex items-center justify-center text-carbon-300 hover:bg-carbon-700 transition-colors">
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
    </>
  );
}

/* ── Shared footer ────────────────────────────────────────────── */
function BlogFooter() {
  return (
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
  );
}

/* ── Blog listing page ────────────────────────────────────────── */
function BlogListing({ navigate }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-[72px] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', top: '0%', left: '20%', width: '600px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,209,94,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-echo-500/25 bg-echo-500/10 text-echo-400 text-xs font-semibold tracking-widest uppercase mb-6">
            <Leaf className="w-3 h-3" /> ChainscopeAI Blog
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.1] text-white mb-5">
            Carbon intelligence.<br />
            <span style={{ background: 'linear-gradient(135deg, #14d15e 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Plain English.
            </span>
          </h1>
          <p className="text-carbon-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Practical guidance on carbon compliance, SECR reporting, Scope 3 emissions, and AI-driven sustainability — written by a Chemical Engineering researcher with published IEEE work in industrial decarbonisation.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="border-t border-carbon-800/40 py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {POSTS.slice(0, 3).map((post, i) => (
              <div
                key={post.slug}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group flex flex-col rounded-2xl border border-carbon-800 overflow-hidden cursor-pointer hover:border-carbon-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
                style={{ background: '#13151f' }}
              >
                {/* Top colour strip */}
                <div className="relative h-64 overflow-hidden bg-white">
                  <img src="/favicon.svg" alt="ChainscopeAI" className="w-full h-full object-cover" />
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
        </div>
      </section>

      {/* Newsletter / CTA strip */}
      <section className="py-16 border-t border-carbon-800/40">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Want to see the platform in action?</h2>
          <p className="text-carbon-400 text-sm mb-7">Start a free trial or book a 30-minute discovery call with our team.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <a href="mailto:Info@chainscopeai.com?subject=Discovery%20Call%20Request"
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              <Calendar className="w-4 h-4" /> Book a Discovery Call
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Individual post page ─────────────────────────────────────── */
function BlogPost({ post, navigate }) {
  const otherPosts = POSTS.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div>
      {/* Back + header */}
      <div className="pt-[72px] border-b border-carbon-800/40">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-10">
          <button onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-sm text-carbon-500 hover:text-carbon-200 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Blog
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${post.categoryColor}`}>{post.category}</span>
            <span className="text-xs text-carbon-500 font-semibold uppercase tracking-widest">{post.week}</span>
            <span className="w-1 h-1 rounded-full bg-carbon-700" />
            <span className="flex items-center gap-1 text-xs text-carbon-600"><Clock className="w-3 h-3" />{post.readTime}</span>
            <span className="w-1 h-1 rounded-full bg-carbon-700" />
            <span className="flex items-center gap-1 text-xs text-carbon-600"><Calendar className="w-3 h-3" />{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-echo-500/30">
              <img src="/about.jpg" alt="Muhammad Hamza Tariq" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Muhammad Hamza Tariq</div>
              <div className="text-xs text-carbon-500">Founder & CEO, Chainscope AI Ltd</div>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8 items-start">

          {/* Main content */}
          <article className="prose-chainscopeai">
            {post.content.map((block, i) => {
              if (block.type === 'intro') return (
                <p key={i} className="text-lg md:text-xl text-carbon-200 leading-[1.85] font-medium mb-8 pb-8 border-b border-carbon-800/60">
                  {block.text}
                </p>
              );
              if (block.type === 'heading') return (
                <h2 key={i} className="text-xl md:text-2xl font-black text-white mt-10 mb-4 leading-snug">
                  {block.text}
                </h2>
              );
              if (block.type === 'paragraph') return (
                <p key={i} className="text-carbon-400 text-base leading-[1.85] mb-5">
                  {block.text}
                </p>
              );
              if (block.type === 'bullets') return (
                <ul key={i} className="space-y-3 my-6">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-carbon-300 text-sm leading-relaxed">
                      <Check className="w-4 h-4 text-echo-400 flex-shrink-0 mt-1" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
              if (block.type === 'cta') return (
                <div key={i} className="my-10 p-7 rounded-2xl border border-echo-500/20 bg-echo-500/5">
                  <p className="text-carbon-300 text-sm leading-relaxed mb-5 italic">{block.text}</p>
                  <button onClick={() => navigate(block.btnLink)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                    {block.btnText} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
              return null;
            })}
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[88px] space-y-5">
            {/* About author */}
            <div className="p-6 rounded-2xl border border-carbon-800 bg-carbon-900/70 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-echo-500/30">
                  <img src="/about.jpg" alt="Muhammad Hamza Tariq" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Muhammad Hamza Tariq</div>
                  <div className="text-xs text-carbon-500">Founder & CEO</div>
                </div>
              </div>
              <p className="text-xs text-carbon-500 leading-relaxed mb-4">
                Chemical Engineering researcher. MSc Supply Chain Management. Published IEEE research in industrial decarbonisation. Founder of Chainscope AI Ltd.
              </p>
              <a href="https://linkedin.com/company/chainscopeai" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-xs text-echo-400 hover:text-echo-300 transition-colors font-semibold">
                <Linkedin className="w-3.5 h-3.5" /> Connect on LinkedIn
              </a>
            </div>

            {/* Platform CTA */}
            <div className="p-6 rounded-2xl border border-echo-500/20 bg-echo-500/5">
              <div className="text-sm font-bold text-white mb-2">Try ChainscopeAI</div>
              <p className="text-xs text-carbon-500 leading-relaxed mb-4">
                Scope 1, 2 &amp; 3 tracking, SECR reports, ML forecasting. From £49/month.
              </p>
              <button onClick={() => navigate('/signup')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* More posts */}
            {otherPosts.length > 0 && (
              <div className="p-6 rounded-2xl border border-carbon-800 bg-carbon-900/70">
                <div className="text-xs font-bold tracking-widest uppercase text-carbon-500 mb-4">More Articles</div>
                <div className="space-y-4">
                  {otherPosts.map(p => (
                    <button key={p.slug} onClick={() => navigate(`/blog/${p.slug}`)}
                      className="text-left group w-full">
                      <div className="text-xs font-semibold text-white leading-snug group-hover:text-echo-300 transition-colors mb-1">{p.title}</div>
                      <div className="text-[10px] text-carbon-600">{p.week} · {p.readTime}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────── */
export default function BlogPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const post = slug ? POSTS.find(p => p.slug === slug) : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [slug]);

  if (slug && !post) {
    navigate('/blog');
    return null;
  }

  return (
    <div className="overflow-x-hidden" style={{ background: '#0f1117', color: '#e4e4ec' }}>
      <BlogNav navScrolled={navScrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} navigate={navigate} />
      {post
        ? <BlogPost post={post} navigate={navigate} />
        : <BlogListing navigate={navigate} />
      }
      <BlogFooter />
    </div>
  );
}
