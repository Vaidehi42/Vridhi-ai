import React, { useState, useCallback } from 'react';
import { predictBatch } from '../api';
import TierBadge from '../components/TierBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Upload, FileText, AlertCircle, Download, CheckCircle2, Search, Filter } from 'lucide-react';

const REQUIRED_COLS = [
  'msme_id', 'sector', 'business_age', 'annual_turnover_lakh',
  'upi_inflow_monthly_lakh', 'gst_on_time_pct', 'upi_volatility',
  'utility_delay_days', 'receivable_days', 'customer_concentration',
  'bounced_payments', 'turnover_growth', 'existing_debt_lakh',
  'loan_amount_lakh', 'interest_rate',
];

export default function BatchPage({ isOnline }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [sortKey, setSortKey] = useState('default_probability');
  const [sortDir, setSortDir] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.name.endsWith('.csv')) {
        setFile(f);
        setError(null);
        setResult(null);
      } else {
        setError('Only CSV files are supported.');
      }
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await predictBatch(file);
      setResult(data);
    } catch (err) {
      setError(err.message || err.data?.error || 'Batch scoring failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setSearchTerm('');
    setFilterTier('');
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filteredResults = result?.results
    ? [...result.results]
        .filter((r) => {
          const matchesSearch = !searchTerm ||
            r.msme_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.sector?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesTier = !filterTier || r.risk_tier === filterTier;
          return matchesSearch && matchesTier;
        })
        .sort((a, b) => {
          const av = a[sortKey] ?? 0;
          const bv = b[sortKey] ?? 0;
          return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        })
    : [];

  const downloadCSV = () => {
    if (!result?.results) return;
    const headers = ['Row', 'MSME ID', 'Sector', 'Risk Score', 'Default Prob', 'Risk Tier', 'Risk Label', 'Thin File', 'Eligible', 'Suggested Amount'];
    const rows = result.results.map((r) => [
      r.row,
      `"${r.msme_id}"`,
      `"${r.sector}"`,
      r.risk_score,
      `${(r.default_probability * 100).toFixed(2)}%`,
      `"${r.risk_tier}"`,
      `"${r.risk_label}"`,
      r.thin_file ? 'Yes' : 'No',
      `"${r.loan_recommendation?.eligible || 'N/A'}"`,
      r.loan_recommendation?.suggested_amount || 'N/A',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vridhi_batch_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Batch MSME Risk Assessment</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload a batch CSV file of business applications for rapid underwriting and portfolio risk scoring.
          Maximum file size: 5 MB.
        </p>
      </div>

      {!isOnline && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700 text-sm font-semibold">
          API is offline. Batch scoring requires a live backend server.
        </div>
      )}

      {/* Upload Zone */}
      {!result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
                : file
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-slate-300 bg-slate-50/60 hover:border-teal-400 hover:bg-slate-100/60'
            }`}
            onClick={() => document.getElementById('batch-csv-input').click()}
          >
            <input
              id="batch-csv-input"
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-emerald-900">{file.name}</p>
                <p className="text-xs text-emerald-700">
                  {(file.size / 1024).toFixed(1)} KB • Ready for scoring
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Drag & drop CSV here, or click to browse</p>
                <p className="text-xs text-slate-400">Supports standard CSV format containing required MSME features</p>
              </div>
            )}
          </div>

          {/* Expected Fields Checklist */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <p className="text-xs font-bold text-slate-700 mb-2">Required schema fields:</p>
            <div className="flex flex-wrap gap-1.5">
              {REQUIRED_COLS.map((col) => (
                <span key={col} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-mono rounded shadow-2xs">
                  {col}
                </span>
              ))}
              <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-mono rounded">
                bureau_score (optional)
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || loading || !isOnline}
              className="flex-1 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? 'Processing Model Inferences...' : 'Score Batch Applications'}
            </button>
            {file && (
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Running batch risk assessments through Vridhi AI..." />}

      {/* Results View */}
      {result && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Total Processed</div>
              <div className="text-2xl font-black text-teal-700">{result.summary.total}</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-emerald-700 uppercase mb-1">Low Risk</div>
              <div className="text-2xl font-black text-emerald-700">{result.summary.low_risk}</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-amber-700 uppercase mb-1">Medium Risk</div>
              <div className="text-2xl font-black text-amber-700">{result.summary.medium_risk}</div>
            </div>
            <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-rose-700 uppercase mb-1">High Risk</div>
              <div className="text-2xl font-black text-rose-700">{result.summary.high_risk}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
              <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Avg Score</div>
              <div className="text-2xl font-black text-slate-900">{result.summary.avg_score}</div>
            </div>
          </div>

          {/* Table Filters & Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="">All Tiers</option>
                <option value="Healthy">Healthy</option>
                <option value="Watch">Watch</option>
                <option value="Stressed">Stressed</option>
                <option value="High risk">High risk</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Scored CSV
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium"
              >
                New Batch
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Scored Records ({filteredResults.length} of {result.results.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click column headers to sort</span>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="text-slate-600 border-b border-slate-200">
                    {[
                      { key: 'row', label: '#' },
                      { key: 'msme_id', label: 'MSME ID' },
                      { key: 'sector', label: 'Sector' },
                      { key: 'risk_score', label: 'Risk Score' },
                      { key: 'default_probability', label: 'Default Prob' },
                      { key: 'risk_tier', label: 'Risk Tier' },
                      { key: 'thin_file', label: 'Thin File' },
                      { key: 'eligible', label: 'Eligibility' },
                      { key: 'suggested_amount', label: 'Suggested Limit' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-3 py-2.5 font-semibold cursor-pointer hover:bg-slate-100 select-none whitespace-nowrap"
                        onClick={() => handleSort(key)}
                      >
                        {label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2 text-slate-400">{row.row}</td>
                      <td className="px-3 py-2 font-mono font-medium text-teal-700">{row.msme_id}</td>
                      <td className="px-3 py-2 text-slate-800">{row.sector}</td>
                      <td className="px-3 py-2 font-bold text-slate-900">{row.risk_score}</td>
                      <td className="px-3 py-2 font-semibold text-rose-700">
                        {((row.default_probability || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2">
                        <TierBadge tier={row.risk_tier} label={row.risk_label} small />
                      </td>
                      <td className="px-3 py-2">
                        {row.thin_file ? (
                          <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-semibold rounded">
                            Thin-File
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Bureau</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-semibold ${
                          row.loan_recommendation?.eligible === 'Yes' ? 'text-emerald-700' :
                          row.loan_recommendation?.eligible === 'Conditional' ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {row.loan_recommendation?.eligible || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-800">
                        {row.loan_recommendation?.suggested_amount
                          ? `₹${row.loan_recommendation.suggested_amount}L`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
