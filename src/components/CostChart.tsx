// src/components/CostChart.tsx
import type { Trace } from '../types/Trace';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CostChartProps {
  traces: Trace[];
}

export default function CostChart({ traces }: CostChartProps) {
  // Prepare data for chart (last 20 traces)
  const chartData = traces
    .slice(0, 20)
    .reverse()
    .map((trace, index) => ({
      index: index + 1,
      cost: trace.costUsd * 1000000, // Convert to microdollars for readability
      latency: trace.latencyMs,
    }));

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">📈 Cost Over Time</h2>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} name="Cost (μ$)" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}