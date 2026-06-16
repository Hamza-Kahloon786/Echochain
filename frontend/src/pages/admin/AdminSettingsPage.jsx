import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Globe, Building2, Lock, Info } from 'lucide-react';

function SettingRow({ label, value, sub }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-carbon-800/60 last:border-0">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        {sub && <div className="text-xs text-carbon-500 mt-0.5">{sub}</div>}
      </div>
      <div className="text-sm text-carbon-400 text-right shrink-0 max-w-xs">{value}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-carbon-500 mt-1">Platform configuration and admin account information</p>
      </div>

      {/* Admin account */}
      <div className="mb-6 p-6 rounded-2xl border border-carbon-800 bg-carbon-900/40">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-black text-white">Your Admin Account</h2>
        </div>
        <SettingRow label="Email"   value={user?.email || '—'} sub="Your login email address" />
        <SettingRow label="Role"    value="Administrator" sub="Full access to all admin functions" />
        <SettingRow label="Status"  value="Active" sub="Your account is active" />
        <SettingRow label="Company" value={user?.company_name || '—'} sub="Registered company name" />
      </div>

      {/* Platform settings */}
      <div className="mb-6 p-6 rounded-2xl border border-carbon-800 bg-carbon-900/40">
        <div className="flex items-center gap-3 mb-5">
          <Globe className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-black text-white">Platform Settings</h2>
        </div>
        <SettingRow
          label="New User Approval"
          value="Required"
          sub="All new registrations require manual admin approval before the user can log in" />
        <SettingRow
          label="Admin Email"
          value="Configured via ADMIN_EMAIL environment variable"
          sub="The account registered with this email is automatically granted admin role" />
        <SettingRow
          label="Token Expiry"
          value="24 hours"
          sub="JWT access tokens expire after 1440 minutes (configurable via ACCESS_TOKEN_EXPIRE_MINUTES)" />
      </div>

      {/* Company info */}
      <div className="mb-6 p-6 rounded-2xl border border-carbon-800 bg-carbon-900/40">
        <div className="flex items-center gap-3 mb-5">
          <Building2 className="w-5 h-5 text-echo-400" />
          <h2 className="text-base font-black text-white">Company Information</h2>
        </div>
        <SettingRow label="Company Name"  value="Chainscope AI Ltd" sub="Registered legal name" />
        <SettingRow label="Company No."   value="17256706"           sub="Registered in England and Wales" />
        <SettingRow label="Registered Office" value="Worcester, United Kingdom" />
        <SettingRow label="Contact Email" value="info@chainscopeai.co.uk" />
        <SettingRow label="Contact Phone" value="+44 7448 781708" />
      </div>

      {/* Security notice */}
      <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-carbon-400 leading-relaxed">
          <strong className="text-white">Security note:</strong> To change the admin email, platform name, or security settings, edit the <code className="px-1 py-0.5 rounded bg-carbon-800 text-carbon-300 text-[11px]">.env</code> file on the server and restart the backend. Never share your admin credentials.
        </div>
      </div>
    </div>
  );
}
