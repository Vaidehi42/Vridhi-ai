import React, { useState, useEffect, useMemo } from 'react';
import { getSegmentation } from '../api';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import TierBadge from '../components/TierBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const TIER_COLORS = {
  Healthy: '#16A34A',
  Watch: '#F59E0B',
  Stressed: '#EA580C',
  'High risk': '#DC2626',
};

const TIERS = ['Healthy', 'Watch', 'Stressed', 'High risk'];
const SECTORS = ['', 'Retail', 'Manufacturing', 'Services', 'Agri-processing', 'Logistics'];
const REGIONS = ['', 'Metro', 'Tier-2', 'Rural'];
const SIZES = ['', 'Micro', 'Small', 'Medium'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1 max-w-[200px]">
      <p className="font-bold text-teal-300">{d.msme_id}</p>
      <p>Sector: <span className="font-semibold">{d.sector}</span></p>
      <p>Region: <span className="font-semibold">{d.region_type}</span></p>
      <p>Size: <span className="font-semibold">{d.size_band}</span></p>
      <p>Score: <span className="font-semibold">{d.risk_score}</span></p>
      <p>Default Prob: <span className="font-semibold">{((d.pd || 0) * 100).toFixed(1)}%</span></p>
      <p>Tier: <span className="font-semibold">{d.risk_tier}</span></p>
    </div>
  );
};

export default function PortfolioPage({ isOnline }) {
  const [filters, setFilters] = useState({ sector: '', region_type: '', size_band: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('pd');
  const [sortDir, setSortDir] = useState('desc');

  const fetchData = async (f) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSegmentation(f);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOnline) fetchData(filters);
  }, [filters, isOnline]);

  const handleFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  // KPI calculations
  const kpis = useMemo(() => {
    if (!data.length) return null;
    const tiers = { Healthy: 0, Watch: 0, Stressed: 0, 'High risk': 0 };
    data.forEach((d) => { if (tiers[d.risk_tier] !== undefined) tiers[d.risk_tier]++; });
    const avgPd = data.reduce((s, d) => s + (d.pd || 0), 0) / data.length;
    return { total: data.length, tiers, avgPd };
  }, [data]);

  // Top 20 highest risk
  const top20 = useMemo(() => {
    const sorted = [...data].sort((a, b) => (b.pd || 0) - (a.pd || 0));
    return sorted.slice(0, 20);
  }, [data]);

  // Scatter data grouped by tier
  const scatterByTier = useMemo(() => {
    return TIERS.map((tier) => ({
      tier,
      color: TIER_COLORS[tier],
      data: data
        .filter((d) => d.risk_tier === tier && d.annual_turnover_lakh > 0 && d.pd > 0)
        .map((d) => ({ ...d, x: d.annual_turnover_lakh, y: d.pd })),
    }));
  }, [data]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sortedTop20 = useMemo(() => {
    return [...top20].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [top20, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Portfolio Analytics & Segmentation</h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore risk distributions across sectors, regions, and size bands.
              <span className="ml-2 inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">Synthetic demo data</span>
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'sector', options: SECTORS, label: 'All Sectors' },
              { key: 'region_type', options: REGIONS, label: 'All Regions' },
              { key: 'size_band', options: SIZES, label: 'All Sizes' },
            ].map(({ key, options, label }) => (
              <select
                key={key}
                value={filters[key]}
                onChange={(e) => handleFilter(key, e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="">{label}</option>
                {options.filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 text-sm font-semibold">
          API is offline. Portfolio data requires the backend.
        </div>
      )}

      {loading && <LoadingSpinner message="Loading portfolio data…" />}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 text-sm">
          <strong>Error:</strong> {error}
          <button onClick={() => fetchData(filters)} className="ml-3 text-xs underline">Retry</button>
        </div>
      )}

      {!loading && kpis && (
        <>
          {/* KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Businesses</div>
              <div className="text-2xl font-black text-teal-700">{kpis.total.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Avg Default Prob</div>
              <div className="text-2xl font-black text-slate-900">{(kpis.avgPd * 100).toFixed(1)}%</div>
            </div>
            {TIERS.map((tier) => (
              <div key={tier} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">{tier}</div>
                <div className="text-xl font-black" style={{ color: TIER_COLORS[tier] }}>
                  {((kpis.tiers[tier] / kpis.total) * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">{kpis.tiers[tier]} biz</div>
              </div>
            ))}
          </div>

          {/* Scatter Plot */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Risk Scatter Plot</h3>
            <p className="text-xs text-slate-500 mb-3">X: Annual Turnover (log), Y: Default Probability (log). Colour: risk tier.</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    scale="log"
                    domain={['auto', 'auto']}
                    name="Annual Turnover"
                    label={{ value: 'Annual Turnover (₹ lakh, log)', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#64748B' }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="y"
                    type="number"
                    scale="log"
                    domain={['auto', 'auto']}
                    name="Default Probability"
                    label={{ value: 'Default Prob (log)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748B' }}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <ZAxis range={[20, 20]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {scatterByTier.map(({ tier, color, data: td }) => (
                    <Scatter key={tier} name={tier} data={td} fill={color} fillOpacity={0.75} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 20 Highest Risk */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">20 Highest-Risk Businesses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    {[
                      { key: 'msme_id', label: 'ID' },
                      { key: 'sector', label: 'Sector' },
                      { key: 'region_type', label: 'Region' },
                      { key: 'size_band', label: 'Size' },
                      { key: 'risk_score', label: 'Score' },
                      { key: 'pd', label: 'Default Prob' },
                      { key: 'risk_tier', label: 'Tier' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-3 py-2 font-semibold cursor-pointer hover:bg-slate-100 select-none"
                        onClick={() => handleSort(key)}
                      >
                        {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedTop20.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-teal-700">{row.msme_id}</td>
                      <td className="px-3 py-2">{row.sector}</td>
                      <td className="px-3 py-2">{row.region_type}</td>
                      <td className="px-3 py-2">{row.size_band}</td>
                      <td className="px-3 py-2 font-bold">{row.risk_score}</td>
                      <td className="px-3 py-2 font-semibold text-rose-700">{((row.pd || 0) * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2"><TierBadge tier={row.risk_tier} label={row.risk_label} small /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
