import React from 'react';

export default function TierBadge({ tier = 'Watch', label = 'MEDIUM', small = false }) {
  const getBadgeStyle = (tierName) => {
    switch (tierName) {
      case 'Healthy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Watch':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Stressed':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'High risk':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold border ${getBadgeStyle(tier)} ${small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs gap-1.5'}`}>
      <span className="capitalize">{tier}</span>
      <span className="opacity-75">({label})</span>
    </span>
  );
}

