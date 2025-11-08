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
    <div className="glass-card rounded-2xl p-8 shadow-xl">
      <div className="mb-6">
        <h2 className="card-header">Cost Analytics</h2>
        <p className="card-subtitle mt-2">
          Track query costs over time (last 20 queries)
        </p>
      </div>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="font-medium">No data available</div>
          <div className="text-xs text-slate-500 mt-1">Execute queries to see cost trends</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
            <XAxis 
              dataKey="index" 
              stroke="#94a3b8" 
              style={{ fontSize: '11px', fontWeight: 500 }}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              style={{ fontSize: '11px', fontWeight: 500 }}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: '#cbd5e1', fontWeight: 600, fontSize: '12px' }}
              itemStyle={{ color: '#60a5fa', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              stroke="url(#colorGradient)" 
              strokeWidth={3} 
              name="Cost (μ$)"
              dot={{ fill: '#60a5fa', r: 5, strokeWidth: 2, stroke: '#1e3a8a' }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#1e3a8a' }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}