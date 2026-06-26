import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Menu, X, Mail, Linkedin, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'About',         path: '/about' },
  { label: 'Services',      path: '/services' },
  { label: 'Tech Services', path: '/tech-services' },
  { label: 'Pricing',       path: '/pricing' },
  { label: 'Blog',          path: '/blog' },
  { label: 'Contact',       path: '/contact' },
];

const SECTIONS = [
  { id: 'introduction',    title: '1. Introduction' },
  { id: 'definitions',     title: '2. Definitions' },
  { id: 'services',        title: '3. Description of Services' },
  { id: 'accounts',        title: '4. Account Registration' },
  { id: 'subscription',    title: '5. Subscription & Payment' },
  { id: 'free-trial',      title: '6. Free Trial' },
  { id: 'acceptable-use',  title: '7. Acceptable Use' },
  { id: 'ip',              title: '8. Intellectual Property' },
  { id: 'data-privacy',    title: '9. Data & Privacy' },
  { id: 'liability',       title: '10. Limitation of Liability' },
  { id: 'availability',    title: '11. Service Availability' },
  { id: 'termination',     title: '12. Termination' },
  { id: 'changes',         title: '13. Changes to These Terms' },
  { id: 'governing-law',   title: '14. Governing Law' },
  { id: 'contact',         title: '15. Contact Us' },
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-lg font-black text-white mb-4 pb-3 border-b border-carbon-800/60">{title}</h2>
      <div className="space-y-4 text-carbon-400 text-sm leading-[1.85]">{children}</div>
    </section>
  );
}

function P({ children }) {
  return <p>{children}</p>;
}

