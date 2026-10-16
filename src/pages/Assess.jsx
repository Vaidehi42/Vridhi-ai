import React, { useState, useEffect } from 'react';
import demoBusinesses from '../data/demo_businesses.json';
import { predictBusiness } from '../api';
import ScoreGauge from '../components/ScoreGauge';
import ReasonChart from '../components/ReasonChart';
import LoanCard from '../components/LoanCard';
import SimulatorPanel from '../components/SimulatorPanel';
import ForecastPanel from '../components/ForecastPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function AssessPage({ isOnline, onAssessmentResult }) {
  // Form State initialized with "Watch, no bureau history" demo preset default
  const defaultPreset = demoBusinesses.watch_thin_file;

  const [formData, setFormData] = useState({
    msme_id: defaultPreset.msme_id || 'M03783',
    sector: defaultPreset.sector || 'Retail',
    business_age: defaultPreset.business_age || 6.1,
    annual_turnover_lakh: defaultPreset.annual_turnover_lakh || 47.6,
    upi_inflow_monthly_lakh: defaultPreset.upi_inflow_monthly_lakh || 1.64,
    gst_on_time_pct: (defaultPreset.gst_on_time_pct * 100).toFixed(1), // UI %
    upi_volatility: defaultPreset.upi_volatility || 0.39,
    utility_delay_days: defaultPreset.utility_delay_days || 9.8,
    receivable_days: defaultPreset.receivable_days || 47.2,
    customer_concentration: (defaultPreset.customer_concentration * 100).toFixed(1), // UI %
    bounced_payments: defaultPreset.bounced_payments || 0,
    turnover_growth: (defaultPreset.turnover_growth * 100).toFixed(1), // UI %
    existing_debt_lakh: defaultPreset.existing_debt_lakh || 28.2,
    loan_amount_lakh: defaultPreset.loan_amount_lakh || 16.1,
    interest_rate: (defaultPreset.interest_rate * 100).toFixed(1), // UI %
    no_bureau_history: defaultPreset.bureau_score === null,
    bureau_score: defaultPreset.bureau_score || 650,
  });

  const [activePreset, setActivePreset] = useState('watch_thin_file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [result, setResult] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  // Preset Handlers
  const applyPreset = (presetKey) => {
    const p = demoBusinesses[presetKey];
    if (!p) return;
    setActivePreset(presetKey);
    setFormData({
      msme_id: p.msme_id || '',
      sector: p.sector || 'Retail',
      business_age: p.business_age,
      annual_turnover_lakh: p.annual_turnover_lakh,
      upi_inflow_monthly_lakh: p.upi_inflow_monthly_lakh,
      gst_on_time_pct: (p.gst_on_time_pct * 100).toFixed(1),
      upi_volatility: p.upi_volatility,
      utility_delay_days: p.utility_delay_days,
      receivable_days: p.receivable_days,
      customer_concentration: (p.customer_concentration * 100).toFixed(1),
      bounced_payments: p.bounced_payments,
      turnover_growth: (p.turnover_growth * 100).toFixed(1),
      existing_debt_lakh: p.existing_debt_lakh,
      loan_amount_lakh: p.loan_amount_lakh,
      interest_rate: (p.interest_rate * 100).toFixed(1),
      no_bureau_history: p.bureau_score === null,
      bureau_score: p.bureau_score || 650,
    });
    setValidationErrors([]);
    setError(null);
  };

  // Form input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setActivePreset(null); // Clear active preset indicator when user customizes
  };

  // Form Client-side Validation
  const validate = () => {
    const errors = [];
    if (!formData.sector) errors.push('Sector is required.');
    if (parseFloat(formData.business_age) < 0.5 || parseFloat(formData.business_age) > 50) {
      errors.push('Business age must be between 0.5 and 50 years.');
    }
    if (parseFloat(formData.annual_turnover_lakh) <= 0) {
      errors.push('Annual turnover must be greater than 0.');
    }
    if (parseFloat(formData.upi_inflow_monthly_lakh) <= 0) {
      errors.push('Monthly UPI inflow must be greater than 0.');
    }
    if (parseFloat(formData.loan_amount_lakh) <= 0) {
      errors.push('Loan requested must be greater than 0.');
    }
    if (parseFloat(formData.interest_rate) <= 0) {
      errors.push('Interest rate must be greater than 0.');
    }
    if (
      !formData.no_bureau_history &&
      (parseFloat(formData.bureau_score) < 300 || parseFloat(formData.bureau_score) > 900)
    ) {
      errors.push('Bureau score must be between 300 and 900.');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Submit Handler -> Calls POST /api/predict
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    // Prepare API Request Payload (convert UI % to fraction 0-1)
    const payload = {
      msme_id: formData.msme_id || undefined,
      sector: formData.sector,
      business_age: parseFloat(formData.business_age),
      annual_turnover_lakh: parseFloat(formData.annual_turnover_lakh),
      upi_inflow_monthly_lakh: parseFloat(formData.upi_inflow_monthly_lakh),
      gst_on_time_pct: parseFloat(formData.gst_on_time_pct) / 100,
      upi_volatility: parseFloat(formData.upi_volatility),
      utility_delay_days: parseFloat(formData.utility_delay_days),
      receivable_days: parseFloat(formData.receivable_days),
      customer_concentration: parseFloat(formData.customer_concentration) / 100,
      bounced_payments: parseInt(formData.bounced_payments, 10),
      turnover_growth: parseFloat(formData.turnover_growth) / 100,
      existing_debt_lakh: parseFloat(formData.existing_debt_lakh),
      loan_amount_lakh: parseFloat(formData.loan_amount_lakh),
      interest_rate: parseFloat(formData.interest_rate) / 100,
      bureau_score: formData.no_bureau_history ? null : parseFloat(formData.bureau_score),
    };

    try {
      const data = await predictBusiness(payload);
      setResult(data);
      setLastPayload(payload);
      onAssessmentResult?.(data);
    } catch (err) {
      console.error('Predict error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial prediction on load with default Watch preset
  useEffect(() => {
    if (isOnline && !result && !loading) {
      handleSubmit({ preventDefault: () => {} });
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Assess MSME Credit Risk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Predict default probability using GST compliance, UPI cash flow, and operational alternative data.
          </p>
        </div>

        {/* Demo Presets Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Demo Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('healthy_thin_file')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              activePreset === 'healthy_thin_file'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Healthy (No Bureau)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('watch_thin_file')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              activePreset === 'watch_thin_file'
                ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Watch (No Bureau)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('stressed')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              activePreset === 'stressed'
                ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
            }`}
          >
            Stressed
          </button>
          <button
            type="button"
            onClick={() => applyPreset('high_risk')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              activePreset === 'high_risk'
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            High Risk
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Desktop) / Stacked (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Business Input Form (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Application Details
            </h3>

            {/* Client Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs space-y-1">
                <p className="font-semibold">Please resolve validation errors:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optional ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business ID / Name (Optional)
              </label>
              <input
                type="text"
                name="msme_id"
                value={formData.msme_id}
                onChange={handleChange}
                placeholder="e.g. M03783"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Group 1: Business Profile */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">1. Business Profile</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sector</label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Services</option>
                    <option value="Agri-processing">Agri-processing</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="business_age"
                    value={formData.business_age}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Annual Turnover (₹ Lakh)</label>
                <input
                  type="number"
                  step="0.1"
                  name="annual_turnover_lakh"
                  value={formData.annual_turnover_lakh}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Group 2: Cash Flow & Operations */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">2. Cash Flow & Operations</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Monthly UPI (₹ Lakh)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="upi_inflow_monthly_lakh"
                    value={formData.upi_inflow_monthly_lakh}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Avg Collection (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="receivable_days"
                    value={formData.receivable_days}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">UPI Volatility (0 steady, 1 erratic)</label>
                  <span className="text-xs font-mono font-bold text-slate-900">{formData.upi_volatility}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  name="upi_volatility"
                  value={formData.upi_volatility}
                  onChange={handleChange}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Group 3: Compliance & Risk */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">3. Compliance & Risk</h4>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700">GST Filed On-Time (%)</label>
                  <span className="text-xs font-mono font-bold text-slate-900">{formData.gst_on_time_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  name="gst_on_time_pct"
                  value={formData.gst_on_time_pct}
                  onChange={handleChange}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Utility Delay (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="utility_delay_days"
                    value={formData.utility_delay_days}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Bounced Payments</label>
                  <input
                    type="number"
                    min="0"
                    name="bounced_payments"
                    value={formData.bounced_payments}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Top Customer Concentration (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="customer_concentration"
                    value={formData.customer_concentration}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Turnover Growth (%/Yr)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="turnover_growth"
                    value={formData.turnover_growth}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Group 4: Loan Request & Bureau */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">4. Loan & Credit Bureau</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Debt (₹ Lakh)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="existing_debt_lakh"
                    value={formData.existing_debt_lakh}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Loan (₹ Lakh)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="loan_amount_lakh"
                    value={formData.loan_amount_lakh}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="interest_rate"
                    value={formData.interest_rate}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Bureau History Toggle */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="no_bureau_history"
                    checked={formData.no_bureau_history}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 rounded accent-teal-600"
                  />
                  <span className="text-xs font-bold text-slate-800">No bureau history (Thin-file MSME)</span>
                </label>

                {!formData.no_bureau_history && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Bureau Score (300 - 900)</label>
                    <input
                      type="number"
                      name="bureau_score"
                      value={formData.bureau_score}
                      onChange={handleChange}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-sm transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Evaluating Model...' : 'Assess Credit Risk'}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results Panel (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loading Indicator */}
          {loading && <LoadingSpinner message="Running Vridhi AI credit risk prediction model..." />}

          {/* Backend Error State */}
          {error && <ErrorBanner title="Prediction Failed" error={error} onRetry={handleSubmit} />}

          {/* Result Cards */}
          {!loading && result && (
            <div className="space-y-6">
              {/* Score Gauge & Default Probability */}
              <ScoreGauge
                score={result.risk_score}
                defaultProbability={result.default_probability}
                tier={result.risk_tier}
                label={result.risk_label}
                thinFile={result.thin_file}
                msmeId={result.msme_id}
              />

              {/* Reason Codes Explainability Bar Chart */}
              <ReasonChart reasonCodes={result.reason_codes} />

              {/* Loan Recommendation Card */}
              <LoanCard recommendation={result.loan_recommendation} />

              {/* What-If Simulator */}
              {lastPayload && (
                <SimulatorPanel
                  businessPayload={lastPayload}
                  originalResult={result}
                />
              )}

              {/* Cash-Flow Forecast */}
              {lastPayload && (
                <ForecastPanel
                  loanAmount={lastPayload.loan_amount_lakh}
                  interestRate={lastPayload.interest_rate}
                />
              )}
            </div>
          )}

          {/* Empty State before first assessment */}
          {!loading && !result && !error && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
              <p className="text-sm">Select a demo preset or complete the form and click <strong>Assess Credit Risk</strong> to view model results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
