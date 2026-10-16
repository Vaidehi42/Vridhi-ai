import React, { useState, useEffect, useMemo } from 'react';
import { getFairness } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const DI_COLORS = { ok: '#16A34A', fail: '#DC2626' };
const GROUP_COLORS = ['#0D9488', '#F59E0B', '#6366F1', '#EA580C', '#8B5CF6'];

function DiCard({ label, value }) {
  const ok = value >= 0.80;
  return (
    <div className={`rounded-xl p-4 border text-center ${ok ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-black ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>{value?.toFixed(2)}</div>
      <div className={`text-[10px] font-semibold mt-1 ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>
        {ok ? '✓ Passes (≥ 0.80)' : '✗ Below threshold'}
      </div>
    </div>
  );
}

function GroupBarChart({ data, groupKey, title }) {
  if (!data || data.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-700 mb-2">{title}</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey={groupKey} tick={{ fontSize: 10, fill: '#64748B' }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            <Bar dataKey="approval_rate" name="Approval Rate" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={GROUP_COLORS[i % GROUP_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GroupTable({ data, groupKey }) {
  if (!data || data.length === 0) return <p className="text-xs text-slate-400 italic">No data</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-600">
            <th className="px-3 py-2 font-semibold">Group</th>
            <th className="px-3 py-2 font-semibold text-right">n</th>
            <th className="px-3 py-2 font-semibold text-right">Approval Rate</th>
            <th className="px-3 py-2 font-semibold text-right">Good Borrower Approved</th>
            <th className="px-3 py-2 font-semibold text-right">Default Rate (Approved)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-2 font-medium">{row[groupKey]}</td>
              <td className="px-3 py-2 text-right">{row.n?.toLocaleString()}</td>
              <td className="px-3 py-2 text-right font-semibold">{((row.approval_rate || 0) * 100).toFixed(1)}%</td>
              <td className="px-3 py-2 text-right">{row.good_borrower_approval != null ? `${(row.good_borrower_approval * 100).toFixed(1)}%` : '—'}</td>
              <td className="px-3 py-2 text-right">{row.default_rate_approved != null ? `${(row.default_rate_approved * 100).toFixed(1)}%` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FairnessPage({ isOnline }) {
  const [mitigated, setMitigated] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFairness = async (mit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFairness(mit);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load fairness data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOnline) fetchFairness(mitigated);
  }, [mitigated, isOnline]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fairness & Demographic Audit</h2>
            <p className="text-xs text-slate-500 mt-1">
              Auditing lending outcomes across gender, region, size, and sector.
              <span className="ml-2 inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">Synthetic demo data</span>
            </p>
          </div>

          {/* Mitigated Toggle */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <span className={`text-xs font-semibold ${!mitigated ? 'text-teal-700' : 'text-slate-400'}`}>Standard</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={mitigated} onChange={(e) => setMitigated(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
            <span className={`text-xs font-semibold ${mitigated ? 'text-teal-700' : 'text-slate-400'}`}>Region-Adjusted</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
          <strong className="text-blue-800">Model note:</strong> The model never uses gender or region as inputs. They are used only here, to audit outcomes.
        </div>
      </div>

      {!isOnline && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 text-sm font-semibold">
          API is offline. Fairness audit requires the backend.
        </div>
      )}

      {loading && <LoadingSpinner message="Loading fairness audit data…" />}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 text-sm">
          <strong>Error:</strong> {error}
          <button onClick={() => fetchFairness(mitigated)} className="ml-3 text-xs underline">Retry</button>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Bias Alert / Green Banner */}
          {data.bias_detected ? (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-rose-800">⚠ Bias Detected</p>
              {data.bias_alerts?.map((alert, i) => (
                <div key={i} className="text-xs text-rose-700">
                  {alert.dimension} → <strong>{alert.group}</strong>: approval {(alert.approval_rate * 100).toFixed(1)}% vs avg {(alert.portfolio_avg * 100).toFixed(1)}% (deviation {(alert.deviation * 100).toFixed(1)}pp)
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm font-semibold">
              ✓ No group deviates more than 15 percentage points from the portfolio average.
            </div>
          )}

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Portfolio Approval Rate</div>
              <div className="text-2xl font-black text-teal-700">{((data.portfolio_approval_rate || 0) * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{mitigated ? 'Region-adjusted' : 'Standard cutoff'}</div>
            </div>
            {Object.entries(data.disparate_impact || {}).map(([dim, val]) => (
              <DiCard
                key={dim}
                label={dim.replace('_', ' ')}
                value={val}
              />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <GroupBarChart data={data.by_gender} groupKey="owner_gender" title="Approval Rate by Gender" />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <GroupBarChart data={data.by_region} groupKey="region_type" title="Approval Rate by Region" />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <GroupBarChart data={data.by_size} groupKey="size_band" title="Approval Rate by Size" />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <GroupBarChart data={data.by_sector} groupKey="sector" title="Approval Rate by Sector" />
            </div>
          </div>

          {/* Detailed Tables */}
          {[
            { data: data.by_gender, key: 'owner_gender', title: 'By Gender' },
            { data: data.by_region, key: 'region_type', title: 'By Region' },
            { data: data.by_size, key: 'size_band', title: 'By Business Size' },
            { data: data.by_sector, key: 'sector', title: 'By Sector' },
          ].map(({ data: tData, key, title }) => (
            <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
              </div>
              <div className="p-2">
                <GroupTable data={tData} groupKey={key} />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
