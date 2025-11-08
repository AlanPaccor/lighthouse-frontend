// src/components/StatsPanel.tsx
import type { Stats } from '../types/Trace';

interface StatsPanelProps {
  stats: Stats | null;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Cost */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-gray-400 text-sm font-medium">Total Cost</div>
        <div className="text-3xl font-bold mt-2">
          ${(stats.totalCost || 0).toFixed(6)}
        </div>
        <div className="text-green-400 text-xs mt-1">
          💰 Tracking your spend
        </div>
      </div>

      {/* Total Requests */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-gray-400 text-sm font-medium">Total Requests</div>
        <div className="text-3xl font-bold mt-2">
          {stats.totalRequests || 0}
        </div>
        <div className="text-blue-400 text-xs mt-1">
          📊 Queries tracked
        </div>
      </div>

      {/* Average Latency */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-gray-400 text-sm font-medium">Avg Latency</div>
        <div className="text-3xl font-bold mt-2">
          {stats.averageLatency ? Math.round(stats.averageLatency) : 0}ms
        </div>
        <div className="text-purple-400 text-xs mt-1">
          ⚡ Response time
        </div>
      </div>
    </div>
  );
}