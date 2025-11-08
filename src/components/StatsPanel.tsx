// src/components/StatsPanel.tsx
import type { Stats } from '../types/Trace';

interface StatsPanelProps {
  stats: Stats | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Cost */}
      <div className="glass-card rounded-2xl p-8 border border-emerald-500/20 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] group">
        <div className="flex items-center justify-between mb-4">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Cost</div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="text-5xl font-bold text-emerald-400 mb-3 tracking-tight">
          ${(stats.totalCost || 0).toFixed(4)}
        </div>
        <div className="text-emerald-400/60 text-xs font-medium">
          Cumulative spend across all queries
        </div>
      </div>

      {/* Total Requests */}
      <div className="glass-card rounded-2xl p-8 border border-blue-500/20 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] group">
        <div className="flex items-center justify-between mb-4">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Requests</div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="text-5xl font-bold text-blue-400 mb-3 tracking-tight">
          {stats.totalRequests || 0}
        </div>
        <div className="text-blue-400/60 text-xs font-medium">
          AI queries processed and tracked
        </div>
      </div>

      {/* Average Latency */}
      <div className="glass-card rounded-2xl p-8 border border-indigo-500/20 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] group">
        <div className="flex items-center justify-between mb-4">
          <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Avg Latency</div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="text-5xl font-bold text-indigo-400 mb-3 tracking-tight">
          {stats.averageLatency ? Math.round(stats.averageLatency) : 0}<span className="text-2xl">ms</span>
        </div>
        <div className="text-indigo-400/60 text-xs font-medium">
          Mean response time per query
        </div>
      </div>
    </div>
  );
}