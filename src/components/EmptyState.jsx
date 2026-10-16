import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No Data Available', message = 'There is currently no information to display here.', action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center my-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
