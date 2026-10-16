import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
} from 'lucide-react';

const ROLES = {
  lender: {
    label: 'Lender',
    title: 'Make faster, fairer credit decisions.',
    description: 'Assess applicants, monitor portfolios and explain every recommendation to your credit committee.',
    icon: Briefcase,
    accent: 'teal',
    bullets: ['Assess individual MSMEs in seconds', 'Run portfolio and fairness audits', 'Export explainable batch results'],
  },
  owner: {
    label: 'MSME Owner',
    title: 'Understand your path to credit.',
    description: 'See how your business signals affect eligibility and learn what can strengthen your application.',
    icon: Store,
    accent: 'cyan',
    bullets: ['See an alternative-data assessment', 'Understand what raises or lowers risk', 'Explore a practical loan recommendation'],
  },
};

export default function SignIn({ onBack, onSuccess }) {
  const [role, setRole] = useState('lender');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const current = ROLES[role];
  const Icon = current.icon;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid work email address.');
      return;
    }
    if (password.trim().length < 4) {
      setError('Use a password with at least 4 characters for this demo.');
      return;
    }
    setError('');
    onSuccess({ role, email: email.trim() });
  };

  const useDemo = () => {
    setEmail(role === 'lender' ? 'credit.team@demo.vridhi.ai' : 'owner@demo.vridhi.ai');
    setPassword('demo1234');
    setError('');
  };

  return (
    <div className="signin-page min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="w-full max-w-5xl relative z-10">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Vridhi AI
        </button>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
          <aside className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-teal-800 via-slate-900 to-slate-950">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Vridhi AI</p>
                  <p className="text-xs text-teal-200/70">Explainable credit intelligence</p>
                </div>
              </div>
              <div className="mt-24 max-w-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-teal-200/70">{current.label} workspace</p>
                <h1 className="mt-4 text-4xl font-bold leading-tight">{current.title}</h1>
                <p className="mt-5 text-sm leading-6 text-slate-300">{current.description}</p>
              </div>
            </div>
            <div className="space-y-3">
              {current.bullets.map((bullet) => (
                <div key={bullet} className="flex gap-3 items-center text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-teal-400/15 text-teal-300 flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></span>
                  {bullet}
                </div>
              ))}
              <p className="pt-5 text-xs text-slate-500">Synthetic demo environment · No real lending decision is made here.</p>
            </div>
          </aside>

          <main className="p-6 sm:p-10 text-slate-900">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
              <span className="font-bold text-lg">Vridhi AI</span>
            </div>
            <div className="mb-7">
              <p className="text-sm text-slate-500">Welcome back</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Sign in to your workspace</h2>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-7" role="tablist" aria-label="Choose workspace">
              {Object.entries(ROLES).map(([key, value]) => {
                const RoleIcon = value.icon;
                const active = role === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => { setRole(key); setError(''); }}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <RoleIcon className="w-4 h-4" /> {value.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Work email</span>
                <span className="mt-1.5 flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === 'lender' ? 'you@lender.com' : 'you@business.com'} className="w-full py-3 text-sm outline-none" autoComplete="email" />
                </span>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <span className="mt-1.5 flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-500">
                  <LockKeyhole className="w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full py-3 text-sm outline-none" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </span>
              </label>

              {error && <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</p>}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" className="accent-teal-600" /> Keep me signed in</label>
                <button type="button" className="font-semibold text-teal-700 hover:text-teal-900">Forgot password?</button>
              </div>

              <button type="submit" className="w-full rounded-xl bg-teal-700 text-white py-3.5 text-sm font-bold hover:bg-teal-800 transition flex items-center justify-center gap-2">
                Sign in as {current.label} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button type="button" onClick={useDemo} className="text-sm font-semibold text-teal-700 hover:text-teal-900">Use demo credentials</button>
              <p className="mt-3 text-xs text-slate-400">Demo only. Authentication is simulated locally for this prototype.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
