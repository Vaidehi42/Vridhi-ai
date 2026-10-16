import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function ApiOfflineBanner({ onRetry, attemptedUrl = API_BASE_URL }) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <div>
            <span className="font-bold">API offline</span>
            <span className="mx-1 font-normal">— Could not reach backend server at</span>
            <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono font-medium text-amber-950">{attemptedUrl}</code>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-xs font-semibold bg-amber-200 hover:bg-amber-300 text-amber-900 px-2.5 py-1 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}
