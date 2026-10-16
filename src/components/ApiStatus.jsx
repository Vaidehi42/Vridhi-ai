import React from 'react';

export default function ApiStatus({ isOnline, isLoading, onCheckHealth }) {
  return (
    <button
      onClick={onCheckHealth}
      title={isOnline ? 'API Connected' : 'API Unreachable - Click to retry'}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isLoading
            ? 'bg-amber-400 animate-ping'
            : isOnline
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
            : 'bg-rose-500'
        }`}
      />
      <span>{isLoading ? 'Checking...' : isOnline ? 'API Online' : 'API Offline'}</span>
    </button>
  );
}
