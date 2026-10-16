import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

export default function ReasonChart({ reasonCodes = [] }) {
  if (!reasonCodes || reasonCodes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-2">Why this score</h3>
        <p className="text-xs text-slate-500">No reason codes available for this prediction.</p>
      </div>
    );
  }

  // Take top 5 reason codes
  const items = reasonCodes.slice(0, 5);

  // Prepare data for Recharts horizontal bar chart
  const chartData = items.map((item) => ({
    label: item.label || item.feature,
    value: item.value,
    shap: item.shap_value,
    deltaPts: item.delta_pts,
    direction: item.direction,
    color: item.shap_value > 0 ? '#16A34A' : '#DC2626',
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Why this score</h3>
          <p className="text-xs text-slate-500">Top factors influencing the default risk prediction</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-medium text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Helps (Lowers risk)
          </span>
          <span className="flex items-center gap-1 font-medium text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span> Hurts (Raises risk)
          </span>
        </div>
      </div>

      {/* Recharts Horizontal Bar Visualization */}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#64748B' }}
              unit=" pp"
            />
            <YAxis
              type="category"
              dataKey="label"
              width={140}
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
            />
            <Tooltip
              formatter={(val, name, entry) => [
                `${Math.abs(entry.payload.deltaPts)} percentage points`,
                entry.payload.shap > 0 ? 'Helps borrower' : 'Hurts borrower',
              ]}
              labelFormatter={(label) => `Factor: ${label}`}
              contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '6px', fontSize: '12px' }}
            />
            <ReferenceLine x={0} stroke="#94A3B8" strokeDasharray="3 3" />
            <Bar dataKey="shap" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Explicit One-Sentence Explanations Per Item */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        {items.map((item, idx) => {
          const isHelps = item.shap_value > 0 || item.direction === 'lowers_risk';
          return (
            <div key={idx} className="text-xs text-slate-700 flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isHelps ? 'bg-emerald-600' : 'bg-rose-600'}`} />
              <p>
                <strong className="text-slate-900">{item.label}</strong> (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">{item.value}</code>){' '}
                <span className={isHelps ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                  {isHelps ? 'lowers' : 'raises'}
                </span>{' '}
                default risk by <strong className="text-slate-900">{item.delta_pts} percentage points</strong>.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
