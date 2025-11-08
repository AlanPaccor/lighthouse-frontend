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
    <div className="glass-card rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-5 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        📈 Cost Over Time
      </h2>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <div>No data yet</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="index" 
              stroke="#9CA3AF" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                border: '1px solid rgba(55, 65, 81, 0.5)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}
              labelStyle={{ color: '#9CA3AF', fontWeight: 'bold' }}
              itemStyle={{ color: '#60A5FA' }}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              stroke="url(#colorGradient)" 
              strokeWidth={3} 
              name="Cost (μ$)"
              dot={{ fill: '#60A5FA', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}