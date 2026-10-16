import { motion } from 'motion/react';
import { ArrowRight, BarChart3, CheckCircle2, FileSearch, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import summaryData from './data/summary.json';
import './landing.css';

const VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4';
const ease = [0.22, 1, 0.36, 1];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});
const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, delay, ease },
});

const STATS = [
  [summaryData.AUC_thin_file_creditlens.toFixed(3), 'AUC on no-bureau businesses', 'alternative data signal'],
  [`${summaryData.creditlens_approval_rate}%`, 'Portfolio approval rate', 'synthetic demo portfolio'],
  [`${summaryData.good_thin_file_approved_creditlens_pct}%`, 'Good thin-file businesses approved', 'with Vridhi AI'],
  [`${summaryData.forecast_MAPE_pct}%`, 'Cash-flow forecast error', 'MAPE on demo history'],
];

const SIGNALS = ['GST behaviour', 'UPI cash flow', 'Utility payments', 'Invoice collection', 'Fairness audit', 'Cash-flow forecast'];

function ActionButton({ children, onClick, light = false }) {
  return (
    <button onClick={onClick} className={`group inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-bold transition-all ${light ? 'border border-slate-300 bg-white/80 text-slate-900 hover:border-teal-400 hover:bg-white' : 'bg-teal-700 text-white shadow-lg shadow-teal-900/15 hover:bg-teal-800'}`}>
      {children}
      <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${light ? 'bg-teal-50 text-teal-700' : 'bg-teal-400 text-slate-950'}`}><ArrowRight className="h-4 w-4" /></span>
    </button>
  );
}

function CreditCardVisual() {
  return (
    <div className="landing-card-stage" aria-hidden="true">
      <div className="landing-credit-card">
        <div className="landing-card-shine" />
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-12 items-center justify-center rounded-lg border border-white/30 bg-white/15 shadow-inner">
            <span className="h-5 w-7 rounded-md bg-gradient-to-br from-amber-100 via-amber-300 to-amber-600 shadow-sm" />
          </span>
          <ShieldCheck className="h-7 w-7 text-teal-200/90" />
        </div>
        <div className="mt-10 flex items-center gap-2 text-lg tracking-[0.22em] text-white/90">
          <span>••••</span><span>••••</span><span>••••</span><span>2048</span>
        </div>
        <div className="mt-5 flex items-end justify-between text-[9px] uppercase tracking-[0.18em] text-white/55">
          <div><p>Vridhi member</p><p className="mt-1 text-xs font-semibold tracking-[0.1em] text-white/85">MSME ACCESS</p></div>
          <div className="text-right"><p>Valid thru</p><p className="mt-1 text-xs font-semibold tracking-[0.1em] text-white/85">12/30</p></div>
        </div>
      </div>
      <div className="landing-card-orbit landing-card-orbit-one" />
      <div className="landing-card-orbit landing-card-orbit-two" />
    </div>
  );
}

export default function Landing({ onEnter }) {
  return (
    <div className="landing-root min-h-screen overflow-x-hidden bg-[#F3F8F7] text-slate-950">
      <div className="landing-hero-shell relative flex min-h-screen flex-col overflow-hidden">
        <nav className="relative z-20 mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-5 lg:px-10">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-900/15"><ShieldCheck className="h-5 w-5" /></span>
            <span className="text-xl font-bold tracking-tight text-slate-950">Vridhi AI</span>
          </button>
          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#signals" className="transition hover:text-teal-700">Signals</a>
            <a href="#impact" className="transition hover:text-teal-700">Impact</a>
            <a href="#workflow" className="transition hover:text-teal-700">How it works</a>
          </div>
          <button onClick={onEnter} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800">Sign in</button>
        </nav>

        <section className="relative mx-auto flex w-full max-w-[88rem] flex-1 px-4 pb-5 sm:px-6 lg:px-10">
          <div className="landing-hero-card relative flex min-h-[calc(100vh-100px)] w-full items-end overflow-hidden rounded-[2rem] bg-slate-900 p-7 sm:p-10 lg:items-center lg:p-16">
            <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-35" src={VIDEO} />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-teal-950/20" />
            <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
            <CreditCardVisual />
            <div className="relative z-10 max-w-2xl pb-4 lg:pb-0">
              <motion.div {...fadeUp(0.1)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/10 px-4 py-2 text-xs font-semibold text-teal-100">
                <Sparkles className="h-3.5 w-3.5" /> Explainable credit intelligence for MSMEs
              </motion.div>
              <motion.h1 {...fadeUp(0.2)} className="max-w-xl text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">Credit decisions built for the <span className="text-teal-300">real economy.</span></motion.h1>
              <motion.p {...fadeUp(0.35)} className="mt-6 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">Vridhi AI helps lenders understand credit-invisible businesses through GST behaviour, UPI cash flow and operational signals — with a reason behind every score.</motion.p>
              <motion.div {...fadeUp(0.5)} className="mt-8 flex flex-wrap items-center gap-3"><ActionButton onClick={onEnter}>Explore the platform</ActionButton><a href="#signals"><ActionButton light>See how it works</ActionButton></a></motion.div>
              <motion.p {...fadeUp(0.65)} className="mt-5 text-xs text-slate-400">Synthetic demo data · Designed for lenders and MSME owners</motion.p>
              <motion.div {...fadeUp(0.8)} className="mt-12 max-w-xl overflow-hidden border-t border-white/15 pt-4">
                <div className="landing-marquee-track">{[...SIGNALS, ...SIGNALS].map((item, index) => <span key={`${item}-${index}`} className="landing-marquee-item">{item}</span>)}</div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <section id="signals" className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10 lg:py-28">
        <motion.div {...inView()} className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">One view. More context.</p><h2 className="mt-4 max-w-lg text-4xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">From credit-invisible to credit-worthy.</h2><div className="mt-8"><ActionButton onClick={onEnter}>Start an assessment</ActionButton></div></div>
          <p className="max-w-xl text-xl leading-relaxed text-slate-600 sm:text-2xl">A practical risk workspace that combines alternative business signals with plain-language explanations, scenario testing and a fairness audit.</p>
        </motion.div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[{ icon: FileSearch, title: 'Every score explained', text: 'See the signals that raise or lower default risk in clear language.' }, { icon: TrendingUp, title: 'Built for thin files', text: 'Use operational data when traditional bureau history is missing.' }, { icon: BarChart3, title: 'Portfolio ready', text: 'Move from one applicant to segmentation and batch scoring.' }, { icon: ShieldCheck, title: 'Fairness included', text: 'Audit outcomes by group without using protected attributes as model inputs.' }].map((card, index) => { const Icon = card.icon; return <motion.div key={card.title} {...inView(index * 0.08)} className="landing-feature-card rounded-2xl p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950">{card.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p></motion.div>; })}
        </div>
      </section>

      <section id="impact" className="border-y border-slate-200/80 bg-white/55 px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[88rem]"><motion.div {...inView()} className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Measured impact</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">More signal for every decision.</h2></div><p className="max-w-xl text-sm leading-6 text-slate-600">Results below come from the synthetic demo portfolio used in this prototype. They show the kind of evidence a lender can inspect before using a model in production.</p></motion.div><div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">{STATS.map(([value, label, note], index) => <motion.div key={label} {...inView(index * 0.08)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{value}</p><p className="mt-3 text-sm font-semibold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">{note}</p></motion.div>)}</div></div>
      </section>

      <section id="workflow" className="mx-auto grid max-w-[88rem] gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
        <motion.div {...inView()} className="lg:pt-3"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Vridhi AI in practice</p><h2 className="mt-4 max-w-md text-5xl font-bold leading-none tracking-[-0.05em] text-slate-950">A clearer way to move forward.</h2><p className="mt-6 max-w-md text-sm leading-6 text-slate-600">Start with one business, understand the recommendation, then explore the portfolio view. The same workflow serves a credit team and the MSME owner seeking clarity.</p><div className="mt-8"><ActionButton onClick={onEnter}>Choose your workspace</ActionButton></div></motion.div>
        <motion.div {...inView(0.1)} className="landing-workflow-card relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white sm:p-12"><div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" /><div className="relative z-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Two perspectives, one fairer flow</p><h3 className="mt-8 max-w-md text-4xl font-bold leading-tight tracking-[-0.04em]">Assess. Explain. Improve.</h3><div className="mt-10 space-y-5">{['Lenders get a defensible decision workspace.', 'Owners see what can strengthen their profile.', 'Both sides get plain-language context, not a black box.'].map((item) => <div key={item} className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal-300" />{item}</div>)}</div></div></motion.div>
      </section>

      <footer className="border-t border-slate-200 bg-white/60 px-6 py-8 lg:px-10"><div className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-3 text-center text-xs text-slate-500 sm:flex-row sm:text-left"><div className="flex items-center gap-2"><span className="font-bold text-slate-900">Vridhi AI</span><span>•</span><span>From credit-invisible to credit-worthy</span></div><span>HackConquest 2026 · Synthetic demo data</span></div></footer>
    </div>
  );
}
