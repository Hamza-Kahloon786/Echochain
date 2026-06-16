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
  { id: 'introduction',   title: '1. Introduction' },
  { id: 'controller',     title: '2. Data Controller' },
  { id: 'data-collected', title: '3. Data We Collect' },
  { id: 'how-we-use',     title: '4. How We Use Your Data' },
  { id: 'lawful-basis',   title: '5. Lawful Basis for Processing' },
  { id: 'sharing',        title: '6. Data Sharing' },
  { id: 'retention',      title: '7. Data Retention' },
  { id: 'your-rights',    title: '8. Your Rights (UK GDPR)' },
  { id: 'cookies',        title: '9. Cookies' },
  { id: 'security',       title: '10. Data Security' },
  { id: 'transfers',      title: '11. International Transfers' },
  { id: 'children',       title: '12. Children\'s Privacy' },
  { id: 'changes',        title: '13. Changes to This Policy' },
  { id: 'contact',        title: '14. Contact & Complaints' },
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-lg font-black text-white mb-4 pb-3 border-b border-carbon-800/60">{title}</h2>
      <div className="space-y-4 text-carbon-400 text-sm leading-[1.85]">{children}</div>
    </section>
  );
}

function P({ children }) { return <p>{children}</p>; }

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

function Table({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-carbon-800 mt-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-carbon-800" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {rows[0].map((h, i) => <th key={i} className="px-4 py-3 text-left font-bold text-white">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i} className="border-b border-carbon-800/40 last:border-0">
              {row.map((cell, j) => <td key={j} className="px-4 py-3 text-carbon-400">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
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

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
            <span className="text-carbon-400">Privacy Policy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-carbon-500 text-sm">Last updated: <span className="text-carbon-300">June 2026</span> &nbsp;|&nbsp; Chainscope AI Ltd — Co. No. 17256706 &nbsp;|&nbsp; ICO Registered</p>
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
              <P>Chainscope AI Ltd ("we", "us", or "our") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and the rights you have in relation to it.</P>
              <P>This policy applies to all users of the ChainscopeAI platform (chainscopeai.co.uk) and any related services, including our website, email communications, and support channels.</P>
              <P>We process personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. By using our Service, you acknowledge that you have read and understood this policy.</P>
            </Section>

            <Section id="controller" title="2. Data Controller">
              <P>The data controller for personal data processed through the ChainscopeAI platform is:</P>
              <div className="p-5 rounded-xl border border-carbon-800 bg-carbon-900/40 text-sm space-y-1">
                <p className="text-white font-semibold">Chainscope AI Ltd</p>
                <p>Company No. 17256706</p>
                <p>Registered in England and Wales</p>
                <p>Registered Office: Worcester, United Kingdom</p>
                <p>Email: <a href="mailto:info@chainscopeai.co.uk" className="text-echo-400 hover:text-echo-300 transition-colors">info@chainscopeai.co.uk</a></p>
                <p>Phone: +44 7448 781708</p>
              </div>
              <P>For data protection enquiries, please contact us at the email address above with "Data Protection" in the subject line.</P>
            </Section>

            <Section id="data-collected" title="3. Data We Collect">
              <P>We collect the following categories of personal and business data:</P>
              <p className="font-semibold text-white">Account and Identity Data</p>
              <UL items={[
                'Full name and job title (where provided)',
                'Company name and company registration number',
                'Business email address',
                'Business phone number',
                'Billing address',
                'Password (stored as a one-way bcrypt hash — we never store plain-text passwords)',
              ]} />
              <p className="font-semibold text-white">Operational and Emissions Data</p>
              <UL items={[
                'Supply chain data (supplier names, locations, production volumes)',
                'Energy consumption data (fuel, electricity, gas)',
                'Transport data (routes, modes, distances, freight weights)',
                'Emissions figures calculated by the Platform',
                'Files uploaded (Excel spreadsheets, PDF invoices)',
              ]} />
              <p className="font-semibold text-white">Technical and Usage Data</p>
              <UL items={[
                'IP address and browser type',
                'Pages visited and features used within the Platform',
                'Session duration and login timestamps',
                'Error logs for debugging and quality assurance',
              ]} />
              <p className="font-semibold text-white">Payment Data</p>
              <P>Payment card details are handled entirely by Stripe and are never stored on our servers. We only receive a payment reference token and subscription status from Stripe.</P>
            </Section>

            <Section id="how-we-use" title="4. How We Use Your Data">
              <Table rows={[
                ['Purpose', 'Data used', 'Lawful basis'],
                ['Provide the Platform and calculate emissions', 'Account data, operational data', 'Performance of contract'],
                ['Process subscription payments', 'Account data, Stripe reference', 'Performance of contract'],
                ['Respond to support enquiries', 'Account data, contact data', 'Legitimate interests'],
                ['Send service notifications and updates', 'Email address', 'Performance of contract / Legitimate interests'],
                ['Improve platform performance and features', 'Usage data, anonymised emissions data', 'Legitimate interests'],
                ['Comply with legal obligations', 'Account data, transaction records', 'Legal obligation'],
                ['Fraud prevention and account security', 'Login data, IP address', 'Legitimate interests'],
                ['Send marketing communications (opt-in only)', 'Email address', 'Consent'],
              ]} />
            </Section>

            <Section id="lawful-basis" title="5. Lawful Basis for Processing">
              <P>Under UK GDPR, we process your personal data on the following lawful bases:</P>
              <UL items={[
                'Performance of contract — to provide the Service you have signed up for.',
                'Legitimate interests — to operate our business securely, prevent fraud, and improve our Service, where these interests are not overridden by your rights.',
                'Legal obligation — where we are required to retain or process data by law (for example, financial records under UK tax law).',
                'Consent — for optional marketing communications, which you may withdraw at any time.',
              ]} />
            </Section>

            <Section id="sharing" title="6. Data Sharing and Third Parties">
              <P>We do not sell your personal data. We share data only with trusted sub-processors as necessary to provide the Service:</P>
              <Table rows={[
                ['Sub-processor', 'Purpose', 'Location'],
                ['MongoDB Atlas', 'Database hosting', 'EU / UK'],
                ['Stripe', 'Payment processing', 'USA (Standard Contractual Clauses)'],
                ['OpenAI', 'AI report generation (GPT-4o)', 'USA (Standard Contractual Clauses)'],
                ['Google Maps Platform', 'Carbon hotspot map', 'USA (Standard Contractual Clauses)'],
                ['National Grid ESO API', 'Live grid carbon intensity', 'UK'],
              ]} />
              <P>We may disclose data to law enforcement or regulatory authorities if required by law, court order, or to protect the rights and safety of Chainscope AI Ltd or others.</P>
            </Section>

            <Section id="retention" title="7. Data Retention">
              <P>We retain your personal data for as long as your account is active and for a period thereafter as required by law or our legitimate interests:</P>
              <UL items={[
                'Account data: retained for the duration of your account, plus 7 years after closure (in line with UK financial record-keeping requirements).',
                'Emissions and operational data: retained for the duration of your subscription, plus 30 days post-cancellation to allow data export.',
                'Payment records: retained for 7 years as required by HMRC.',
                'Support correspondence: retained for 3 years.',
                'Usage logs: retained for 12 months.',
              ]} />
              <P>You may request earlier deletion of your data, subject to our legal obligations to retain certain records. Contact us at info@chainscopeai.co.uk to make a deletion request.</P>
            </Section>

            <Section id="your-rights" title="8. Your Rights Under UK GDPR">
              <P>As a UK data subject, you have the following rights in relation to your personal data:</P>
              <UL items={[
                'Right of access — you may request a copy of the personal data we hold about you.',
                'Right to rectification — you may ask us to correct inaccurate or incomplete data.',
                'Right to erasure ("right to be forgotten") — you may ask us to delete your data, subject to legal retention obligations.',
                'Right to restrict processing — you may ask us to pause processing your data in certain circumstances.',
                'Right to data portability — you may request your data in a machine-readable format.',
                'Right to object — you may object to processing based on legitimate interests or for direct marketing.',
                'Rights related to automated decision-making — we do not make solely automated decisions with legal or similarly significant effects on individuals.',
              ]} />
              <P>To exercise any of these rights, please contact us at info@chainscopeai.co.uk. We will respond within one calendar month. There is no charge for most requests, unless they are manifestly unfounded or excessive.</P>
            </Section>

            <Section id="cookies" title="9. Cookies">
              <P>We use a small number of essential cookies required to operate the Platform:</P>
              <Table rows={[
                ['Cookie', 'Purpose', 'Duration'],
                ['auth_token (localStorage)', 'Stores your session token to keep you logged in', 'Until logout or 24 hours'],
                ['_stripe_mid', 'Stripe fraud prevention', 'Session'],
              ]} />
              <P>We do not currently use advertising, analytics (e.g., Google Analytics), or tracking cookies. If we introduce non-essential cookies in the future, we will update this policy and request your consent where required.</P>
            </Section>

            <Section id="security" title="10. Data Security">
              <P>We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss, or destruction, including:</P>
              <UL items={[
                'All passwords are hashed using bcrypt with a salt — plain-text passwords are never stored.',
                'All data in transit is encrypted using TLS 1.2 or higher.',
                'Access to production systems is restricted to authorised personnel only.',
                'Regular security reviews and dependency updates.',
                'JWT authentication tokens expire after 24 hours.',
              ]} />
              <P>No method of transmission over the internet or electronic storage is 100% secure. We will notify you and, where required, the Information Commissioner's Office (ICO) of any data breach in accordance with UK GDPR requirements.</P>
            </Section>

            <Section id="transfers" title="11. International Data Transfers">
              <P>Some of our sub-processors (OpenAI, Stripe, Google) are based in the United States. Where we transfer personal data outside the UK, we ensure appropriate safeguards are in place, such as UK-approved Standard Contractual Clauses (SCCs) or an adequacy decision.</P>
              <P>By using the Service, you consent to the transfer of your data to these third-party sub-processors as described in this policy, subject to the safeguards described above.</P>
            </Section>

            <Section id="children" title="12. Children's Privacy">
              <P>The ChainscopeAI Service is intended for use by businesses and professionals aged 18 and over. We do not knowingly collect personal data from individuals under the age of 18. If we become aware that we have collected data from a minor, we will delete it promptly.</P>
            </Section>

            <Section id="changes" title="13. Changes to This Privacy Policy">
              <P>We may update this Privacy Policy from time to time to reflect changes in our practices, the Service, or applicable law. When we make material changes, we will notify you by email and/or by displaying a notice in the Platform.</P>
              <P>The "Last updated" date at the top of this page indicates when this policy was last revised. We encourage you to review this policy periodically.</P>
            </Section>

            <Section id="contact" title="14. Contact Us and Complaints">
              <P>If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us:</P>
              <div className="p-5 rounded-xl border border-carbon-800 bg-carbon-900/40 text-sm space-y-1">
                <p className="text-white font-semibold">Chainscope AI Ltd — Data Protection Contact</p>
                <p>Email: <a href="mailto:info@chainscopeai.co.uk" className="text-echo-400 hover:text-echo-300 transition-colors">info@chainscopeai.co.uk</a></p>
                <p>Phone: +44 7448 781708</p>
                <p>Post: Chainscope AI Ltd, Worcester, United Kingdom</p>
              </div>
              <p className="font-semibold text-white mt-4">Right to complain to the ICO</p>
              <P>If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO):</P>
              <UL items={[
                'Website: ico.org.uk',
                'Helpline: 0303 123 1113',
                'Post: Information Commissioner\'s Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF',
              ]} />
              <P>We would, however, appreciate the opportunity to address your concern before you approach the ICO. Please contact us first and we will do our best to resolve any issue promptly.</P>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/contact')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #14d15e 0%, #09ad4a 100%)' }}>
                  Contact Us <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/terms')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-carbon-300 hover:text-white transition-colors duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                  Terms of Service
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
              <p>Registered Office: Worcester, United Kingdom &nbsp;|&nbsp; info@chainscopeai.co.uk</p>
            </div>
            <div className="flex items-center gap-3">
              {[['https://linkedin.com/company/chainscopeai', Linkedin], ['mailto:info@chainscopeai.co.uk', Mail], ['https://chainscopeai.com', Globe]].map(([href, Icon]) => (
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
