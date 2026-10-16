import React from 'react';
import { ORDER_STATUS } from '../../utils/constants';
import { Play } from 'lucide-react';

export const SimulatedStatusController = ({ currentStatus, onStatusChange }) => {
  const statuses = Object.values(ORDER_STATUS);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Play size={16} className="text-trakz-500 fill-trakz-500" />
          <h4 className="font-extrabold text-sm tracking-wide">Demo Simulation Control</h4>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
          Demo Testing Tool
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Select any status below to simulate real-time order lifecycle changes in this demo view:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {statuses.map((st) => {
          const isActive = currentStatus === st;
          return (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all ${
                isActive
                  ? 'bg-trakz-500 text-white border-trakz-500 shadow-md ring-2 ring-trakz-300'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>
    </div>
  );
};
