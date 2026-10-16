import React, { useState, useEffect, useRef, useCallback } from 'react';
import { simulateBusiness } from '../api';
import LoanCard from './LoanCard';
import TierBadge from './TierBadge';

const TIER_COLORS = {
  Healthy: '#16A34A',
  Watch: '#F59E0B',
  Stressed: '#EA580C',
  'High risk': '#DC2626',
};

export default function SimulatorPanel({ businessPayload, originalResult }) {
  const [delta, setDelta] = useState({
    revenue_change_pct: 0,
    rate_change_pp: 0,
    employee_change_pct: 0,
    gst_filing: false,
  });
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const runSimulation = useCallback(async (currentDelta) => {
    if (!businessPayload) return;
    setLoading(true);
    setError(null);
    try {
      const res = await simulateBusiness(businessPayload, currentDelta);
      setSimResult(res);
    } catch (err) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [businessPayload]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSimulation(delta);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [delta, runSimulation]);

  const handleSlider = (key, value) => {
    setDelta((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setDelta({ revenue_change_pct: 0, rate_change_pp: 0, employee_change_pct: 0, gst_filing: false });
    setSimResult(null);
  };

  const scoreChange = simResult ? simResult.score_change : 0;
  const projScore = simResult ? simResult.projected_score : originalResult?.risk_score;
  const projTier = simResult ? simResult.projected_tier : originalResult?.risk_tier;
  const projLabel = simResult ? simResult.projected_label : originalResult?.risk_label;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">What-If Simulator</h3>
          <p className="text-xs text-slate-500 mt-0.5">Adjust business parameters to see projected risk change</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Revenue Change */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Revenue Change</label>
            <span className={`text-xs font-bold ${delta.revenue_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {delta.revenue_change_pct >= 0 ? '+' : ''}{delta.revenue_change_pct}%
            </span>
          </div>
          <input
            type="range" min="-50" max="50" step="1"
            value={delta.revenue_change_pct}
            onChange={(e) => handleSlider('revenue_change_pct', Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>-50%</span><span>0</span><span>+50%</span>
          </div>
        </div>

        {/* Interest Rate Change */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Interest Rate Change</label>
            <span className={`text-xs font-bold ${delta.rate_change_pp <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {delta.rate_change_pp >= 0 ? '+' : ''}{delta.rate_change_pp} pp
            </span>
          </div>
          <input
            type="range" min="-3" max="5" step="0.5"
            value={delta.rate_change_pp}
            onChange={(e) => handleSlider('rate_change_pp', Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>-3 pp</span><span>0</span><span>+5 pp</span>
          </div>
        </div>

        {/* Business Scale */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Business Scale (approximate)</label>
            <span className={`text-xs font-bold ${delta.employee_change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {delta.employee_change_pct >= 0 ? '+' : ''}{delta.employee_change_pct}%
            </span>
          </div>
          <input
            type="range" min="-50" max="50" step="1"
            value={delta.employee_change_pct}
            onChange={(e) => handleSlider('employee_change_pct', Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>-50%</span><span>0</span><span>+50%</span>
          </div>
        </div>

        {/* GST Compliance Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={delta.gst_filing}
              onChange={(e) => handleSlider('gst_filing', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
          <div>
            <p className="text-xs font-semibold text-slate-800">Raise GST Compliance to 95%</p>
            <p className="text-[10px] text-slate-500">On-time filing lifted to at least 95%</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-3 text-xs text-slate-400 animate-pulse">Simulating…</div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg">{error}</div>
      )}

      {!loading && simResult && (
        <div className="space-y-4">
          {/* Score Comparison */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Original</div>
              <div className="text-2xl font-black text-slate-900">{simResult.original_score}</div>
              <TierBadge tier={simResult.original_tier} label={simResult.original_label} small />
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
              <div className={`text-xl font-black ${scoreChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {scoreChange >= 0 ? '+' : ''}{scoreChange}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">Score change</div>
              {simResult.transition && simResult.transition.includes('->') && (
                <div className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 whitespace-nowrap">
                  {simResult.transition.replace('->', '→')}
                </div>
              )}
            </div>

            <div className="rounded-lg p-3 border" style={{ borderColor: TIER_COLORS[projTier] + '40', backgroundColor: TIER_COLORS[projTier] + '10' }}>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Projected</div>
              <div className="text-2xl font-black text-slate-900">{projScore}</div>
              <TierBadge tier={projTier} label={projLabel} small />
            </div>
          </div>

          {/* Updated Loan Recommendation */}
          {simResult.loan_recommendation && (
            <LoanCard recommendation={simResult.loan_recommendation} />
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-3">
        Illustrative what-if based on the same model. Not a causal prediction.
      </p>
    </div>
  );
}
