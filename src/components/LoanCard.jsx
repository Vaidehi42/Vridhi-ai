import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function LoanCard({ recommendation }) {
  if (!recommendation) return null;

  const {
    eligible = 'Conditional',
    suggested_amount,
    interest_rate_range = 'N/A',
    repayment_period = 'N/A',
    note = 'Analytical recommendation. The final lending decision remains with the lender.',
  } = recommendation;

  // Format eligibility pill styling
  const getEligibilityBadge = (status) => {
    switch (status) {
      case 'Yes':
        return {
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: 'Eligible',
        };
      case 'Conditional':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
          label: 'Conditional Approval',
        };
      case 'No':
      default:
        return {
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
          label: 'Not Eligible',
        };
    }
  };

  const badge = getEligibilityBadge(eligible);

  // Format suggested amount text
  const displayAmount =
    suggested_amount === 0 || suggested_amount === '0' || suggested_amount === 'N/A' || eligible === 'No'
      ? 'N/A'
      : `₹${suggested_amount} lakh`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Loan Recommendation</h3>
          <p className="text-xs text-slate-500">Automated analytical credit terms</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.color}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Suggested Loan</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">{displayAmount}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Interest Rate</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">{interest_rate_range}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Tenure</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">{repayment_period}</div>
        </div>
      </div>

      {note && (
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100 italic leading-relaxed">
          <strong>Note:</strong> {note}
        </p>
      )}
    </div>
  );
}
