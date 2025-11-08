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
      <div className="glass-card rounded-xl p-6 border border-green-500/20 shadow-lg hover:shadow-green-500/20 transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-sm font-medium">Total Cost</div>
          <div className="text-2xl">💰</div>
        </div>
        <div className="text-4xl font-bold text-green-400 mb-2">
          ${(stats.totalCost || 0).toFixed(6)}
        </div>
        <div className="text-green-400/70 text-xs">
          Tracking your spend
        </div>
      </div>

      {/* Total Requests */}
      <div className="glass-card rounded-xl p-6 border border-blue-500/20 shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-sm font-medium">Total Requests</div>
          <div className="text-2xl">📊</div>
        </div>
        <div className="text-4xl font-bold text-blue-400 mb-2">
          {stats.totalRequests || 0}
        </div>
        <div className="text-blue-400/70 text-xs">
          Queries tracked
        </div>
      </div>

      {/* Average Latency */}
      <div className="glass-card rounded-xl p-6 border border-purple-500/20 shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-105">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-sm font-medium">Avg Latency</div>
          <div className="text-2xl">⚡</div>
        </div>
        <div className="text-4xl font-bold text-purple-400 mb-2">
          {stats.averageLatency ? Math.round(stats.averageLatency) : 0}ms
        </div>
        <div className="text-purple-400/70 text-xs">
          Response time
        </div>
      </div>
    </div>
  );
}