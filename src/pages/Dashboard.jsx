import React, { useState, useEffect } from 'react';
import { getHealth } from '../api';
import summaryData from '../data/summary.json';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { ShieldCheck, TrendingUp, Users, AlertTriangle, BarChart3, Zap, Target, Activity, ArrowRight } from 'lucide-react';

const TIER_COLORS = {
  Healthy: '#16A34A',
  Watch: '#F59E0B',
  Stressed: '#EA580C',
  'High Risk': '#DC2626',
};

function AnimatedCounter({ end, duration = 1200, decimals = 0, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * end);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

function KPICard({ icon: Icon, label, value, subtext, color = 'teal', onClick }) {
  const colorMap = {
    teal: 'from-teal-500 to-teal-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    indigo: 'from-indigo-500 to-indigo-700',
    violet: 'from-violet-500 to-violet-700',
  };
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-teal-400' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{value}</p>
          {subtext && <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${colorMap[color] || colorMap.teal} flex items-center justify-center shadow-md flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage({ isOnline, onNavigate }) {
  const [apiInfo, setApiInfo] = useState(null);
  const s = summaryData;

  useEffect(() => {
    if (isOnline) {
      getHealth().then(setApiInfo).catch(() => {});
    }
  }, [isOnline]);

  const aucData = [
    { name: 'All Borrowers', traditional: s.AUC_traditional, vridhi: s.AUC_creditlens },
    { name: 'Thin-File Only', traditional: s.AUC_thin_file_traditional, vridhi: s.AUC_thin_file_creditlens },
  ];

  const approvalData = [
    { name: 'Traditional', value: s.trad_approval_rate, fill: '#94A3B8' },
    { name: 'Vridhi AI', value: s.creditlens_approval_rate, fill: '#0D9488' },
  ];

  const riskDistribution = [
    { name: 'Healthy', value: 45, fill: TIER_COLORS.Healthy },
    { name: 'Watch', value: 25, fill: TIER_COLORS.Watch },
    { name: 'Stressed', value: 18, fill: TIER_COLORS.Stressed },
    { name: 'High Risk', value: 12, fill: TIER_COLORS['High Risk'] },
  ];

  const thinFileData = [
    { name: 'Traditional', approved: s.good_thin_file_approved_trad_pct, fill: '#94A3B8' },
    { name: 'Vridhi AI', approved: s.good_thin_file_approved_creditlens_pct, fill: '#0D9488' },
  ];

  const quickActions = [
    { id: 'assess', label: 'Assess MSME', desc: 'Single credit risk evaluation with SHAP explainability & What-If simulator', icon: Target, color: 'bg-teal-600' },
    { id: 'portfolio', label: 'Portfolio Analytics', desc: 'Interactive scatter plot & segmentation across sectors and regions', icon: BarChart3, color: 'bg-indigo-600' },
    { id: 'batch', label: 'Batch MSME Scoring', desc: 'Upload CSV for high-throughput batch risk assessment & export', icon: Zap, color: 'bg-amber-600' },
    { id: 'fairness', label: 'Fairness Audit', desc: 'Demographic parity & disparate impact analysis across gender & regions', icon: ShieldCheck, color: 'bg-violet-600' },
    { id: 'impact', label: 'Impact & Benchmarks', desc: 'Comprehensive model comparisons vs traditional bureau scoring', icon: TrendingUp, color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>HackConquest 2026 • Problem Statement 12</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Vridhi AI Credit Risk Platform
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              An explainable credit risk intelligence system for MSMEs. Evaluates credit-invisible and thin-file businesses using GST compliance, UPI transaction velocities, and operational signals.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {isOnline ? 'Backend Engine Connected' : 'Backend Engine Offline'}
              </span>
              {apiInfo && (
                <span className="text-xs text-slate-400">
                  {apiInfo.model_features} features · {apiInfo.portfolio_rows?.toLocaleString()} synthetic portfolio records
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigate('assess')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" /> Assess a Business
            </button>
            <button
              onClick={() => onNavigate('batch')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" /> Batch Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard 
          icon={Users} 
          label="Portfolio Size" 
          value={<AnimatedCounter end={s.portfolio_size} />} 
          subtext="MSMEs scored" 
          color="teal" 
          onClick={() => onNavigate('portfolio')}
        />
        <KPICard 
          icon={Activity} 
          label="Model AUC" 
          value={<AnimatedCounter end={s.AUC_creditlens} decimals={3} />} 
          subtext={`vs ${s.AUC_traditional} trad.`} 
          color="emerald" 
          onClick={() => onNavigate('impact')}
        />
        <KPICard 
          icon={TrendingUp} 
          label="Approval Rate" 
          value={<AnimatedCounter end={s.creditlens_approval_rate} decimals={1} suffix="%" />} 
          subtext={`vs ${s.trad_approval_rate}% trad.`} 
          color="indigo" 
          onClick={() => onNavigate('impact')}
        />
        <KPICard 
          icon={AlertTriangle} 
          label="Bad Rate" 
          value={<AnimatedCounter end={s.bad_rate_among_approved_pct} decimals={1} suffix="%" />} 
          subtext="Among approved" 
          color="amber" 
          onClick={() => onNavigate('impact')}
        />
        <KPICard 
          icon={ShieldCheck} 
          label="Thin-File Approval" 
          value={<AnimatedCounter end={s.good_thin_file_approved_creditlens_pct} decimals={0} suffix="%" />} 
          subtext={`vs ${s.good_thin_file_approved_trad_pct}% trad.`} 
          color="violet" 
          onClick={() => onNavigate('impact')}
        />
        <KPICard 
          icon={Target} 
          label="Forecast MAPE" 
          value={<AnimatedCounter end={s.forecast_MAPE_pct} decimals={1} suffix="%" />} 
          subtext={`vs ${s.seasonal_naive_MAPE_pct}% naïve`} 
          color="rose" 
          onClick={() => onNavigate('impact')}
        />
      </div>

      {/* Interactive Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Platform Modules & Workflows</h2>
          <span className="text-xs text-slate-500">Click any card to launch module</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-teal-400 transition-all duration-200 text-left group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {action.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {action.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AUC Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Discrimination Power (AUC-ROC)</h3>
              <p className="text-xs text-slate-500">Vridhi AI vs Traditional Bureau-Only Model</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded border border-emerald-200">
              +13.7% Uplift
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aucData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0.6, 0.9]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="traditional" name="Traditional Bureau-Only" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vridhi" name="Vridhi AI (Alternative Data)" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Rate Impact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Credit Access Expansion</h3>
              <p className="text-xs text-slate-500">Portfolio approval rates comparison</p>
            </div>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 font-semibold text-[10px] rounded border border-teal-200">
              +42.1pp More Approvals
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip formatter={(val) => `${val}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" name="Approval Rate" radius={[0, 6, 6, 0]} barSize={28}>
                  {approvalData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Risk Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Portfolio Risk Tier Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown across {s.portfolio_size.toLocaleString()} synthetic MSMEs</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={{ stroke: '#94A3B8' }}
                >
                  {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thin-File Inclusion */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Thin-File Financial Inclusion</h3>
            <p className="text-xs text-slate-500 mb-4">Approval of credit-worthy borrowers with no bureau score</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={thinFileData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => `${val}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="approved" name="Good Thin-File Approved" radius={[6, 6, 0, 0]} barSize={44}>
                    {thinFileData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-900 leading-relaxed">
            <strong>Key Inclusion Impact:</strong> {s.thin_file_share_pct}% of MSMEs have no bureau record. While traditional bureau scoring declines 100% of them, Vridhi AI identifies and approves <strong>{s.good_thin_file_approved_creditlens_pct}%</strong> of solvent businesses.
          </div>
        </div>
      </div>
    </div>
  );
}
