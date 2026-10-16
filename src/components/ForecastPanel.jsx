import React, { useState } from 'react';
import { getForecast } from '../api';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const SAMPLE_HISTORY = [2.1, 2.17, 2.37, 1.99, 2.46, 2.3, 2.06, 2.42, 2.59, 2.92, 2.73, 2.75, 2.12, 2.22, 2.46, 2.71, 2.54, 2.4];
const SAMPLE_START_MONTH = '2024-01';

export default function ForecastPanel({ loanAmount = 15, interestRate = 0.12 }) {
  const [historyText, setHistoryText] = useState(SAMPLE_HISTORY.join(', '));
  const [startMonth, setStartMonth] = useState(SAMPLE_START_MONTH);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const loadSample = () => {
    setHistoryText(SAMPLE_HISTORY.join(', '));
    setStartMonth(SAMPLE_START_MONTH);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let history;
    try {
      history = historyText.split(/[\s,]+/).filter(Boolean).map(Number);
      if (history.some(isNaN) || history.length < 12 || history.length > 24) {
        throw new Error('Enter 12 to 24 positive monthly UPI inflow values (Rs lakh).');
      }
      if (history.some((v) => v <= 0)) {
        throw new Error('All UPI inflow values must be positive.');
      }
    } catch (err) {
      setError(err.message);
      return;
    }

    setLoading(true);
    try {
      const data = await getForecast({
        monthly_upi_inflow_lakh: history,
        start_month: startMonth,
        loan_amount_lakh: parseFloat(loanAmount) || 15,
        interest_rate: parseFloat(interestRate) || 0.12,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Forecast failed');
    } finally {
      setLoading(false);
    }
  };

  // Build chart data
  const chartData = result
    ? result.months.map((month, i) => ({
        month,
        forecast: result.forecast_lakh[i],
        lower: result.lower_lakh[i],
        upper: result.upper_lakh[i],
        dscr: result.dscr[i],
        highRisk: result.high_risk_month[i],
      }))
    : [];

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.highRisk) {
      return <circle cx={cx} cy={cy} r={7} fill="#DC2626" stroke="#fff" strokeWidth={2} />;
    }
    return <circle cx={cx} cy={cy} r={4} fill="#0D9488" stroke="#fff" strokeWidth={1.5} />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Cash-Flow Forecast</h3>
        <p className="text-xs text-slate-500 mt-0.5">6-month UPI inflow forecast with debt-service coverage</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">
              Monthly UPI Inflow History (Rs lakh, comma-separated, 12–24 values, oldest first)
            </label>
            <button
              type="button"
              onClick={loadSample}
              className="text-xs text-teal-700 hover:underline font-semibold"
            >
              Use sample history
            </button>
          </div>
          <textarea
            rows={3}
            value={historyText}
            onChange={(e) => setHistoryText(e.target.value)}
            placeholder="e.g. 2.1, 2.17, 2.37, 1.99 …"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <p className="text-[10px] text-slate-400 mt-0.5">{historyText.split(/[\s,]+/).filter(Boolean).length} values entered</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Start Month (YYYY-MM)</label>
            <input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Loan (Rs lakh)</label>
            <input
              type="number" step="0.1" value={loanAmount} disabled
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 bg-slate-50"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">From form</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Interest Rate (%)</label>
            <input
              type="number" step="0.1" value={typeof interestRate === 'number' ? (interestRate * 100).toFixed(1) : interestRate} disabled
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 bg-slate-50"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">From form</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Forecasting…' : 'Run Forecast'}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-teal-600 uppercase">Min DSCR</div>
              <div className={`text-2xl font-black mt-0.5 ${result.min_dscr < 1.0 ? 'text-rose-600' : 'text-teal-800'}`}>
                {result.min_dscr.toFixed(2)}
              </div>
              {result.min_dscr < 1.0 && (
                <div className="text-[10px] text-rose-600 font-semibold">Below 1.0 ⚠</div>
              )}
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Monthly Growth</div>
              <div className={`text-2xl font-black mt-0.5 ${result.monthly_growth_pct >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {result.monthly_growth_pct >= 0 ? '+' : ''}{result.monthly_growth_pct}%
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Instalment</div>
              <div className="text-2xl font-black mt-0.5 text-slate-900">
                ₹{result.monthly_instalment_lakh.toFixed(2)}L
              </div>
              <div className="text-[10px] text-slate-400">/ month</div>
            </div>
          </div>

          {/* High risk month notice */}
          {result.high_risk_month.some(Boolean) && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 font-semibold">
              ⚠ Red dots: months where forecast cash may not cover the instalment (DSCR &lt; 1.0)
            </div>
          )}

          {/* Forecast Chart */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">6-Month UPI Inflow Forecast (Rs lakh)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="L" />
                  <Tooltip
                    formatter={(val, name) => {
                      if (name === 'band') return null;
                      return [`₹${val}L`, name === 'forecast' ? 'Forecast' : name];
                    }}
                    contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#0D9488"
                    fillOpacity={0.12}
                    name="band"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#F8FAFC"
                    fillOpacity={1}
                    name="band"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={<CustomDot />}
                    name="forecast"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DSCR Per Month */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Debt-Service Coverage Ratio (DSCR) per Month</p>
            <div className="flex gap-2 flex-wrap">
              {result.months.map((month, i) => (
                <div
                  key={month}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs ${
                    result.high_risk_month[i]
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span className="font-semibold">{month}</span>
                  <span className="font-black text-sm">{result.dscr[i].toFixed(2)}</span>
                  {result.high_risk_month[i] && (
                    <span className="text-[9px] font-bold text-rose-600 mt-0.5">May not cover</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic">Method: {result.method}</p>
        </div>
      )}
    </div>
  );
}
