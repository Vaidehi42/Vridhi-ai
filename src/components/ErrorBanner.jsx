import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ title = 'Error', error, onRetry }) {
  const message = typeof error === 'string' ? error : (error?.message || 'An unexpected error occurred.');
  const details = error?.data;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-900">{title}</h4>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {details && typeof details === 'object' && (
            <div className="mt-2 text-xs text-red-800 bg-red-100/60 p-2 rounded font-mono overflow-x-auto">
              {details.fields && <div>Missing/invalid fields: {details.fields.join(', ')}</div>}
              {details.missing_columns && <div>Missing CSV columns: {details.missing_columns.join(', ')}</div>}
              {details.rows && <div>Invalid row numbers: {details.rows.join(', ')}</div>}
              {details.allowed && <div>Allowed values: {details.allowed.join(', ')}</div>}
              {details.detail && <div>Detail: {details.detail}</div>}
            </div>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-xs font-semibold text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
