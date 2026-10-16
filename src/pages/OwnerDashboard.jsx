import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

const ACTIONS = [
  {
    id: 'assess',
    icon: Target,
    title: 'Check your credit profile',
    text: 'Use business activity signals to understand how a lender may view your application.',
    tone: 'bg-teal-600',
  },
  {
    id: 'impact',
    icon: TrendingUp,
    title: 'See how Vridhi works',
    text: 'Learn how alternative data can support businesses without a traditional bureau history.',
    tone: 'bg-indigo-600',
  },
];

const STEPS = [
  'Enter a few business and cash-flow details',
  'Review the factors that help or hurt your profile',
  'Explore an illustrative loan recommendation',
];

export default function OwnerDashboard({ onNavigate, isOnline }) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-9 text-white shadow-lg">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
            <Sparkles className="h-3.5 w-3.5" /> MSME Owner workspace
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-4xl">Build a clearer path to credit.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Vridhi AI helps you understand your business profile using signals beyond a traditional bureau score. Start with an illustrative assessment and see what lenders may consider.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={() => onNavigate('assess')} className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-950/30 transition hover:bg-teal-400">
              Check my profile <ArrowRight className="h-4 w-4" />
            </button>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${isOnline ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`}>
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {isOnline ? 'Assessment engine ready' : 'Assessment engine offline'}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <h2 className="text-base font-bold text-slate-900">What you can understand here</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">A simple, explainable view of your business signals. No score is final and no loan is approved automatically.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{index + 1}</span>
                <span>{step}</span>
                <CheckCircle2 className="ml-auto h-4 w-4 text-teal-600" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><HelpCircle className="h-5 w-5" /></div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Before you begin</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Keep these details nearby for a useful assessment.</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-teal-600">•</span> Recent monthly UPI inflow or digital sales activity</li>
            <li className="flex gap-2"><span className="text-teal-600">•</span> GST filing and utility payment patterns</li>
            <li className="flex gap-2"><span className="text-teal-600">•</span> Existing debt and the amount you want to borrow</li>
          </ul>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your next step</h2>
            <p className="text-xs text-slate-500">Choose where you would like to start.</p>
          </div>
          <FileSearch className="h-5 w-5 text-slate-300" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.id} onClick={() => onNavigate(action.id)} className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${action.tone}`}><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-teal-700">{action.title}<ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" /></span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{action.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">Synthetic demo data · Vridhi AI provides an analytical view, not a lending decision.</p>
    </div>
  );
}