function UL({ items }) {
  return (
    <ul className="space-y-2 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-echo-500/60 flex-shrink-0 mt-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [activeId,    setActiveId]    = useState('introduction');
  const asideRef = useRef(null);
  const [tocStyle, setTocStyle] = useState({ display: 'none' });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const updateToc = () => {
      if (!asideRef.current) return;
      const { left, top: rectTop, bottom: rectBottom } = asideRef.current.getBoundingClientRect();
      const top = Math.max(88, rectTop);
      const maxHeight = Math.min(window.innerHeight - top - 20, rectBottom - top - 20);
      if (maxHeight < 60) { setTocStyle({ display: 'none' }); return; }
      setTocStyle({ position: 'fixed', left, top, width: '200px', maxHeight: `${maxHeight}px`, overflowY: 'auto', paddingRight: '4px', zIndex: 40 });
    };

    const onScroll = () => {
      setNavScrolled(window.scrollY > 20);
      updateToc();
      const offsets = SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top } : null;
      }).filter(Boolean);
      const current = offsets.filter(o => o.top <= 120).pop();
      if (current) setActiveId(current.id);
    };

    updateToc();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateToc);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', updateToc); };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            {NAV_LINKS.map(({ label, path }) => (
              <li key={label}>
                <button onClick={() => navigate(path)} className="px-3 py-2 rounded-full text-sm font-medium text-carbon-400 hover:text-white hover:bg-carbon-800/60 transition-all duration-200">{label}</button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/signup')} className="hidden sm:flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors duration-200 shadow-lg shadow-echo-900/40">
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
        style={{ background: 'rgba(15,17,23,0.98)', backdropFilter: 'blur(24px)' }} role="dialog" aria-modal="true">
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 w-11 h-11 rounded-full bg-carbon-800 flex items-center justify-center text-carbon-300 hover:bg-carbon-700 transition-colors"><X className="w-5 h-5" /></button>
        <nav>{NAV_LINKS.map(({ label, path }) => (
          <button key={label} onClick={() => { navigate(path); setMobileOpen(false); }} className="block text-3xl font-bold text-carbon-300 hover:text-white transition-colors py-3 px-8">{label}</button>
        ))}</nav>
        <div className="mt-6">
          <button onClick={() => { navigate('/signup'); setMobileOpen(false); }} className="flex items-center gap-2 px-10 py-3.5 rounded-full text-base font-semibold bg-echo-500 hover:bg-echo-400 text-white transition-colors">Start Free Trial <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="pt-[72px] border-b border-carbon-800/40">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xs text-carbon-600 mb-4">
            <button onClick={() => navigate('/')} className="hover:text-carbon-400 transition-colors">Home</button>
            <span>/</span>
            <span className="text-carbon-400">Terms of Service</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Terms of Service</h1>
          <p className="text-carbon-500 text-sm">Last updated: <span className="text-carbon-300">June 2026</span> &nbsp;|&nbsp; Chainscope AI Ltd — Co. No. 17256706</p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">

          {/* Fixed TOC */}
          <aside ref={asideRef} className="hidden lg:block">
            <div style={tocStyle}>
              <div className="text-[10px] font-bold text-carbon-600 uppercase tracking-widest mb-3 px-1">Contents</div>
              <nav className="space-y-0.5">
                {SECTIONS.map(({ id, title }) => (
                  <button key={id} onClick={() => scrollTo(id)}
                    className={`block w-full text-left text-xs py-1.5 px-3 rounded-lg transition-all duration-150 ${activeId === id ? 'text-echo-400 bg-echo-500/8 font-semibold' : 'text-carbon-500 hover:text-carbon-200 hover:bg-carbon-800/40'}`}>
                    {title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Article */}
          <article className="min-w-0">

            <Section id="introduction" title="1. Introduction">
              <P>These Terms of Service ("Terms") govern your access to and use of the ChainscopeAI platform and related services (collectively, the "Service") provided by Chainscope AI Ltd, a company registered in England and Wales under company number 17256706, with its registered office at Worcester, United Kingdom ("we", "us", or "our").</P>
              <P>By registering for an account, accessing, or using the Service, you agree to be bound by these Terms. If you are accepting these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms. If you do not agree to these Terms, do not use the Service.</P>
              <P>Please read these Terms carefully alongside our <button onClick={() => navigate('/privacy')} className="text-echo-400 hover:text-echo-300 underline underline-offset-2 transition-colors">Privacy Policy</button>, which explains how we collect and use your data.</P>
            </Section>

            <Section id="definitions" title="2. Definitions">
              <UL items={[
                '"Platform" means the ChainscopeAI web application accessible at chainscopeai.co.uk and associated subdomains.',
                '"User" means any individual who creates an account and accesses the Service.',
                '"Customer" means the company or legal entity on whose behalf a User has registered.',
                '"Subscription" means a paid plan granting access to features of the Service.',
                '"Content" means all data, text, reports, and outputs generated through the Service.',
                '"Emissions Data" means the carbon emissions figures, supply chain data, and related calculations entered or generated within the Platform.',
                '"DEFRA Factors" means the emission conversion factors published annually by the UK Department for Environment, Food and Rural Affairs.',
              ]} />
            </Section>

            <Section id="services" title="3. Description of Services">
              <P>ChainscopeAI is an AI-powered carbon intelligence platform designed to help businesses calculate, monitor, and reduce their greenhouse gas emissions. The Service includes:</P>
              <UL items={[
                'Automated Scope 1, 2, and 3 emissions calculation using DEFRA 2024 conversion factors.',
                'Supply chain carbon hotspot identification via an interactive map.',
                'Machine learning-based emissions forecasting (6–24 month horizon).',
                'Streamlined Energy and Carbon Reporting (SECR) compliant report generation.',
                'Live National Grid carbon intensity integration.',
                'AI-generated reduction recommendations.',
                'Data import tools (Excel, PDF) for operational data.',
              ]} />
              <P>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice. We will endeavour to notify active Subscribers of material changes at least 14 days in advance.</P>
            </Section>

            <Section id="accounts" title="4. Account Registration and Security">
              <P>To use the Service, you must register for an account by providing accurate and complete information. All new accounts are subject to approval by our admin team before access is granted.</P>
              <P>You are responsible for:</P>
              <UL items={[
                'Maintaining the confidentiality of your account credentials.',
                'All activity that occurs under your account.',
                'Notifying us immediately at Info@chainscopeai.com if you suspect unauthorised access to your account.',
                'Ensuring all information you provide is accurate and kept up to date.',
              ]} />
              <P>We reserve the right to suspend or terminate any account that we reasonably believe has been compromised, is being used fraudulently, or is in breach of these Terms.</P>
            </Section>

            <Section id="subscription" title="5. Subscription and Payment">
              <P>Access to paid features of the Service requires an active Subscription. Current pricing is:</P>
              <UL items={[
                'Demo Plan: Free, with limited features.',
                'Starter Plan: £49 per month (billed monthly) or £499 per year (billed annually).',
                'Enterprise Plan: Custom pricing — contact Info@chainscopeai.com.',
              ]} />
              <P>All payments are processed securely by Stripe. By subscribing, you authorise us to charge your payment method on a recurring basis. Prices shown are exclusive of VAT where applicable.</P>
              <P>Subscriptions automatically renew at the end of each billing period unless cancelled. You may cancel your Subscription at any time from your account settings; cancellation takes effect at the end of the current billing period and no partial refunds are issued for unused time.</P>
              <P>We reserve the right to change Subscription pricing with 30 days' written notice. Continued use of the Service after a price change constitutes acceptance of the new pricing.</P>
            </Section>

            <Section id="free-trial" title="6. Free Trial">
              <P>We may offer a free trial period for the Starter Plan. During the free trial:</P>
              <UL items={[
                'No payment information is required to begin a trial.',
                'At the end of the trial period, you will need to subscribe to continue using paid features.',
                'We reserve the right to modify or discontinue free trial offers at any time.',
                'One free trial per company. Creating multiple accounts to extend trial periods is prohibited.',
              ]} />
            </Section>

            <Section id="acceptable-use" title="7. Acceptable Use Policy">
              <P>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:</P>
              <UL items={[
                'Use the Service to store or transmit any content that is unlawful, harmful, defamatory, or fraudulent.',
                'Attempt to gain unauthorised access to the Service, its servers, or any connected systems.',
                'Use automated tools, bots, or scripts to extract data from the Platform without our prior written consent.',
                'Reverse engineer, decompile, or disassemble any part of the Platform.',
                'Use the Service to transmit malware, spam, or any code designed to damage, disable, or interfere with any systems.',
                'Resell, sublicense, or otherwise provide access to the Service to third parties without our written authorisation.',
                'Use the Service to generate misleading or fraudulent carbon reports.',
                "Misrepresent your organisation's emissions data.",
              ]} />
              <P>We reserve the right to suspend or terminate access for any User or Customer that breaches this policy, without liability to you.</P>
            </Section>

            <Section id="ip" title="8. Intellectual Property Rights">
              <P>All intellectual property rights in the Platform, including its software, algorithms, machine learning models, design, and documentation, are owned by or licensed to Chainscope AI Ltd. Nothing in these Terms grants you any right in our intellectual property other than the limited licence to use the Service as described herein.</P>
              <P>You retain ownership of all Emissions Data and company data you submit to the Platform. By submitting data, you grant us a limited, non-exclusive licence to process and store that data for the purpose of providing the Service to you.</P>
              <P>Reports and outputs generated by the Platform using your data are owned by you, subject to your active Subscription. We may use anonymised, aggregated data for research, product improvement, and benchmarking purposes.</P>
            </Section>

            <Section id="data-privacy" title="9. Data and Privacy">
              <P>Our collection and use of your personal data is governed by our <button onClick={() => navigate('/privacy')} className="text-echo-400 hover:text-echo-300 underline underline-offset-2 transition-colors">Privacy Policy</button>, which is incorporated into these Terms by reference.</P>
              <P>We process personal data as a data controller under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. By using the Service, you confirm that you have the authority to submit any personal data of third parties (such as employees or contacts) to the Platform, and that doing so complies with applicable data protection law.</P>
            </Section>

            <Section id="liability" title="10. Limitation of Liability">
              <P>To the fullest extent permitted by law, Chainscope AI Ltd shall not be liable for:</P>
              <UL items={[
                'Any indirect, incidental, consequential, or special damages arising from your use of the Service.',
                'Loss of profits, revenue, data, or business opportunities.',
                'Inaccuracies in emissions calculations resulting from incorrect data provided by you.',
                'Any regulatory penalties or compliance failures arising from your use of the Platform.',
                'Service outages or interruptions outside our reasonable control.',
              ]} />
              <P>Our total aggregate liability to you for any claim arising from these Terms or your use of the Service shall not exceed the total amount paid by you to us in the 12 months immediately preceding the claim.</P>
              <P>Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.</P>
            </Section>

            <Section id="availability" title="11. Service Availability and Disclaimers">
              <P>We aim to make the Service available 99.5% of the time, measured monthly, excluding scheduled maintenance. However, we do not warrant that the Service will be uninterrupted, error-free, or free from security vulnerabilities.</P>
              <P>The Service is provided "as is" and "as available". Emissions calculations are provided for informational purposes and are based on the data you supply and the DEFRA conversion factors in use at the time. We do not warrant the accuracy of any third-party data sources (including National Grid ESO API data).</P>
              <P>ChainscopeAI does not provide legal, financial, or regulatory compliance advice. You should seek independent professional advice for formal compliance obligations.</P>
            </Section>

            <Section id="termination" title="12. Termination">
              <P>You may terminate your account at any time by contacting us at Info@chainscopeai.com or via your account settings. Upon termination, your access to paid features will cease at the end of your current billing period.</P>
              <P>We may terminate or suspend your account immediately, without notice, if we believe you have materially breached these Terms, engaged in fraudulent activity, or if required to do so by law.</P>
              <P>On termination, we will retain your data for 30 days to allow for data export, after which it may be deleted in accordance with our data retention policy. You are responsible for exporting any data you wish to retain before termination.</P>
            </Section>

            <Section id="changes" title="13. Changes to These Terms">
              <P>We may update these Terms from time to time. We will notify you of material changes by email or by displaying a notice within the Platform at least 14 days before the changes take effect.</P>
              <P>Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Service and cancel your Subscription before the changes take effect.</P>
            </Section>

            <Section id="governing-law" title="14. Governing Law and Jurisdiction">
              <P>These Terms and any dispute or claim arising from or in connection with them (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of England and Wales.</P>
              <P>You and we each irrevocably agree that the courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms or their subject matter or formation.</P>
            </Section>

            <Section id="contact" title="15. Contact Us">
              <P>If you have any questions about these Terms, please contact us:</P>
              <UL items={[
                'Email: Info@chainscopeai.com',
                'Phone: +44 7448 781708',
                'Post: Chainscope AI Ltd, Worcester, United Kingdom',
                'Company No: 17256706 — Registered in England and Wales',
              ]} />
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/contact')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                  Contact Us <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/privacy')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-colors duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                  Privacy Policy
                </button>
              </div>
            </Section>

          </article>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-carbon-800/60 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-carbon-600">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-echo-500 to-echo-700 flex items-center justify-center"><Leaf className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-semibold text-carbon-500">ChainscopeAI</span>
            </div>
            <div className="space-y-1">
              <p>Chainscope AI Ltd — Company No. 17256706 — Registered in England and Wales</p>
              <p>Registered Office: Worcester, United Kingdom &nbsp;|&nbsp; Info@chainscopeai.com</p>
            </div>
            <div className="flex items-center gap-3">
              {[['https://linkedin.com/company/chainscopeai', Linkedin], ['mailto:Info@chainscopeai.com', Mail], ['https://chainscopeai.com', Globe]].map(([href, Icon]) => (
                <a key={href} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-carbon-800 border border-carbon-700 flex items-center justify-center text-carbon-500 hover:text-echo-400 hover:border-echo-500/40 transition-all duration-200">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-carbon-800/60 text-xs text-carbon-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>Copyright © {new Date().getFullYear()} Chainscope AI Ltd. All rights reserved.</span>
            <span className="flex gap-5">
              <button onClick={() => navigate('/terms')} className="hover:text-carbon-400 transition-colors">Terms</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-carbon-400 transition-colors">Privacy</button>
              <button onClick={() => navigate('/contact')} className="hover:text-carbon-400 transition-colors">Contact</button>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
